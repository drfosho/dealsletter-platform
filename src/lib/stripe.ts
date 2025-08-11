import Stripe from 'stripe'

// Initialize Stripe with API version
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
})

// Subscription tiers configuration
export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    priceId: null,
    analysisLimit: 0,
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
    ],
  },
  STARTER: {
    name: 'Starter',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_STARTER,
    analysisLimit: 12,
    features: [
      'view_deals',
      'basic_comparison',
      'archive_access_30days',
      'personal_analysis',
      'deal_alerts',
      'pdf_exports',
      'email_support',
    ],
  },
  PRO: {
    name: 'Pro',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO,
    analysisLimit: 35,
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
    ],
  },
  PREMIUM: {
    name: 'Premium',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM,
    analysisLimit: -1, // -1 represents unlimited
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
      'weekly_sessions',
      'custom_sourcing',
      'phone_support',
      'api_access',
      'team_tools',
    ],
  },
}

// Helper function to get tier by price ID
export function getTierByPriceId(priceId: string | null) {
  if (!priceId) return SUBSCRIPTION_TIERS.FREE
  
  for (const [key, tier] of Object.entries(SUBSCRIPTION_TIERS)) {
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

// Helper function to get analysis limit for a tier
export function getAnalysisLimit(tierName: string): number {
  const tier = SUBSCRIPTION_TIERS[tierName.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS]
  if (!tier) return 0
  return tier.analysisLimit
}