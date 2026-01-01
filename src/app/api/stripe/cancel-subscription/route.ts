import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

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

    // Get user's subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, stripe_customer_id, tier, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'trialing'])
      .single();

    console.log('[CancelSubscription] Current subscription:', subscription);

    if (subError) {
      console.log('[CancelSubscription] Subscription query error:', subError);
    }

    if (!subscription?.stripe_subscription_id) {
      console.log('[CancelSubscription] No active subscription found');
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      );
    }

    console.log('[CancelSubscription] Canceling Stripe subscription:', subscription.stripe_subscription_id);

    // Cancel the subscription at period end
    const updatedSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      { cancel_at_period_end: true }
    );

    console.log('[CancelSubscription] Stripe updated:', {
      id: updatedSubscription.id,
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      cancel_at: updatedSubscription.cancel_at,
      current_period_end: (updatedSubscription as any).current_period_end
    });

    // Update in database
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        cancel_at: updatedSubscription.cancel_at ?
          new Date(updatedSubscription.cancel_at * 1000).toISOString() : null
      })
      .eq('stripe_subscription_id', subscription.stripe_subscription_id);

    if (updateError) {
      console.error('[CancelSubscription] Database update error:', updateError);
    } else {
      console.log('[CancelSubscription] Database updated successfully');
    }

    const cancelDate = (updatedSubscription as any).current_period_end
      ? new Date((updatedSubscription as any).current_period_end * 1000).toISOString()
      : null;

    console.log('[CancelSubscription] Cancellation successful, access until:', cancelDate);

    return NextResponse.json({
      success: true,
      cancel_at: updatedSubscription.cancel_at,
      current_period_end: cancelDate,
      message: `Subscription will cancel at end of billing period${cancelDate ? ` (${new Date(cancelDate).toLocaleDateString()})` : ''}`
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