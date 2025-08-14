import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  console.log('[Yearly Test] ====== YEARLY PRICING TEST ======')
  
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    yearlyPrices: {
      starter: {
        envVars: [
          'STRIPE_PRICE_STARTER_YEARLY',
          'NEXT_PUBLIC_STRIPE_PRICE_STARTER_YEARLY',
          'STRIPE_PRICE_STARTER_ANNUAL',
          'NEXT_PUBLIC_STRIPE_PRICE_STARTER_ANNUAL'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      },
      pro: {
        envVars: [
          'STRIPE_PRICE_PRO_YEARLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PRO_YEARLY',
          'STRIPE_PRICE_PRO_ANNUAL',
          'NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      },
      premium: {
        envVars: [
          'STRIPE_PRICE_PREMIUM_YEARLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY',
          'STRIPE_PRICE_PREMIUM_ANNUAL',
          'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_ANNUAL'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      }
    },
    monthlyPrices: {
      starter: {
        envVars: [
          'STRIPE_PRICE_STARTER_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
          'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      },
      pro: {
        envVars: [
          'STRIPE_PRICE_PRO_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PRO',
          'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      },
      premium: {
        envVars: [
          'STRIPE_PRICE_PREMIUM_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY',
          'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM',
          'NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM'
        ].map(key => ({
          key,
          value: process.env[key] || 'not set',
          exists: !!process.env[key]
        }))
      }
    },
    allStripeEnvVars: Object.keys(process.env)
      .filter(key => key.includes('STRIPE') && key.includes('PRICE'))
      .sort()
      .map(key => ({
        key,
        value: process.env[key]?.substring(0, 30) + '...',
        length: process.env[key]?.length || 0
      }))
  }
  
  // Test the mapping logic for each tier and billing period
  const testMapping = (tier: string, billingPeriod: string) => {
    const upperTier = tier.toUpperCase()
    
    const possibleEnvVars = billingPeriod === 'yearly' ? [
      `STRIPE_PRICE_${upperTier}_YEARLY`,
      `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_YEARLY`,
      `STRIPE_PRICE_${upperTier}_ANNUAL`,
      `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_ANNUAL`,
    ] : [
      `STRIPE_PRICE_${upperTier}_MONTHLY`,
      `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_MONTHLY`,
      `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}`,
      `NEXT_PUBLIC_STRIPE_PRICE_ID_${upperTier}`,
      `STRIPE_PRICE_${upperTier}`,
    ]
    
    let priceId = null
    for (const envVar of possibleEnvVars) {
      const value = process.env[envVar]
      if (value) {
        priceId = value
        break
      }
    }
    
    return {
      tier,
      billingPeriod,
      priceId: priceId || 'NOT FOUND',
      found: !!priceId
    }
  }
  
  results.mappingTests = {
    monthly: {
      starter: testMapping('STARTER', 'monthly'),
      pro: testMapping('PRO', 'monthly'),
      premium: testMapping('PREMIUM', 'monthly')
    },
    yearly: {
      starter: testMapping('STARTER', 'yearly'),
      pro: testMapping('PRO', 'yearly'),
      premium: testMapping('PREMIUM', 'yearly')
    }
  }
  
  console.log('[Yearly Test] Results:', JSON.stringify(results, null, 2))
  
  return NextResponse.json(results)
}