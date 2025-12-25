import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs'

// Explicit price ID mapping - Vercel requires explicit references (no dynamic access)
function getPriceId(tier: string, billingPeriod: string): string | undefined {
  // Log available env vars for debugging
  console.log('[Checkout] getPriceId called with:', { tier, billingPeriod })
  console.log('[Checkout] Available Stripe Price IDs:')
  console.log('[Checkout] - STRIPE_PRICE_PRO_MONTHLY:', process.env.STRIPE_PRICE_PRO_MONTHLY ? 'SET' : 'NOT SET')
  console.log('[Checkout] - STRIPE_PRICE_PRO_YEARLY:', process.env.STRIPE_PRICE_PRO_YEARLY ? 'SET' : 'NOT SET')
  console.log('[Checkout] - STRIPE_PRICE_PRO_PLUS_MONTHLY:', process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY ? 'SET' : 'NOT SET')
  console.log('[Checkout] - STRIPE_PRICE_PRO_PLUS_YEARLY:', process.env.STRIPE_PRICE_PRO_PLUS_YEARLY ? 'SET' : 'NOT SET')

  const normalizedTier = tier.toUpperCase().replace('-', '_')
  const isYearly = billingPeriod === 'yearly' || billingPeriod === 'annual'

  // Explicit mapping to match Vercel environment variable names exactly
  if (normalizedTier === 'PRO' || normalizedTier === 'PROFESSIONAL') {
    if (isYearly) {
      return process.env.STRIPE_PRICE_PRO_YEARLY
    }
    return process.env.STRIPE_PRICE_PRO_MONTHLY
  }

  if (normalizedTier === 'PRO_PLUS' || normalizedTier === 'PROPLUS') {
    if (isYearly) {
      return process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
    }
    return process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY
  }

  if (normalizedTier === 'STARTER' || normalizedTier === 'BASIC' || normalizedTier === 'FREE') {
    // Free tier - no price ID needed
    return undefined
  }

  if (normalizedTier === 'PREMIUM') {
    // Premium uses same prices as Pro (legacy tier)
    if (isYearly) {
      return process.env.STRIPE_PRICE_PRO_YEARLY
    }
    return process.env.STRIPE_PRICE_PRO_MONTHLY
  }

  console.log('[Checkout] Unknown tier:', normalizedTier)
  return undefined
}

export async function POST(request: NextRequest) {
  console.log('[Checkout] ====== CREATE CHECKOUT SESSION START ======')
  console.log('[Checkout] Timestamp:', new Date().toISOString())

  // Debug: Check environment variables
  console.log('[Checkout] Environment Check:')
  console.log('[Checkout] - STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
  console.log('[Checkout] - STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7))
  console.log('[Checkout] - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)

  try {
    const body = await request.json()
    console.log('[Checkout] Request Body:', JSON.stringify(body, null, 2))

    let { priceId, tierName, email, billingPeriod } = body

    // Default to monthly if not specified
    billingPeriod = billingPeriod || 'monthly'
    console.log('[Checkout] Tier:', tierName, 'Billing Period:', billingPeriod)

    // Get price ID from tier name if not provided
    if (!priceId && tierName) {
      priceId = getPriceId(tierName, billingPeriod)
      console.log('[Checkout] Resolved Price ID:', priceId || 'NOT FOUND')
    }

    if (!priceId) {
      console.error('[Checkout] ERROR: No price ID found')
      console.error('[Checkout] Tier:', tierName, 'Billing Period:', billingPeriod)

      // List all STRIPE env vars for debugging
      const stripeEnvVars = Object.keys(process.env)
        .filter(k => k.includes('STRIPE'))
        .map(k => `${k}: ${k.includes('SECRET') ? '[HIDDEN]' : (process.env[k] ? 'SET' : 'NOT SET')}`)
      console.error('[Checkout] All STRIPE env vars:', stripeEnvVars)

      return NextResponse.json(
        {
          error: 'No price configured for this tier. Please contact support.',
          debug: {
            tierName,
            billingPeriod,
            availableEnvVars: stripeEnvVars
          }
        },
        { status: 400 }
      )
    }

    console.log('[Checkout] Using Price ID:', priceId)

    // Get the current user (if logged in)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      console.log('[Checkout] Auth Error (non-fatal):', authError.message)
    }

    console.log('[Checkout] User:', user ? `${user.id} (${user.email})` : 'Not authenticated')

    let customerId = null
    let customerEmail = user?.email || email

    // If user is logged in, check for existing Stripe customer
    if (user) {
      console.log('[Checkout] Checking for existing Stripe customer...')
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', user.id)
        .single()

      if (profileError) {
        console.log('[Checkout] Profile fetch error (non-fatal):', profileError.message)
      }

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
        console.log('[Checkout] Found existing customer:', customerId)
      } else {
        console.log('[Checkout] Creating new Stripe customer...')
        try {
          const customer = await stripe.customers.create({
            email: customerEmail,
            metadata: {
              supabaseUserId: user.id,
            },
          })
          customerId = customer.id
          console.log('[Checkout] Created new customer:', customerId)

          // Save the customer ID to the user's profile
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ stripe_customer_id: customerId })
            .eq('id', user.id)

          if (updateError) {
            console.error('[Checkout] Failed to update profile with customer ID:', updateError)
          }
        } catch (stripeError: unknown) {
          const err = stripeError as { message?: string; type?: string; code?: string; statusCode?: number }
          console.error('[Checkout] Stripe customer creation error:', err.message)
          throw stripeError
        }
      }
    }

    // Create checkout session configuration
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dealsletter.com'
    const successUrl = `${baseUrl}/analysis?success=true&tier=${tierName}`
    const cancelUrl = `${baseUrl}/pricing?canceled=true`

    console.log('[Checkout] Success URL:', successUrl)
    console.log('[Checkout] Cancel URL:', cancelUrl)

    const sessionConfig: Record<string, unknown> = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      subscription_data: {
        trial_period_days: 14,
        metadata: {
          tierName: tierName || 'unknown',
          billingPeriod: billingPeriod || 'monthly',
          ...(user && { supabaseUserId: user.id }),
        },
      },
    }

    // Add customer or email to session
    if (customerId) {
      sessionConfig.customer = customerId
      console.log('[Checkout] Using existing customer:', customerId)
    } else {
      sessionConfig.customer_email = customerEmail
      console.log('[Checkout] Using customer email:', customerEmail)
    }

    // Create the checkout session
    console.log('[Checkout] Creating Stripe checkout session...')
    let session
    try {
      session = await stripe.checkout.sessions.create(sessionConfig as Parameters<typeof stripe.checkout.sessions.create>[0])
      console.log('[Checkout] Session created:', session.id)
    } catch (stripeError: unknown) {
      const err = stripeError as {
        message?: string;
        type?: string;
        code?: string;
        statusCode?: number;
        param?: string;
        requestId?: string;
      }
      console.error('[Checkout] Stripe error:', err.message)
      console.error('[Checkout] Error type:', err.type)
      console.error('[Checkout] Error code:', err.code)

      if (err.code === 'resource_missing') {
        return NextResponse.json(
          {
            error: 'Invalid price ID - the price does not exist in Stripe',
            details: { priceId, message: err.message }
          },
          { status: 400 }
        )
      }

      if (err.type === 'StripeAuthenticationError') {
        return NextResponse.json(
          { error: 'Stripe authentication failed - check API key configuration' },
          { status: 401 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create checkout session',
          details: { message: err.message, code: err.code }
        },
        { status: err.statusCode || 500 }
      )
    }

    console.log('[Checkout] ====== SUCCESS ======')
    return NextResponse.json({
      sessionId: session.id,
      url: session.url
    })
  } catch (error: unknown) {
    const err = error as { message?: string; stack?: string }
    console.error('[Checkout] Unexpected error:', err.message)
    console.error('[Checkout] Stack:', err.stack)

    return NextResponse.json(
      { error: 'Unexpected error occurred', details: { message: err.message } },
      { status: 500 }
    )
  }
}
