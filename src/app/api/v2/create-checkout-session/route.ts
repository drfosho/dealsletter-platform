import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/admin'

const stripe = new Stripe(
  process.env.STRIPE_SECRET_KEY!,
  { apiVersion: '2025-07-30.basil' }
)

// Map V2 tier + billing period to the correct price ID
function getPriceId(
  tier: string,
  billingPeriod: string
): string | null {
  const map: Record<string, Record<string, string>> = {
    pro: {
      monthly: process.env.STRIPE_PRICE_V2_PRO_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_V2_PRO_YEARLY!,
    },
    pro_max: {
      monthly: process.env.STRIPE_PRICE_V2_PRO_MAX_MONTHLY!,
      yearly: process.env.STRIPE_PRICE_V2_PRO_MAX_YEARLY!,
    }
  }
  return map[tier]?.[billingPeriod] || null
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { tier, billingPeriod = 'monthly' } = body

    // Validate inputs
    if (!tier || !['pro', 'pro_max'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier' },
        { status: 400 }
      )
    }

    const priceId = getPriceId(tier, billingPeriod)
    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not found' },
        { status: 400 }
      )
    }

    // Get user session if logged in
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    const { data: { session } } = await supabase.auth.getSession()
    const user = session?.user

    // Look up existing Stripe customer ID
    let customerId: string | undefined
    const admin = createAdminClient()

    if (user) {
      const { data: profile } = await admin
        .from('user_profiles')
        .select('stripe_customer_id, subscription_status, subscription_tier')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        // Reuse existing customer
        customerId = profile.stripe_customer_id

        // --- TRIAL DEDUP CHECK ---
        // If already trialing or active on
        // a paid tier, block new trial
        const isOnPaidTier =
          profile.subscription_tier !== 'free' &&
          profile.subscription_tier !== null
        const isTrialingOrActive =
          profile.subscription_status ===
            'trialing' ||
          profile.subscription_status ===
            'active'

        if (isOnPaidTier && isTrialingOrActive) {
          return NextResponse.json(
            {
              error: 'already_subscribed',
              message: 'You already have an active subscription or trial.'
            },
            { status: 409 }
          )
        }

        // Double-check via Stripe directly
        // in case DB is stale
        try {
          const activeSubs = await stripe
            .subscriptions.list({
              customer: customerId,
              status: 'trialing',
              limit: 1,
            })
          if (activeSubs.data.length > 0) {
            return NextResponse.json(
              {
                error: 'already_subscribed',
                message: 'You already have an active trial.'
              },
              { status: 409 }
            )
          }
        } catch (stripeErr) {
          // Non-fatal — continue to checkout
          console.error(
            'Stripe subscription check error:',
            stripeErr
          )
        }

      } else if (user.email) {
        // No customer ID saved — check Stripe
        // by email before creating a new one
        try {
          const existing = await stripe
            .customers.list({
              email: user.email,
              limit: 5,
            })

          if (existing.data.length > 0) {
            // Reuse the most recent customer
            // that has no active trial
            let reusableCustomer: Stripe.Customer | null = null

            for (const c of existing.data) {
              const subs = await stripe
                .subscriptions.list({
                  customer: c.id,
                  status: 'trialing',
                  limit: 1,
                })

              if (subs.data.length > 0) {
                // This customer already has
                // an active trial — block
                return NextResponse.json(
                  {
                    error: 'already_subscribed',
                    message: 'You already have an active trial.'
                  },
                  { status: 409 }
                )
              }

              if (!reusableCustomer) {
                reusableCustomer = c
              }
            }

            if (reusableCustomer) {
              customerId = reusableCustomer.id
            }
          }
        } catch (stripeErr) {
          console.error(
            'Stripe customer lookup error:',
            stripeErr
          )
        }

        // Create new customer if none found
        if (!customerId) {
          const customer = await stripe
            .customers.create(
              {
                email: user.email,
                metadata: {
                  supabaseUserId: user.id,
                },
              },
              {
                // Idempotency key prevents
                // duplicate customers on
                // concurrent requests
                idempotencyKey:
                  `customer-${user.id}`,
              }
            )
          customerId = customer.id
        }

        // Save immediately — before checkout
        // opens, so next click finds it
        await admin
          .from('user_profiles')
          .update({
            stripe_customer_id: customerId
          })
          .eq('id', user.id)
      }
    }

    const host = request.headers.get('host') || ''
    const protocol = host.includes('localhost') ? 'http' : 'https'
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`

    console.log('Checkout session appUrl:', appUrl)

    // Build checkout session params
    const checkoutParams: Stripe.Checkout.SessionCreateParams = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${appUrl}/v2/success?session_id={CHECKOUT_SESSION_ID}&source=checkout`,
      cancel_url: `${appUrl}/v2/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      metadata: {
        tier,
        billingPeriod,
        userId: user?.id || '',
        source: 'v2'
      }
    }

    // Always use explicit customer ID
    // Never fall back to customer_email
    // which causes Stripe to create
    // a new customer every time
    if (customerId) {
      checkoutParams.customer = customerId
    } else {
      // Unauthenticated user —
      // Stripe creates customer at checkout
      // (no dedup needed, no saved ID)
      if (user?.email) {
        checkoutParams.customer_email =
          user.email
      }
    }

    // Add subscription metadata + 7-day trial
    // No card required up front. If the trial ends without a payment method
    // attached, Stripe cancels the subscription via trial_settings below.
    checkoutParams.payment_method_collection = 'if_required'
    checkoutParams.subscription_data = {
      trial_period_days: 7,
      trial_settings: {
        end_behavior: {
          missing_payment_method: 'cancel'
        }
      },
      metadata: {
        tier,
        billingPeriod,
        userId: user?.id || '',
        source: 'v2'
      }
    }

    const checkoutSession = await stripe.checkout.sessions.create(checkoutParams)

    return NextResponse.json({
      url: checkoutSession.url
    })

  } catch (err: any) {
    console.error('V2 Checkout error:', err)
    return NextResponse.json(
      { error: err.message || 'Checkout failed' },
      { status: 500 }
    )
  }
}
