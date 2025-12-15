// Client-safe subscription utilities (no server-side dependencies)

// NEW PRICING STRUCTURE (December 2024):
// - FREE: 3 analyses/month
// - PRO: 30 analyses/month @ $49/month

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
    analysisLimit: 30,  // 30 analyses per month
  },
  PRO: {
    name: 'Pro',
    analysisLimit: 30,  // 30 analyses per month @ $49/month
  },
  PREMIUM: {
    name: 'Pro',
    analysisLimit: 30,  // Legacy - maps to Pro (grandfathered users)
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
  const upperTier = tierName.toUpperCase()
  
  // Map variations to standard names
  switch(upperTier) {
    case 'PRO':
      return 'professional'
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