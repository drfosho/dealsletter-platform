import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

// Force Node.js runtime to ensure env vars are accessible
export const runtime = 'nodejs'

// Explicit price ID mapping - Vercel requires explicit references (no dynamic access)
function getPriceId(tier: string, billingPeriod: string): string | undefined {
  console.log('[getPriceId] ========== PRICE LOOKUP START ==========')
  console.log('[getPriceId] Input tier:', JSON.stringify(tier))
  console.log('[getPriceId] Input billingPeriod:', JSON.stringify(billingPeriod))

  // Log ALL Stripe env vars (explicit references required for Vercel)
  const envVars = {
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? `SET (${process.env.STRIPE_SECRET_KEY.substring(0, 10)}...)` : 'MISSING',
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'MISSING',
    STRIPE_PRICE_PRO_YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY || 'MISSING',
    STRIPE_PRICE_PRO_PLUS_MONTHLY: process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY || 'MISSING',
    STRIPE_PRICE_PRO_PLUS_YEARLY: process.env.STRIPE_PRICE_PRO_PLUS_YEARLY || 'MISSING',
  }
  console.log('[getPriceId] Environment variables:', JSON.stringify(envVars, null, 2))

  // Normalize inputs
  const normalizedTier = (tier || '').toUpperCase().replace(/-/g, '_').trim()
  const normalizedPeriod = (billingPeriod || 'monthly').toLowerCase().trim()
  const isYearly = normalizedPeriod === 'yearly' || normalizedPeriod === 'annual'

  console.log('[getPriceId] Normalized tier:', normalizedTier)
  console.log('[getPriceId] Normalized period:', normalizedPeriod)
  console.log('[getPriceId] Is yearly:', isYearly)

  let priceId: string | undefined

  // Explicit mapping to match Vercel environment variable names exactly
  if (normalizedTier === 'PRO' || normalizedTier === 'PROFESSIONAL') {
    priceId = isYearly
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY
    console.log('[getPriceId] Matched PRO tier, priceId:', priceId || 'NOT FOUND')
  } else if (normalizedTier === 'PRO_PLUS' || normalizedTier === 'PROPLUS') {
    priceId = isYearly
      ? process.env.STRIPE_PRICE_PRO_PLUS_YEARLY
      : process.env.STRIPE_PRICE_PRO_PLUS_MONTHLY
    console.log('[getPriceId] Matched PRO_PLUS tier, priceId:', priceId || 'NOT FOUND')
  } else if (normalizedTier === 'STARTER' || normalizedTier === 'BASIC' || normalizedTier === 'FREE') {
    console.log('[getPriceId] Free tier - no price ID needed')
    priceId = undefined
  } else if (normalizedTier === 'PREMIUM') {
    // Premium uses same prices as Pro (legacy tier)
    priceId = isYearly
      ? process.env.STRIPE_PRICE_PRO_YEARLY
      : process.env.STRIPE_PRICE_PRO_MONTHLY
    console.log('[getPriceId] Matched PREMIUM tier (using Pro prices), priceId:', priceId || 'NOT FOUND')
  } else {
    console.log('[getPriceId] ❌ Unknown tier:', normalizedTier)
    console.log('[getPriceId] Expected one of: PRO, PRO_PLUS, PROFESSIONAL, PROPLUS, STARTER, BASIC, FREE, PREMIUM')
    priceId = undefined
  }

  console.log('[getPriceId] ========== RESULT:', priceId || 'undefined', '==========')
  return priceId
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

    // CRITICAL: Check for existing active subscription to prevent duplicates
    if (user) {
      const { data: existingSub } = await supabase
        .from('subscriptions')
        .select('tier, status, stripe_subscription_id')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (existingSub?.stripe_subscription_id) {
        console.log('[Checkout] User already has active subscription:', existingSub)

        // Check if trying to subscribe to same tier
        const normalizedExistingTier = existingSub.tier?.toLowerCase().replace('-', '_')
        const normalizedNewTier = tierName?.toLowerCase().replace('-', '_')

        if (normalizedExistingTier === normalizedNewTier) {
          return NextResponse.json(
            { error: 'You are already subscribed to this plan. Visit your account page to manage your subscription.' },
            { status: 400 }
          )
        } else {
          return NextResponse.json(
            { error: 'You have an active subscription. Please cancel it first before switching plans, or use the billing portal to change plans.' },
            { status: 400 }
          )
        }
      }
    }

    // Create checkout session configuration
    // CRITICAL: Validate base URL is set
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
    if (!baseUrl) {
      console.error('[Checkout] ❌ NEXT_PUBLIC_APP_URL is not set!')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      )
    }

    // CRITICAL: Use proper success URL with session_id for verification
    const successUrl = `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/pricing?canceled=true`

    console.log('[Checkout] Base URL:', baseUrl)
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
      // Add session-level metadata for webhook access
      metadata: {
        tierName: tierName || 'unknown',
        billingPeriod: billingPeriod || 'monthly',
        ...(user && { supabaseUserId: user.id }),
      },
      allow_promotion_codes: true,
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
