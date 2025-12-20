/**
 * Rehab Cost Calculator
 * Estimates rehabilitation costs based on property characteristics and strategy
 */

export enum RehabLevel {
  NONE = 'none',       // $0 - No rehab needed
  LIGHT = 'light',     // $15-35/sqft - Paint, carpet, minor updates (cosmetic)
  MEDIUM = 'medium',   // $35-65/sqft - Kitchen, bath, systems updates (moderate)
  HEAVY = 'heavy',     // $75-125/sqft - Major systems, structural work
  GUT = 'gut',         // $125-200/sqft - Complete gut renovation
}

export interface RehabCostEstimate {
  lowEstimate: number
  highEstimate: number
  averageEstimate: number
  level: RehabLevel
  costPerSqft: number
  breakdown?: RehabBreakdown
}

export interface RehabBreakdown {
  total: number
  categories: {
    name: string
    cost: number
    percentage: number
    description: string
  }[]
}

export const REHAB_COST_PER_SQFT = {
  none: { min: 0, max: 0, default: 0, description: 'No rehab needed' },
  light: { min: 15, max: 35, default: 25, description: 'Paint, carpet, minor updates (cosmetic)' },
  medium: { min: 35, max: 65, default: 50, description: 'Kitchen/bath updates, new flooring (moderate)' },
  heavy: { min: 75, max: 125, default: 100, description: 'Major systems, structural work' },
  gut: { min: 125, max: 200, default: 150, description: 'Complete gut renovation' },
} as const

/**
 * Determine rehab level based on property strategy and condition
 */
export function determineRehabLevel(
  strategy: string,
  yearBuilt?: number,
  propertyType?: string,
  existingRehabCost?: number,
  sqft?: number
): RehabLevel {
  // If rehab cost exists, determine level from it
  if (existingRehabCost && existingRehabCost > 0 && sqft && sqft > 0) {
    const costPerSqft = existingRehabCost / sqft
    if (costPerSqft >= 60) return RehabLevel.HEAVY
    if (costPerSqft >= 30) return RehabLevel.MEDIUM
    if (costPerSqft >= 15) return RehabLevel.LIGHT
    return RehabLevel.NONE
  }

  const currentYear = new Date().getFullYear()
  const propertyAge = yearBuilt ? currentYear - yearBuilt : 50

  // Fix & Flip always needs at least medium rehab
  if (strategy === 'Fix & Flip' || strategy === 'Flip') {
    if (propertyAge > 40) return RehabLevel.HEAVY
    return RehabLevel.MEDIUM
  }

  // BRRRR strategy typically needs medium to heavy rehab
  if (strategy === 'BRRRR') {
    if (propertyAge > 30) return RehabLevel.HEAVY
    return RehabLevel.MEDIUM
  }

  // Buy & Hold might need light to medium rehab
  if (strategy === 'Buy & Hold') {
    if (propertyAge > 50) return RehabLevel.MEDIUM
    if (propertyAge > 20) return RehabLevel.LIGHT
    return RehabLevel.NONE
  }

  // House Hack usually needs light updates
  if (strategy === 'House Hack') {
    if (propertyAge > 30) return RehabLevel.MEDIUM
    return RehabLevel.LIGHT
  }

  // Default based on age
  if (propertyAge > 40) return RehabLevel.MEDIUM
  if (propertyAge > 20) return RehabLevel.LIGHT
  return RehabLevel.NONE
}

/**
 * Calculate rehab costs with location adjustment
 */
export function calculateRehabCosts(
  squareFootage: number,
  level: RehabLevel,
  state?: string
): RehabCostEstimate {
  if (!squareFootage || squareFootage <= 0) {
    return { 
      lowEstimate: 0, 
      highEstimate: 0, 
      averageEstimate: 0,
      level: RehabLevel.NONE,
      costPerSqft: 0
    }
  }

  // High-cost states get 20% premium
  const highCostStates = ['CA', 'NY', 'MA', 'HI', 'DC', 'WA', 'OR', 'CT', 'NJ']
  const locationMultiplier = state && highCostStates.includes(state) ? 1.2 : 1.0

  // Ensure level is a valid key in REHAB_COST_PER_SQFT
  const costRange = REHAB_COST_PER_SQFT[level as keyof typeof REHAB_COST_PER_SQFT]
  
  // Handle undefined costRange (shouldn't happen but let's be safe)
  if (!costRange) {
    console.warn(`Invalid rehab level: ${level}. Using 'none' as fallback.`)
    return {
      lowEstimate: 0,
      highEstimate: 0,
      averageEstimate: 0,
      level: RehabLevel.NONE,
      costPerSqft: 0
    }
  }
  
  const adjustedMin = costRange.min * locationMultiplier
  const adjustedMax = costRange.max * locationMultiplier
  const adjustedDefault = costRange.default * locationMultiplier

  const lowEstimate = Math.round(squareFootage * adjustedMin)
  const highEstimate = Math.round(squareFootage * adjustedMax)
  const averageEstimate = Math.round(squareFootage * adjustedDefault)

  return {
    lowEstimate,
    highEstimate,
    averageEstimate,
    level,
    costPerSqft: adjustedDefault,
    breakdown: getRehabBreakdown(averageEstimate, level)
  }
}

/**
 * Get detailed breakdown of rehab costs
 */
export function getRehabBreakdown(totalCost: number, level: RehabLevel): RehabBreakdown {
  const breakdowns: Record<string, { name: string; percentage: number; description: string }[]> = {
    none: [],
    light: [
      { name: 'Paint & Cosmetics', percentage: 35, description: 'Interior/exterior paint, fixtures' },
      { name: 'Flooring', percentage: 30, description: 'Carpet or LVP replacement' },
      { name: 'Minor Repairs', percentage: 20, description: 'Drywall, caulking, hardware' },
      { name: 'Landscaping', percentage: 10, description: 'Curb appeal improvements' },
      { name: 'Contingency', percentage: 5, description: 'Unexpected items' }
    ],
    medium: [
      { name: 'Kitchen Update', percentage: 25, description: 'Cabinets, countertops, appliances' },
      { name: 'Bathroom Renovation', percentage: 20, description: 'Fixtures, tile, vanity' },
      { name: 'Flooring', percentage: 15, description: 'Hardwood or quality LVP' },
      { name: 'Systems Updates', percentage: 15, description: 'HVAC, electrical, plumbing' },
      { name: 'Paint & Drywall', percentage: 10, description: 'Full interior paint, repairs' },
      { name: 'Exterior', percentage: 10, description: 'Siding, windows, landscaping' },
      { name: 'Contingency', percentage: 5, description: 'Unexpected repairs' }
    ],
    heavy: [
      { name: 'Structural Work', percentage: 20, description: 'Foundation, framing, roof' },
      { name: 'Systems Replacement', percentage: 20, description: 'New HVAC, electrical, plumbing' },
      { name: 'Complete Kitchen', percentage: 18, description: 'Full gut and remodel' },
      { name: 'All Bathrooms', percentage: 15, description: 'Complete renovation' },
      { name: 'Windows & Doors', percentage: 10, description: 'Full replacement' },
      { name: 'Flooring Throughout', percentage: 8, description: 'Premium materials' },
      { name: 'Exterior Renovation', percentage: 6, description: 'Siding, stucco, landscaping' },
      { name: 'Contingency', percentage: 3, description: 'Unexpected issues' }
    ],
    gut: [
      { name: 'Demo & Structural', percentage: 20, description: 'Full demo, foundation, framing' },
      { name: 'MEP Systems', percentage: 22, description: 'New electrical, plumbing, HVAC throughout' },
      { name: 'Complete Kitchen', percentage: 15, description: 'Custom kitchen build-out' },
      { name: 'All Bathrooms', percentage: 12, description: 'Full bathroom builds' },
      { name: 'Windows & Doors', percentage: 8, description: 'All new windows and doors' },
      { name: 'Flooring & Finishes', percentage: 10, description: 'Premium materials throughout' },
      { name: 'Exterior & Roof', percentage: 8, description: 'Exterior renovation, new roof' },
      { name: 'Contingency', percentage: 5, description: 'Unexpected issues' }
    ]
  }

  const levelBreakdown = breakdowns[level] || breakdowns.none
  const categories = levelBreakdown.map(item => ({
    ...item,
    cost: Math.round(totalCost * (item.percentage / 100))
  }))

  return {
    total: totalCost,
    categories
  }
}

/**
 * Main function to estimate rehab costs for a property
 */
export function estimatePropertyRehabCost(
  property: {
    sqft?: number
    strategy?: string
    yearBuilt?: number
    propertyType?: string
    state?: string
    rehabCosts?: number
  }
): RehabCostEstimate {
  const sqft = property.sqft || 0
  
  // If valid rehab costs already exist, use them
  if (property.rehabCosts && property.rehabCosts > 0) {
    const costPerSqft = sqft > 0 ? property.rehabCosts / sqft : 0
    const level = determineRehabLevel(
      property.strategy || 'Buy & Hold',
      property.yearBuilt,
      property.propertyType,
      property.rehabCosts,
      sqft
    )
    
    return {
      lowEstimate: Math.round(property.rehabCosts * 0.9),
      highEstimate: Math.round(property.rehabCosts * 1.1),
      averageEstimate: property.rehabCosts,
      level,
      costPerSqft,
      breakdown: getRehabBreakdown(property.rehabCosts, level)
    }
  }

  // Otherwise estimate based on strategy and property details
  const level = determineRehabLevel(
    property.strategy || 'Buy & Hold',
    property.yearBuilt,
    property.propertyType
  )

  return calculateRehabCosts(sqft, level, property.state)
}

/**
 * Format rehab cost for display
 */
export function formatRehabCost(cost: number): string {
  if (cost === 0) return 'No Rehab Needed'
  if (cost < 1000) return `$${cost}`
  if (cost < 1000000) return `$${(cost / 1000).toFixed(0)}K`
  return `$${(cost / 1000000).toFixed(2)}M`
}

/**
 * Format renovation level for display
 */
export function formatRenovationLevel(level: RehabLevel): string {
  const labels: Record<string, string> = {
    none: 'No Rehab Needed',
    light: 'Light Renovation (Cosmetic)',
    medium: 'Medium Renovation (Moderate)',
    heavy: 'Heavy Renovation',
    gut: 'Gut Renovation'
  }

  return labels[level] || level
}