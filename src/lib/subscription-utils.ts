// Client-safe subscription utilities (no server-side dependencies)

export const SUBSCRIPTION_TIERS = {
  FREE: {
    name: 'Free',
    analysisLimit: 0,
  },
  STARTER: {
    name: 'Starter', 
    analysisLimit: 12,
  },
  PROFESSIONAL: {
    name: 'Professional',
    analysisLimit: 25,
  },
  PRO: {
    name: 'Professional',  // Map PRO to Professional
    analysisLimit: 25,
  },
  PREMIUM: {
    name: 'Premium',
    analysisLimit: 999999,  // Unlimited (with fair usage)
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