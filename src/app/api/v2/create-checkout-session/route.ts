import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
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

    // Attach customer if exists
    if (customerId) {
      checkoutParams.customer = customerId
    } else if (user?.email) {
      checkoutParams.customer_email = user.email
    }

    // Add subscription metadata + 7-day trial
    checkoutParams.payment_method_collection = 'always'
    checkoutParams.subscription_data = {
      trial_period_days: 7,
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
