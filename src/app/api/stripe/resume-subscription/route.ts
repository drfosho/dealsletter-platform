import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';

// Force Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs';

export async function POST(_request: NextRequest) {
  console.log('[ResumeSubscription] Processing resume request...');

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      console.log('[ResumeSubscription] Auth error:', authError?.message);
      return NextResponse.json(
        { error: 'You must be logged in to resume subscription' },
        { status: 401 }
      );
    }

    console.log('[ResumeSubscription] User ID:', user.id);

    // Get stripe_subscription_id — check user_profiles first, then subscriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('stripe_subscription_id, cancel_at_period_end')
      .eq('id', user.id)
      .single();

    let stripeSubscriptionId = profile?.stripe_subscription_id;

    if (!stripeSubscriptionId) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('stripe_subscription_id')
        .eq('user_id', user.id)
        .eq('cancel_at_period_end', true)
        .single();

      stripeSubscriptionId = subscription?.stripe_subscription_id;
    }

    console.log('[ResumeSubscription] Stripe subscription ID:', stripeSubscriptionId);

    if (!stripeSubscriptionId) {
      console.log('[ResumeSubscription] No subscription to resume found');
      return NextResponse.json(
        { error: 'No subscription to resume found' },
        { status: 404 }
      );
    }

    console.log('[ResumeSubscription] Resuming Stripe subscription:', stripeSubscriptionId);

    // Resume the subscription
    const updatedSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      { cancel_at_period_end: false }
    );

    console.log('[ResumeSubscription] Stripe updated:', {
      id: updatedSubscription.id,
      cancel_at_period_end: updatedSubscription.cancel_at_period_end,
      status: updatedSubscription.status
    });

    // Update user_profiles
    await supabase
      .from('user_profiles')
      .update({
        cancel_at_period_end: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Also update subscriptions table if it has a row
    const { error: updateError } = await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        cancel_at: null
      })
      .eq('stripe_subscription_id', stripeSubscriptionId);

    if (updateError) {
      console.error('[ResumeSubscription] Subscriptions table update error:', updateError);
    } else {
      console.log('[ResumeSubscription] Database updated successfully');
    }

    console.log('[ResumeSubscription] Subscription resumed successfully');

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully! Your plan will continue without interruption.'
    });
  } catch (error) {
    console.error('[ResumeSubscription] Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to resume subscription: ' + errorMessage },
      { status: 500 }
    );
  }
}