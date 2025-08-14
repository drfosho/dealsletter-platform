import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'

export async function GET(_request: NextRequest) {
  console.log('[Stripe Debug] ====== STRIPE DEBUG CHECK ======')
  
  const debug = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      secretKey: {
        exists: !!process.env.STRIPE_SECRET_KEY,
        length: process.env.STRIPE_SECRET_KEY?.length || 0,
        prefix: process.env.STRIPE_SECRET_KEY?.substring(0, 7) || 'none',
        isTestMode: process.env.STRIPE_SECRET_KEY?.includes('sk_test') || false,
      },
      priceIds: {
        starter: process.env.STRIPE_PRICE_STARTER_MONTHLY || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY ||
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER || 'not set',
        starterMonthly: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'not set',
        pro: process.env.STRIPE_PRICE_PRO_MONTHLY || 
             process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY ||
             process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 
             process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PRO || 'not set',
        proMonthly: process.env.STRIPE_PRICE_PRO_MONTHLY || 'not set',
        premium: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY ||
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 
                 process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM || 'not set',
        premiumMonthly: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'not set',
      },
      urls: {
        appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
        webhookSecret: !!process.env.STRIPE_WEBHOOK_SECRET,
      },
      stripeEnvVars: Object.keys(process.env)
        .filter(key => key.includes('STRIPE'))
        .map(key => ({
          name: key,
          exists: !!process.env[key],
          length: process.env[key]?.length || 0,
        })),
      priceValidation: null as any,
    },
    stripeApiTest: {
      status: 'pending',
      error: null as string | null,
      account: null as any,
    }
  }

  // Try to make a simple Stripe API call to verify connection
  try {
    console.log('[Stripe Debug] Testing Stripe API connection...')
    const account = await stripe.accounts.retrieve()
    debug.stripeApiTest.status = 'success'
    debug.stripeApiTest.account = {
      id: account.id,
      type: account.type,
      country: account.country,
      default_currency: account.default_currency,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
    }
    console.log('[Stripe Debug] ✅ Stripe API connection successful')
  } catch (error: any) {
    console.error('[Stripe Debug] ❌ Stripe API test failed:', error)
    debug.stripeApiTest.status = 'failed'
    debug.stripeApiTest.error = error.message || 'Unknown error'
  }

  // Try to list prices to verify they exist
  try {
    console.log('[Stripe Debug] Checking if price IDs exist...')
    const prices = await stripe.prices.list({ limit: 100, active: true })
    
    const priceMap: Record<string, any> = {}
    prices.data.forEach(price => {
      priceMap[price.id] = {
        id: price.id,
        nickname: price.nickname,
        unit_amount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring,
        active: price.active,
        product: price.product,
      }
    })

    // Check if our configured price IDs exist
    const checkPriceId = (envVar: string, _label: string) => {
      const priceId = process.env[envVar]
      if (priceId && priceMap[priceId]) {
        return {
          status: 'found',
          priceId,
          details: priceMap[priceId]
        }
      } else if (priceId) {
        return {
          status: 'not found',
          priceId,
          error: 'Price ID does not exist in Stripe'
        }
      } else {
        return {
          status: 'not configured',
          error: `Environment variable ${envVar} is not set`
        }
      }
    }

    debug.checks.priceValidation = {
      starter: checkPriceId('STRIPE_PRICE_STARTER_MONTHLY', 'Starter') || 
               checkPriceId('NEXT_PUBLIC_STRIPE_PRICE_STARTER', 'Starter'),
      pro: checkPriceId('STRIPE_PRICE_PRO_MONTHLY', 'Pro') || 
           checkPriceId('NEXT_PUBLIC_STRIPE_PRICE_PRO', 'Pro'),
      premium: checkPriceId('STRIPE_PRICE_PREMIUM_MONTHLY', 'Premium') || 
               checkPriceId('NEXT_PUBLIC_STRIPE_PRICE_PREMIUM', 'Premium'),
      totalPricesFound: prices.data.length,
      allPriceIds: prices.data.map(p => p.id),
    }
  } catch (error: any) {
    console.error('[Stripe Debug] Failed to check prices:', error)
    debug.checks.priceValidation = {
      error: error.message
    }
  }

  console.log('[Stripe Debug] Debug info:', JSON.stringify(debug, null, 2))
  
  // Only return safe information in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({
      status: debug.stripeApiTest.status,
      message: debug.stripeApiTest.status === 'success' 
        ? 'Stripe is configured correctly' 
        : 'Stripe configuration error - check server logs',
      timestamp: debug.timestamp,
    })
  }

  // Return full debug info in development
  return NextResponse.json(debug)
}