// Client-safe subscription utilities (no server-side dependencies)

// NEW PRICING STRUCTURE (December 2024):
// - FREE: 3 analyses/month
// - PRO: 50 analyses/month @ $29/month
// - PRO PLUS: 200 analyses/month @ $59/month

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    analysisLimit: 3,  // 3 analyses per month
  },
  STARTER: {
    name: 'Starter',
    analysisLimit: 3,  // Legacy - maps to Free
  },
  PROFESSIONAL: {
    name: 'Pro',
    analysisLimit: 50,  // 50 analyses per month
  },
  PRO: {
    name: 'Pro',
    analysisLimit: 50,  // 50 analyses per month @ $29/month
  },
  'PRO-PLUS': {
    name: 'Pro Plus',
    analysisLimit: 200,  // 200 analyses per month @ $59/month
  },
  PRO_PLUS: {
    name: 'Pro Plus',
    analysisLimit: 200,  // 200 analyses per month @ $59/month
  },
  PREMIUM: {
    name: 'Pro',
    analysisLimit: 50,  // Legacy - maps to Pro (grandfathered users)
  },
}

// Helper function to get analysis limit for a tier
export function getAnalysisLimit(tierName: string): number {
  const upperTier = tierName.toUpperCase()
  const tier = SUBSCRIPTION_TIERS[upperTier as keyof typeof SUBSCRIPTION_TIERS]
  if (!tier) return 0
  return tier.analysisLimit
}

// Map tier names to our standard names
export function normalizeTierName(tierName: string): string {
  const upperTier = tierName.toUpperCase().replace('-', '_')

  // Map variations to standard names
  switch(upperTier) {
    case 'PRO_PLUS':
    case 'PROPLUS':
      return 'pro-plus'
    case 'PRO':
      return 'pro'
    case 'PROFESSIONAL':
      return 'professional'
    case 'STARTER':
      return 'starter'
    case 'PREMIUM':
      return 'premium'
    case 'FREE':
    case 'BASIC':
    default:
      return 'free'
  }
}