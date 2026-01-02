import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime for env var access
export const runtime = 'nodejs'

// Get price ID based on tier and period
function getPriceId(tier: string, period: string): string | undefined {
  const normalizedTier = (tier || '').toUpperCase().replace(/-/g, '_').trim()
  const isYearly = period === 'yearly' || period === 'annual'

  console.log('[EmbeddedCheckout] Getting price for:', { tier: normalizedTier, isYearly })

  if (normalizedTier === 'PRO' || normalizedTier === 'PROFESSIONAL') {
    return isYearly
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY
  }

  if (normalizedTier === 'PRO_PLUS' || normalizedTier === 'PROPLUS') {
    return isYearly
      ? process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
      : process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY
  }

  return undefined
}

export async function POST(request: NextRequest) {
  console.log('[EmbeddedCheckout] ====== START ======')

  try {
    const body = await request.json()
    const { tier, period = 'monthly' } = body

    console.log('[EmbeddedCheckout] Request:', { tier, period })

    // Get price ID
    const priceId = getPriceId(tier, period)

    if (!priceId) {
      console.error('[EmbeddedCheckout] No price ID found for:', { tier, period })
      return NextResponse.json(
        { error: 'Invalid tier or period specified' },
        { status: 400 }
      )
    }

    console.log('[EmbeddedCheckout] Using price ID:', priceId)

    // Get current user
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    console.log('[EmbeddedCheckout] User:', user?.email || 'Not authenticated')

    // Check for existing active subscription to prevent duplicates
    if (user) {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('tier, status, stripe_subscription_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (existingSub?.stripe_subscription_id) {
        console.log('[EmbeddedCheckout] User already has active subscription:', existingSub)
        const normalizedExistingTier = existingSub.tier?.toLowerCase().replace('-', '_')
        const normalizedNewTier = tier?.toLowerCase().replace('-', '_')

        if (normalizedExistingTier === normalizedNewTier) {
          return NextResponse.json(
            { error: 'You are already subscribed to this plan.' },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: 'You have an active subscription. Please cancel it first or use the billing portal to change plans.' },
            { status: 400 }
          )
        }
      }
    }

    // Build return URL - use NEXT_PUBLIC_APP_URL or fallback to Vercel URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') // Remove trailing slash

    // Fallback to Vercel URL for preview deployments
    if (!baseUrl && process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
      console.log('[EmbeddedCheckout] Using VERCEL_URL:', baseUrl)
    }

    // Fallback to localhost for local development
    if (!baseUrl) {
      const isDev = process.env.NODE_ENV === 'development'
      if (isDev) {
        baseUrl = 'http://localhost:3000'
        console.log('[EmbeddedCheckout] Using localhost fallback for development')
      } else {
        console.error('[EmbeddedCheckout] ❌ No base URL available!')
        return NextResponse.json(
          { error: 'Server configuration error. Please contact support.' },
          { status: 500 }
        )
      }
    }
    const returnUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`

    console.log('[EmbeddedCheckout] Return URL:', returnUrl)

    // Check for existing Stripe customer
    let customerId: string | undefined
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
        console.log('[EmbeddedCheckout] Found existing customer:', customerId)
      } else {
        // Also check subscriptions table
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', user.id)
          .not('stripe_customer_id', 'is', null)
          .limit(1)
          .single()

        if (sub?.stripe_customer_id) {
          customerId = sub.stripe_customer_id
          console.log('[EmbeddedCheckout] Found customer from subscriptions:', customerId)
        }
      }
    }

    // Normalize tier name for consistency with webhook
    const tierName = tier?.toUpperCase().replace(/-/g, '_') || 'PRO'
    const billingPeriod = period || 'monthly'

    // Create checkout session in embedded mode
    const sessionConfig = {
      ui_mode: 'embedded' as const,
      mode: 'subscription' as const,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      return_url: returnUrl,
      // Session-level metadata for webhook access
      metadata: {
        tierName: tierName,
        billingPeriod: billingPeriod,
        ...(user && { supabaseUserId: user.id }),
      },
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          tierName: tierName,
          billingPeriod: billingPeriod,
          ...(user && { supabaseUserId: user.id }),
        },
      },
      allow_promotion_codes: true,
      // Add customer or email
      ...(customerId && { customer: customerId }),
      ...(!customerId && user?.email && { customer_email: user.email }),
    }

    if (customerId) {
      console.log('[EmbeddedCheckout] Using existing customer:', customerId)
    } else if (user?.email) {
      console.log('[EmbeddedCheckout] Using customer email:', user.email)
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('[EmbeddedCheckout] Session created:', session.id)
    console.log('[EmbeddedCheckout] Session metadata:', session.metadata)
    console.log('[EmbeddedCheckout] ====== SUCCESS ======')

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id
    })
  } catch (error: unknown) {
    const err = error as { message?: string; type?: string; code?: string }
    console.error('[EmbeddedCheckout] Error:', err.message)
    console.error('[EmbeddedCheckout] Type:', err.type)

    return NextResponse.json(
      { error: err.message || 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
