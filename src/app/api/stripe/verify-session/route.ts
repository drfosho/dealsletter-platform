import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

// Force Node.js runtime
export const runtime = 'nodejs'

// CRITICAL: Safely convert Stripe Unix timestamp (seconds) to ISO string
// Stripe timestamps are in SECONDS, JavaScript Date expects MILLISECONDS
function stripeTimestampToISO(timestamp: number | null | undefined): string | null {
  if (timestamp === null || timestamp === undefined) {
    return null;
  }

  // Ensure it's a valid number
  if (typeof timestamp !== 'number' || isNaN(timestamp)) {
    console.error('[VerifySession] Invalid timestamp value:', timestamp);
    return null;
  }

  // Convert seconds to milliseconds
  const milliseconds = timestamp * 1000;
  const date = new Date(milliseconds);

  // Validate the resulting date
  if (isNaN(date.getTime())) {
    console.error('[VerifySession] Invalid date from timestamp:', timestamp);
    return null;
  }

  return date.toISOString();
}

// Helper to safely get period dates from subscription (handles different Stripe API versions)
function getSubscriptionPeriodDates(subscription: Stripe.Subscription): { periodStart: Date; periodEnd: Date; periodStartISO: string; periodEndISO: string } {
  console.log('[VerifySession] Extracting period dates');

  // Try subscription level first (older API versions)
  let periodStartTs = (subscription as any).current_period_start;
  let periodEndTs = (subscription as any).current_period_end;

  console.log('[VerifySession] Subscription level timestamps:', { periodStartTs, periodEndTs });

  // Try subscription item level (newer API versions like 2025-05-28.basil)
  if (!periodStartTs && subscription.items?.data?.[0]) {
    const item = subscription.items.data[0] as any;
    periodStartTs = item.current_period_start;
    periodEndTs = item.current_period_end;
    console.log('[VerifySession] Item level timestamps:', { periodStartTs, periodEndTs });
  }

  // Fallback to trial dates if available
  if (!periodStartTs && subscription.trial_start) {
    periodStartTs = subscription.trial_start;
    console.log('[VerifySession] Using trial_start:', periodStartTs);
  }
  if (!periodEndTs && subscription.trial_end) {
    periodEndTs = subscription.trial_end;
    console.log('[VerifySession] Using trial_end:', periodEndTs);
  }

  // Final fallback to now + 30 days
  if (!periodStartTs || typeof periodStartTs !== 'number') {
    periodStartTs = Math.floor(Date.now() / 1000);
    console.log('[VerifySession] Warning: Using current time for period start:', periodStartTs);
  }
  if (!periodEndTs || typeof periodEndTs !== 'number') {
    periodEndTs = periodStartTs + (30 * 24 * 60 * 60); // 30 days
    console.log('[VerifySession] Warning: Using 30 days from start for period end:', periodEndTs);
  }

  // Convert to Date objects (timestamps are in seconds, need milliseconds)
  const periodStart = new Date(periodStartTs * 1000);
  const periodEnd = new Date(periodEndTs * 1000);

  // Validate dates
  if (isNaN(periodStart.getTime()) || isNaN(periodEnd.getTime())) {
    console.error('[VerifySession] CRITICAL: Invalid dates generated!', { periodStartTs, periodEndTs });
    // Return safe defaults
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));
    return {
      periodStart: now,
      periodEnd: thirtyDaysLater,
      periodStartISO: now.toISOString(),
      periodEndISO: thirtyDaysLater.toISOString()
    };
  }

  return {
    periodStart,
    periodEnd,
    periodStartISO: periodStart.toISOString(),
    periodEndISO: periodEnd.toISOString()
  };
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing session_id parameter' },
      { status: 400 }
    )
  }

  console.log('[VerifySession] ====== VERIFYING CHECKOUT SESSION ======')
  console.log('[VerifySession] Session ID:', sessionId)

  try {
    // Retrieve the checkout session with expanded data
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer']
    })

    console.log('[VerifySession] Session:', {
      id: session.id,
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
      subscriptionId: typeof session.subscription === 'string' ? session.subscription : (session.subscription as any)?.id
    })

    // Get tier from subscription metadata
    let tier = 'pro'
    let subscriptionData: any = null

    if (session.subscription) {
      const subscriptionId = typeof session.subscription === 'string'
        ? session.subscription
        : (session.subscription as any).id

      try {
        subscriptionData = await stripe.subscriptions.retrieve(subscriptionId)
        // Handle both old (tier) and new (tierName) metadata keys
        tier = (subscriptionData.metadata?.tierName || subscriptionData.metadata?.tier || 'pro').toLowerCase()
        console.log('[VerifySession] Subscription retrieved:', {
          id: subscriptionData.id,
          status: subscriptionData.status,
          tier: tier,
          currentPeriodEnd: subscriptionData.current_period_end,
          trialEnd: subscriptionData.trial_end
        })
      } catch (subError) {
        console.error('[VerifySession] Failed to retrieve subscription:', subError)
      }
    }

    // If session is complete and we have subscription data, update the database
    if (session.status === 'complete' && subscriptionData) {
      const supabase = await createClient()

      // Get the current user
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError) {
        console.log('[VerifySession] Auth warning:', authError.message)
      }

      // Get user ID from subscription metadata or current session
      const userId = subscriptionData.metadata?.supabaseUserId || user?.id
      const customerId = typeof session.customer === 'string'
        ? session.customer
        : (session.customer as any)?.id

      if (userId) {
        console.log('[VerifySession] Updating database for user:', userId)

        // Normalize tier name for database
        const normalizedTier = tier.toLowerCase().replace('_', '-')

        // Get period dates safely (handles different Stripe API versions)
        const { periodStartISO, periodEndISO } = getSubscriptionPeriodDates(subscriptionData)
        console.log('[VerifySession] Period:', periodStartISO, 'to', periodEndISO)

        // Update or create subscription record
        const { error: upsertError } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionData.id,
            stripe_price_id: subscriptionData.items?.data?.[0]?.price?.id,
            status: subscriptionData.status,
            tier: normalizedTier,
            current_period_start: periodStartISO,
            current_period_end: periodEndISO,
            cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
            trial_start: stripeTimestampToISO(subscriptionData.trial_start),
            trial_end: stripeTimestampToISO(subscriptionData.trial_end),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          })

        if (upsertError) {
          console.error('[VerifySession] Database upsert error:', upsertError)
        } else {
          console.log('[VerifySession] ✅ Subscription record created/updated successfully')
        }

        // Also update the profiles table with stripe_customer_id if present
        if (customerId) {
          const { error: profileError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', userId)

          if (profileError) {
            console.log('[VerifySession] Profile update warning:', profileError.message)
          }
        }

        // Initialize usage tracking for the new subscription period

        await supabase
          .from('usage_tracking')
          .upsert({
            user_id: userId,
            subscription_id: subscriptionData.id,
            period_start: periodStartISO,
            period_end: periodEndISO,
            analysis_count: 0
          }, {
            onConflict: 'user_id,period_start'
          })

        console.log('[VerifySession] Usage tracking initialized')
      } else {
        console.log('[VerifySession] Warning: No user ID found, database not updated')
      }
    }

    console.log('[VerifySession] ====== VERIFICATION COMPLETE ======')

    return NextResponse.json({
      status: session.status,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_email || session.customer_details?.email,
      tier: tier,
      trialEnd: stripeTimestampToISO(subscriptionData?.trial_end)
    })
  } catch (error: unknown) {
    const err = error as { message?: string }
    console.error('[VerifySession] Error:', err.message)

    return NextResponse.json(
      { error: 'Failed to verify session', status: 'error' },
      { status: 500 }
    )
  }
}
