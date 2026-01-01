import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime
export const runtime = 'nodejs'

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
        tier = subscriptionData.metadata?.tierName?.toLowerCase() || 'pro'
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
            current_period_start: new Date(subscriptionData.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscriptionData.current_period_end * 1000).toISOString(),
            cancel_at_period_end: subscriptionData.cancel_at_period_end || false,
            trial_start: subscriptionData.trial_start
              ? new Date(subscriptionData.trial_start * 1000).toISOString()
              : null,
            trial_end: subscriptionData.trial_end
              ? new Date(subscriptionData.trial_end * 1000).toISOString()
              : null,
            metadata: subscriptionData.metadata || {},
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
        const periodStart = new Date(subscriptionData.current_period_start * 1000)
        const periodEnd = new Date(subscriptionData.current_period_end * 1000)

        await supabase
          .from('usage_tracking')
          .upsert({
            user_id: userId,
            subscription_id: subscriptionData.id,
            period_start: periodStart.toISOString(),
            period_end: periodEnd.toISOString(),
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
      trialEnd: subscriptionData?.trial_end
        ? new Date(subscriptionData.trial_end * 1000).toISOString()
        : null
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
