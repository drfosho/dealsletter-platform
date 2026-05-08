import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendV2CancellationEmail } from '@/lib/v2-emails';

// Force Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  console.log('[CancelSubscription] Processing cancellation request...');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[CancelSubscription] Auth error:', authError?.message);
      return NextResponse.json(
        { error: 'You must be logged in to cancel subscription' },
        { status: 401 }
      );
    }

    console.log('[CancelSubscription] User ID:', user.id);

    // Get stripe_subscription_id — check user_profiles first, then subscriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_subscription_id')
      .eq('id', user.id)
      .single();

    let stripeSubscriptionId = profile?.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single();

      stripeSubscriptionId = subscription?.stripe_subscription_id;
    }

    console.log('[CancelSubscription] Stripe subscription ID:', stripeSubscriptionId);

    if (!stripeSubscriptionId) {
      console.log('[CancelSubscription] No active subscription found');
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    console.log('[CancelSubscription] Canceling Stripe subscription:', stripeSubscriptionId);

    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      { cancel_at_period_end: true }
    );

    // Extract timestamps — handle both subscription-level and item-level fields
    const cancelAtTs = updatedSubscription.cancel_at;
    const periodEndTs = (updatedSubscription as any).current_period_end
      || updatedSubscription.items?.data?.[0]?.current_period_end;

    // Convert Unix timestamps (seconds) to ISO strings
    const cancelAtISO = cancelAtTs ? new Date(cancelAtTs * 1000).toISOString() : null;
    const periodEndISO = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null;
    // Use cancel_at as the access-until date (Stripe sets this to period end when cancel_at_period_end=true)
    const accessUntilISO = cancelAtISO || periodEndISO;

    console.log('[CancelSubscription] Stripe updated:', {
      id: updatedSubscription.id,
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      cancel_at: cancelAtTs,
      cancelAtISO,
      periodEndTs,
      periodEndISO,
      accessUntilISO,
    });

    // Update user_profiles
    const { error: profileUpdateError } = await supabase
      .from('user_profiles')
      .update({
        cancel_at_period_end: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('[CancelSubscription] Profile update error:', JSON.stringify(profileUpdateError));
    }

    // Also update subscriptions table if it has a row
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancel_at: accessUntilISO,
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      console.error('[CancelSubscription] Subscriptions table update error:', JSON.stringify(updateError));
    } else {
      console.log('[CancelSubscription] Database updated successfully');
    }

    console.log('[CancelSubscription] Cancellation successful, access until:', accessUntilISO);

    // Send cancellation confirmation email — exactly once per subscription cycle.
    // Atomic claim on cancellation_email_pending_sent prevents duplicates if the user
    // double-clicks cancel or the request is retried. The final "your subscription has
    // ended" email is sent separately from the customer.subscription.deleted webhook.
    const customerEmail = user.email;
    if (customerEmail) {
      // Use admin client for the claim — RLS may block the user-scoped client
      // from updating this column, which would silently make the claim no-op
      // and prevent the email send. Same pattern used by other atomic claims.
      const admin = createAdminClient();
      const { data: claimed } = await admin
        .from('user_profiles')
        .update({ cancellation_email_pending_sent: true })
        .eq('id', user.id)
        .or('cancellation_email_pending_sent.is.null,cancellation_email_pending_sent.eq.false')
        .select('id')
        .maybeSingle();

      if (claimed) {
        const accessUntilFormatted = accessUntilISO
          ? new Date(accessUntilISO).toLocaleDateString('en-US', {
              month: 'long', day: 'numeric', year: 'numeric'
            })
          : 'the end of your billing period';

        const firstName = (user.user_metadata?.full_name as string | undefined)?.split(' ')[0];

        try {
          await sendV2CancellationEmail(
            customerEmail,
            firstName,
            accessUntilFormatted
          );
          console.log('[CancelSubscription] ✉️ Cancellation email sent to:', customerEmail);
        } catch (emailErr) {
          console.error('[CancelSubscription] Email error:', emailErr);
        }
      } else {
        console.log('[CancelSubscription] Cancellation email already sent for this cycle — skipping');
      }
    }

    return NextResponse.json({
      success: true,
      cancel_at: accessUntilISO,
      current_period_end: accessUntilISO,
      message: accessUntilISO
        ? `Subscription will cancel on ${new Date(accessUntilISO).toLocaleDateString()}`
        : 'Subscription will cancel at end of billing period',
    });
  } catch (error) {
    console.error('[CancelSubscription] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to cancel subscription: ' + errorMessage },
      { status: 500 }
    );
  }
}