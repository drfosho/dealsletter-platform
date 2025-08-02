// Rehab Cost Calculator Utility

export interface RehabCostEstimate {
  lowEstimate: number;
  highEstimate: number;
  averageEstimate: number;
}

export const REHAB_COST_PER_SQFT = {
  cosmetic: { min: 15, max: 25, description: 'Paint, carpet, minor updates' },
  moderate: { min: 30, max: 50, description: 'Kitchen/bath updates, new flooring' },
  extensive: { min: 60, max: 100, description: 'Major systems, structural work' },
  gut: { min: 100, max: 150, description: 'Complete renovation' }
} as const;

export type RenovationLevel = keyof typeof REHAB_COST_PER_SQFT;

/**
 * Calculate estimated rehab costs based on property size and renovation level
 * @param squareFootage - Property square footage
 * @param renovationLevel - Level of renovation needed
 * @returns Rehab cost estimates (low, high, average)
 */
export function calculateRehabCosts(
  squareFootage: number,
  renovationLevel: RenovationLevel
): RehabCostEstimate {
  if (!squareFootage || squareFootage <= 0) {
    return { lowEstimate: 0, highEstimate: 0, averageEstimate: 0 };
  }

  const costRange = REHAB_COST_PER_SQFT[renovationLevel];
  const lowEstimate = Math.round(squareFootage * costRange.min);
  const highEstimate = Math.round(squareFootage * costRange.max);
  const averageEstimate = Math.round((lowEstimate + highEstimate) / 2);

  return {
    lowEstimate,
    highEstimate,
    averageEstimate
  };
}

/**
 * Get a detailed breakdown of rehab costs by category
 * @param squareFootage - Property square footage
 * @param renovationLevel - Level of renovation needed
 * @returns Detailed cost breakdown
 */
export function getRehabCostBreakdown(
  squareFootage: number,
  renovationLevel: RenovationLevel
) {
  const { averageEstimate } = calculateRehabCosts(squareFootage, renovationLevel);
  
  // Typical cost allocation percentages by category
  const breakdown = {
    cosmetic: {
      painting: 0.25,
      flooring: 0.35,
      fixtures: 0.15,
      landscaping: 0.10,
      miscellaneous: 0.15
    },
    moderate: {
      kitchen: 0.30,
      bathrooms: 0.25,
      flooring: 0.20,
      painting: 0.10,
      hvac: 0.10,
      miscellaneous: 0.05
    },
    extensive: {
      structural: 0.25,
      kitchen: 0.20,
      bathrooms: 0.15,
      electrical: 0.10,
      plumbing: 0.10,
      hvac: 0.10,
      flooring: 0.05,
      miscellaneous: 0.05
    },
    gut: {
      structural: 0.20,
      kitchen: 0.15,
      bathrooms: 0.15,
      electrical: 0.12,
      plumbing: 0.12,
      hvac: 0.10,
      flooring: 0.08,
      painting: 0.05,
      miscellaneous: 0.03
    }
  };

  const allocations = breakdown[renovationLevel];
  const detailedBreakdown: Record<string, number> = {};

  for (const [category, percentage] of Object.entries(allocations)) {
    detailedBreakdown[category] = Math.round(averageEstimate * percentage);
  }

  return {
    total: averageEstimate,
    breakdown: detailedBreakdown
  };
}

/**
 * Format renovation level for display
 * @param level - Renovation level
 * @returns Formatted string
 */
export function formatRenovationLevel(level: RenovationLevel): string {
  const labels = {
    cosmetic: 'Cosmetic Updates',
    moderate: 'Moderate Renovation',
    extensive: 'Extensive Renovation',
    gut: 'Gut Rehab'
  };
  
  return labels[level] || level;
}