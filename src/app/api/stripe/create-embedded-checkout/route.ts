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

    // Build return URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.com'
    const returnUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`

    console.log('[EmbeddedCheckout] Return URL:', returnUrl)

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
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          tier: tier,
          period: period,
          ...(user && { supabaseUserId: user.id }),
        },
      },
      allow_promotion_codes: true,
      ...(user?.email && { customer_email: user.email }),
    }

    const session = await stripe.checkout.sessions.create(sessionConfig)

    console.log('[EmbeddedCheckout] Session created:', session.id)
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
