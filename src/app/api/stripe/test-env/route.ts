import { NextRequest, NextResponse } from 'next/server'

export async function GET(_request: NextRequest) {
  console.log('[Env Test] ====== ENVIRONMENT VARIABLE TEST ======')
  
  // Test all possible Stripe price environment variable patterns
  const patterns = [
    'STRIPE_PRICE_STARTER_MONTHLY',
    'STRIPE_PRICE_PRO_MONTHLY',
    'STRIPE_PRICE_PREMIUM_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_STARTER_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY',
    'NEXT_PUBLIC_STRIPE_PRICE_STARTER',
    'NEXT_PUBLIC_STRIPE_PRICE_PRO',
    'NEXT_PUBLIC_STRIPE_PRICE_PREMIUM',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_STARTER',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PRO',
    'NEXT_PUBLIC_STRIPE_PRICE_ID_PREMIUM',
  ]
  
  const results: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    directAccess: {},
    dynamicAccess: {},
    allStripeVars: [],
    vercelEnv: process.env.VERCEL_ENV,
  }
  
  // Test direct access
  results.directAccess = {
    STRIPE_PRICE_STARTER_MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY || 'undefined',
    STRIPE_PRICE_PRO_MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY || 'undefined',
    STRIPE_PRICE_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || 'undefined',
    NEXT_PUBLIC_STRIPE_PRICE_STARTER: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER || 'undefined',
    NEXT_PUBLIC_STRIPE_PRICE_PRO: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'undefined',
    NEXT_PUBLIC_STRIPE_PRICE_PREMIUM: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM || 'undefined',
  }
  
  // Test dynamic access
  patterns.forEach(pattern => {
    const value = process.env[pattern]
    results.dynamicAccess[pattern] = value || 'undefined'
    console.log(`[Env Test] ${pattern}: ${value ? 'FOUND' : 'NOT FOUND'}`)
  })
  
  // Get all environment variables that contain STRIPE
  results.allStripeVars = Object.keys(process.env)
    .filter(key => key.includes('STRIPE'))
    .map(key => ({
      name: key,
      value: key.includes('SECRET') || key.includes('WEBHOOK') 
        ? '***REDACTED***' 
        : process.env[key]?.substring(0, 20) + '...',
      length: process.env[key]?.length || 0
    }))
  
  // Test tier mapping function
  const testTierMapping = (tier: string) => {
    const upperTier = tier.toUpperCase()
    const attempts = [
      { key: `STRIPE_PRICE_${upperTier}_MONTHLY`, value: process.env[`STRIPE_PRICE_${upperTier}_MONTHLY`] },
      { key: `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_MONTHLY`, value: process.env[`NEXT_PUBLIC_STRIPE_PRICE_${upperTier}_MONTHLY`] },
      { key: `NEXT_PUBLIC_STRIPE_PRICE_${upperTier}`, value: process.env[`NEXT_PUBLIC_STRIPE_PRICE_${upperTier}`] },
      { key: `NEXT_PUBLIC_STRIPE_PRICE_ID_${upperTier}`, value: process.env[`NEXT_PUBLIC_STRIPE_PRICE_ID_${upperTier}`] },
    ]
    
    const found = attempts.find(a => a.value)
    return {
      tier,
      found: !!found,
      key: found?.key || 'none',
      value: found?.value ? found.value.substring(0, 20) + '...' : 'not found',
      allAttempts: attempts.map(a => ({ key: a.key, found: !!a.value }))
    }
  }
  
  results.tierMapping = {
    starter: testTierMapping('STARTER'),
    pro: testTierMapping('PRO'),
    premium: testTierMapping('PREMIUM'),
  }
  
  console.log('[Env Test] Results:', JSON.stringify(results, null, 2))
  
  return NextResponse.json(results)
}