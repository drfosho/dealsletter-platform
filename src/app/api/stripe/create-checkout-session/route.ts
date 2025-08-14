import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  console.log('[Checkout] ====== CREATE CHECKOUT SESSION DEBUG START ======')
  console.log('[Checkout] Timestamp:', new Date().toISOString())
  console.log('[Checkout] Environment:', process.env.NODE_ENV)
  
  // Debug: Check environment variables
  console.log('[Checkout] Environment Variables Check:')
  console.log('[Checkout] - STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY)
  console.log('[Checkout] - STRIPE_SECRET_KEY length:', process.env.STRIPE_SECRET_KEY?.length)
  console.log('[Checkout] - STRIPE_SECRET_KEY prefix:', process.env.STRIPE_SECRET_KEY?.substring(0, 7))
  console.log('[Checkout] - NEXT_PUBLIC_APP_URL:', process.env.NEXT_PUBLIC_APP_URL)
  console.log('[Checkout] - Is Test Mode:', process.env.STRIPE_SECRET_KEY?.includes('sk_test'))
  
  try {
    const body = await request.json()
    console.log('[Checkout] Request Body:', JSON.stringify(body, null, 2))
    
    let { priceId, tierName, email } = body

    // Fallback: If priceId is missing, try to map from tierName
    if (!priceId && tierName) {
      console.log('[Checkout] Price ID missing, attempting to map from tier name:', tierName)
      
      // Try all possible environment variable naming conventions
      const upperTier = tierName.toUpperCase()
      
      // Log all available environment variables for debugging
      console.log('[Checkout] Checking environment variables for tier:', upperTier)
      console.log('[Checkout] - STRIPE_PRICE_' + upperTier + '_MONTHLY:', process.env[`STRIPE_PRICE_${upperTier}_MONTHLY`])
      console.log('[Checkout] - NEXT_PUBLIC_STRIPE_PRICE_' + upperTier + '_MONTHLY:', process.env[`NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_MONTHLY`])
      console.log('[Checkout] - NEXT_PUBLIC_STRIPE_PRICE_' + upperTier + ':', process.env[`NEXT_PUBLIC_STRIPE_PRICE_${upperTier}`])
      console.log('[Checkout] - NEXT_PUBLIC_STRIPE_PRICE_ID_' + upperTier + ':', process.env[`NEXT_PUBLIC_STRIPE_PRICE_ID_${upperTier}`])
      
      // Try multiple naming conventions in priority order
      const possibleEnvVars = [
        `STRIPE_PRICE_${upperTier}_MONTHLY`,           // Server-side env var format
        `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_MONTHLY`, // Client-side with MONTHLY
        `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}`,       // Client-side without MONTHLY
        `NEXT_PUBLIC_STRIPE_PRICE_ID_${upperTier}`,    // Client-side with ID
        `STRIPE_PRICE_${upperTier}`,                   // Server-side without MONTHLY
      ]
      
      for (const envVar of possibleEnvVars) {
        const value = process.env[envVar]
        console.log(`[Checkout] Checking ${envVar}: ${value ? 'FOUND' : 'not found'}`)
        if (value) {
          priceId = value
          console.log(`[Checkout] ✅ Found price ID in ${envVar}: ${priceId}`)
          break
        }
      }
      
      // Also try the hardcoded mapping as fallback
      if (!priceId) {
        const tierToPriceMap: Record<string, string | undefined> = {
          'STARTER': process.env.STRIPE_PRICE_STARTER_MONTHLY || 
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY ||
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER,
          'PRO': process.env.STRIPE_PRICE_PRO_MONTHLY || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ||
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO,
          'PREMIUM': process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ||
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 
                     process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM,
        }
        
        priceId = tierToPriceMap[upperTier]
        console.log('[Checkout] Hardcoded mapping result:', tierToPriceMap)
      }
      
      console.log('[Checkout] Final mapped price ID:', priceId || 'NOT FOUND')
      
      if (!priceId) {
        console.error('[Checkout] ERROR: Could not map tier to price ID')
        console.error('[Checkout] All Stripe env vars:', Object.keys(process.env).filter(k => k.includes('STRIPE')))
      }
    }

    if (!priceId) {
      console.error('[Checkout] ERROR: Price ID is missing after mapping attempt')
      console.error('[Checkout] Available env vars with STRIPE_PRICE:', 
        Object.keys(process.env)
          .filter(k => k.includes('STRIPE_PRICE'))
          .map(k => `${k}=${process.env[k]?.substring(0, 15)}...`)
      )
      return NextResponse.json(
        { 
          error: 'Price ID is required',
          debug: { 
            priceId, 
            tierName, 
            email,
            availableEnvVars: Object.keys(process.env).filter(k => k.includes('STRIPE_PRICE'))
          }
        },
        { status: 400 }
      )
    }

    console.log('[Checkout] Price ID:', priceId)
    console.log('[Checkout] Tier Name:', tierName)
    console.log('[Checkout] Email:', email)

    // Get the current user (if logged in)
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError) {
      console.log('[Checkout] Auth Error (non-fatal):', authError.message)
    }
    
    console.log('[Checkout] User:', user ? `${user.id} (${user.email})` : 'Not authenticated')

    // Allow both authenticated and unauthenticated users
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
        } catch (stripeError: any) {
          console.error('[Checkout] Stripe customer creation error:', {
            message: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            statusCode: stripeError.statusCode,
            raw: stripeError.raw
          })
          throw stripeError
        }
      }
    }

    // Create checkout session configuration
    const successUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?success=true&tier=${tierName}`
    const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/pricing?canceled=true`
    
    console.log('[Checkout] URLs:')
    console.log('[Checkout] - Success URL:', successUrl)
    console.log('[Checkout] - Cancel URL:', cancelUrl)

    const sessionConfig: any = {
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
        trial_period_days: 14, // 14-day free trial
        metadata: {
          tierName: tierName || 'unknown',
        },
      },
    }

    // Add customer or email to session
    if (customerId) {
      sessionConfig.customer = customerId
      if (user) {
        sessionConfig.subscription_data.metadata.supabaseUserId = user.id
      }
      console.log('[Checkout] Using existing customer:', customerId)
    } else {
      // For unauthenticated users, collect email during checkout
      sessionConfig.customer_email = customerEmail
      console.log('[Checkout] Using customer email:', customerEmail)
    }

    console.log('[Checkout] Session Config:', JSON.stringify(sessionConfig, null, 2))

    // Create the checkout session
    console.log('[Checkout] Creating Stripe checkout session...')
    let session
    try {
      session = await stripe.checkout.sessions.create(sessionConfig)
      console.log('[Checkout] Session created successfully:', session.id)
      console.log('[Checkout] Session URL:', session.url)
    } catch (stripeError: any) {
      console.error('[Checkout] ❌ STRIPE SESSION CREATION ERROR:')
      console.error('[Checkout] Error Type:', stripeError.type)
      console.error('[Checkout] Error Code:', stripeError.code)
      console.error('[Checkout] Error Message:', stripeError.message)
      console.error('[Checkout] Status Code:', stripeError.statusCode)
      console.error('[Checkout] Request ID:', stripeError.requestId)
      
      if (stripeError.raw) {
        console.error('[Checkout] Raw Error:', JSON.stringify(stripeError.raw, null, 2))
      }
      
      // Check for specific error types
      if (stripeError.code === 'resource_missing') {
        console.error('[Checkout] RESOURCE MISSING - Price ID may not exist:', priceId)
        return NextResponse.json(
          { 
            error: 'Invalid price ID - the price does not exist in Stripe',
            details: {
              priceId,
              message: stripeError.message,
              code: stripeError.code
            }
          },
          { status: 400 }
        )
      }
      
      if (stripeError.type === 'StripeInvalidRequestError') {
        console.error('[Checkout] INVALID REQUEST - Check parameters')
        return NextResponse.json(
          { 
            error: 'Invalid request to Stripe API',
            details: {
              message: stripeError.message,
              param: stripeError.param,
              code: stripeError.code,
              type: stripeError.type
            }
          },
          { status: 400 }
        )
      }
      
      if (stripeError.type === 'StripeAuthenticationError') {
        console.error('[Checkout] AUTHENTICATION ERROR - Check API key')
        return NextResponse.json(
          { 
            error: 'Stripe authentication failed - check API key configuration',
            details: {
              message: stripeError.message,
              code: stripeError.code
            }
          },
          { status: 401 }
        )
      }
      
      // Generic error response with details
      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: {
            message: stripeError.message,
            type: stripeError.type,
            code: stripeError.code,
            statusCode: stripeError.statusCode
          }
        },
        { status: stripeError.statusCode || 500 }
      )
    }

    console.log('[Checkout] ====== CREATE CHECKOUT SESSION DEBUG END (SUCCESS) ======')
    return NextResponse.json({ 
      sessionId: session.id,
      debug: process.env.NODE_ENV === 'development' ? {
        url: session.url,
        customerId: customerId || 'none',
        email: customerEmail
      } : undefined
    })
  } catch (error: any) {
    console.error('[Checkout] ❌ UNEXPECTED ERROR:', error)
    console.error('[Checkout] Error Stack:', error.stack)
    console.log('[Checkout] ====== CREATE CHECKOUT SESSION DEBUG END (ERROR) ======')
    
    return NextResponse.json(
      { 
        error: 'Unexpected error occurred',
        details: {
          message: error.message,
          type: error.constructor.name
        }
      },
      { status: 500 }
    )
  }
}