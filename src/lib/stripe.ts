import Stripe from 'stripe'

// Initialize Stripe with API version - lazy initialization to avoid build-time errors
let stripeInstance: Stripe | null = null

export const stripe = new Proxy({} as Stripe, {
  get(target, prop, receiver) {
    if (!stripeInstance) {
      const key = process.env.STRIPE_SECRET_KEY

      // SEC-004: Removed logging of key details (length, prefix, mode) to prevent information leakage
      if (!key) {
        console.error('[Stripe Init] ❌ STRIPE_SECRET_KEY is not configured')
        throw new Error('STRIPE_SECRET_KEY is not configured - check environment variables')
      }

      if (key.length < 30) {
        console.error('[Stripe Init] ❌ STRIPE_SECRET_KEY appears to be invalid')
        throw new Error('STRIPE_SECRET_KEY appears to be invalid')
      }

      try {
        stripeInstance = new Stripe(key, {
          apiVersion: '2025-07-30.basil',
        })
        // SEC-004: Only log initialization status, not key details
        const mode = key.startsWith('sk_test') ? 'test' : 'live'
        console.log(`[Stripe Init] ✅ Stripe client initialized (${mode} mode)`)
      } catch (error: unknown) {
        console.error('[Stripe Init] ❌ Failed to initialize Stripe client')
        throw error
      }
    }
    return Reflect.get(stripeInstance, prop, receiver)
  }
})

// Subscription tiers configuration
// NEW PRICING STRUCTURE (December 2024):
// - FREE: $0/month, 3 analyses/month
// - PRO: $29/month, 50 analyses/month
// - PRO PLUS: $59/month, 200 analyses/month
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    priceId: null,
    analysisLimit: 3,
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'pdf_exports',
      'email_support',
    ],
  },
  STARTER: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    analysisLimit: 3,  // Legacy - maps to Free
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'pdf_exports',
      'email_support',
    ],
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,  // $29/month
    analysisLimit: 50,
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'deal_alerts',
      'pdf_exports',
      'email_support',
      'advanced_analytics',
      'early_access',
      'priority_support',
      'market_reports',
      'analysis_history',
    ],
  },
  'PRO-PLUS': {
    name: 'Pro Plus',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_PLUS,  // $59/month
    analysisLimit: 200,
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'deal_alerts',
      'pdf_exports',
      'email_support',
      'advanced_analytics',
      'early_access',
      'priority_support',
      'market_reports',
      'analysis_history',
      'advanced_dashboard',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    analysisLimit: 50,  // Legacy - grandfathered users
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'deal_alerts',
      'pdf_exports',
      'email_support',
      'advanced_analytics',
      'early_access',
      'priority_support',
      'market_reports',
      'analysis_history',
    ],
  },
}

// Helper function to get tier by price ID
export function getTierByPriceId(priceId: string | null) {
  if (!priceId) return SUBSCRIPTION_TIERS.FREE
  
  for (const [_key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
    if (tier.priceId === priceId) {
      return tier
    }
  }
  
  return SUBSCRIPTION_TIERS.FREE
}

// Helper function to check if a feature is available in a tier
export function hasFeature(tierName: string, feature: string): boolean {
  const tier = SUBSCRIPTION_TIERS[tierName.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]
  if (!tier) return false
  return tier.features.includes(feature)
}

// Note: getAnalysisLimit has been moved to subscription-utils.ts for client-side use
// This file should only be imported in server-side code (API routes)