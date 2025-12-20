/**
 * Strategy-Based Financing Defaults
 *
 * Provides intelligent default values for financing parameters based on
 * investment strategy, loan type, and market conditions.
 */

export type InvestmentStrategy =
  | 'flip'
  | 'brrrr'
  | 'rental'
  | 'buy-and-hold'
  | 'house-hack'
  | 'commercial'
  | 'short-term-rental';

export type FinancingType =
  | 'hard-money'
  | 'conventional'
  | 'fha'
  | 'va'
  | 'portfolio'
  | 'cash';

export interface FinancingDefaults {
  financingType: FinancingType;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  lenderPointsPercent: number;
  otherClosingCostsPercent: number; // Title, escrow, etc.
  totalClosingCostsPercent: number; // Total = lender points + other fees
  pmi?: boolean;
  description: string;
}

export interface ClosingCostBreakdown {
  lenderPoints: number;
  lenderPointsPercent: number;
  otherClosingCosts: number;
  otherClosingCostsPercent: number;
  totalClosingCosts: number;
  totalClosingCostsPercent: number;
}

export interface BRRRRFinancingDefaults {
  acquisition: FinancingDefaults;
  refinance: {
    financingType: FinancingType;
    ltvPercent: number; // 75% LTV on ARV
    interestRate: number;
    loanTermYears: number;
    closingCostsPercent: number;
  };
}

/**
 * Get financing defaults based on investment strategy
 *
 * INDUSTRY STANDARD CLOSING COSTS:
 * - Hard Money: 1.5-2.5% origination + $1,000-2,000 fees = ~2.5-3.5% total
 * - Conventional: 2-5% of purchase price (includes origination 0.5-1%)
 * - FHA: 3-6% of purchase price (higher due to MIP)
 */
export function getFinancingDefaults(strategy: InvestmentStrategy): FinancingDefaults | BRRRRFinancingDefaults {
  switch (strategy) {
    case 'flip':
      return {
        financingType: 'hard-money',
        downPaymentPercent: 10,           // 10% down for hard money
        interestRate: 10.45,              // Current hard money avg
        loanTermYears: 1,                 // 12 months
        lenderPointsPercent: 2.5,         // 2.5% origination
        otherClosingCostsPercent: 0.5,    // 0.5% other fees
        totalClosingCostsPercent: 3.0,    // 3% total closing costs
        description: 'Hard money loan for fix & flip'
      };

    case 'brrrr':
      return {
        acquisition: {
          financingType: 'hard-money',
          downPaymentPercent: 10,
          interestRate: 10.45,
          loanTermYears: 1,
          lenderPointsPercent: 2.5,
          otherClosingCostsPercent: 0.5,
          totalClosingCostsPercent: 3.0,
          description: 'Hard money for BRRRR acquisition'
        },
        refinance: {
          financingType: 'conventional',
          ltvPercent: 75,                 // 75% LTV on ARV
          interestRate: 7.5,
          loanTermYears: 30,
          closingCostsPercent: 2.0        // Refi closing costs lower
        }
      };

    case 'rental':
    case 'buy-and-hold':
      return {
        financingType: 'conventional',
        downPaymentPercent: 25,           // 25% down for investment property
        interestRate: 7.5,                // Current conventional investment rate
        loanTermYears: 30,
        lenderPointsPercent: 1.0,         // 1% origination
        otherClosingCostsPercent: 2.0,    // 2% other fees
        totalClosingCostsPercent: 3.0,    // 3% total closing costs
        description: 'Conventional investment property loan'
      };

    case 'house-hack':
      return {
        financingType: 'fha',
        downPaymentPercent: 3.5,          // 3.5% down (FHA minimum)
        interestRate: 6.5,                // Current FHA rate
        loanTermYears: 30,
        lenderPointsPercent: 1.0,         // 1% origination
        otherClosingCostsPercent: 4.0,    // 4% other (higher for FHA)
        totalClosingCostsPercent: 5.0,    // 5% total (FHA higher closing)
        pmi: true,                        // FHA requires MIP
        description: 'FHA owner-occupied loan for house hacking'
      };

    case 'commercial':
      return {
        financingType: 'portfolio',
        downPaymentPercent: 25,           // 25% down for commercial
        interestRate: 8.0,                // Commercial rates
        loanTermYears: 25,                // Often 20-25 year amortization
        lenderPointsPercent: 1.5,         // 1.5% origination
        otherClosingCostsPercent: 2.5,    // 2.5% other fees
        totalClosingCostsPercent: 4.0,    // 4% total
        description: 'Commercial loan for 5+ unit properties'
      };

    case 'short-term-rental':
      return {
        financingType: 'conventional',
        downPaymentPercent: 25,           // 25% down
        interestRate: 8.0,                // STR specialty rates
        loanTermYears: 30,
        lenderPointsPercent: 1.0,         // 1% origination
        otherClosingCostsPercent: 2.0,    // 2% other fees
        totalClosingCostsPercent: 3.0,    // 3% total
        description: 'Conventional or STR specialty loan'
      };

    default:
      return {
        financingType: 'conventional',
        downPaymentPercent: 20,
        interestRate: 7.0,
        loanTermYears: 30,
        lenderPointsPercent: 1.0,
        otherClosingCostsPercent: 2.0,
        totalClosingCostsPercent: 3.0,
        description: 'Standard investment property rates'
      };
  }
}

/**
 * Calculate closing costs breakdown
 *
 * IMPORTANT: Lender points ARE PART OF closing costs, not separate.
 * This function returns a proper breakdown to avoid double-counting.
 */
export function calculateClosingCosts(
  purchasePrice: number,
  lenderPointsPercent: number = 2.5,
  otherClosingCostsPercent: number = 0.5
): ClosingCostBreakdown {
  // Lender points (origination fees) - percentage of loan amount typically,
  // but for simplicity we calculate on purchase price
  const lenderPoints = purchasePrice * (lenderPointsPercent / 100);

  // Other closing costs (title, escrow, appraisal, etc.)
  const otherClosingCosts = purchasePrice * (otherClosingCostsPercent / 100);

  // TOTAL closing costs = points + other fees (NOT additional)
  const totalClosingCosts = lenderPoints + otherClosingCosts;
  const totalClosingCostsPercent = lenderPointsPercent + otherClosingCostsPercent;

  return {
    lenderPoints: Math.round(lenderPoints),
    lenderPointsPercent,
    otherClosingCosts: Math.round(otherClosingCosts),
    otherClosingCostsPercent,
    totalClosingCosts: Math.round(totalClosingCosts),
    totalClosingCostsPercent
  };
}

/**
 * Calculate closing costs for a specific financing type
 */
export function getClosingCostsForFinancingType(
  purchasePrice: number,
  financingType: FinancingType,
  customLenderPoints?: number
): ClosingCostBreakdown {
  const defaults: Record<FinancingType, { points: number; other: number }> = {
    'hard-money': { points: 2.5, other: 0.5 },     // 3% total
    'conventional': { points: 1.0, other: 2.0 },   // 3% total
    'fha': { points: 1.0, other: 4.0 },            // 5% total (higher for FHA)
    'va': { points: 0.5, other: 2.0 },             // 2.5% total (VA has lower costs)
    'portfolio': { points: 1.5, other: 2.5 },      // 4% total
    'cash': { points: 0, other: 1.5 }              // 1.5% total (just title, escrow)
  };

  const config = defaults[financingType] || defaults['conventional'];
  const lenderPoints = customLenderPoints ?? config.points;

  return calculateClosingCosts(purchasePrice, lenderPoints, config.other);
}

/**
 * Get simple defaults for a strategy (non-BRRRR)
 * Returns a single FinancingDefaults object
 */
export function getSimpleFinancingDefaults(strategy: InvestmentStrategy): FinancingDefaults {
  const defaults = getFinancingDefaults(strategy);

  // Handle BRRRR specially - return acquisition phase defaults
  if ('acquisition' in defaults) {
    return defaults.acquisition;
  }

  return defaults as FinancingDefaults;
}

/**
 * Check if strategy is BRRRR (has two-phase financing)
 */
export function isBRRRRStrategy(strategy: InvestmentStrategy): boolean {
  return strategy === 'brrrr';
}

/**
 * Get BRRRR-specific financing defaults
 */
export function getBRRRRDefaults(strategy: InvestmentStrategy): BRRRRFinancingDefaults | null {
  if (!isBRRRRStrategy(strategy)) {
    return null;
  }

  return getFinancingDefaults(strategy) as BRRRRFinancingDefaults;
}

/**
 * Format closing costs for display
 */
export function formatClosingCostsBreakdown(breakdown: ClosingCostBreakdown): string {
  return `$${breakdown.totalClosingCosts.toLocaleString()} (${breakdown.totalClosingCostsPercent.toFixed(1)}%)
  - Lender Points (${breakdown.lenderPointsPercent}%): $${breakdown.lenderPoints.toLocaleString()}
  - Title/Escrow/Other (${breakdown.otherClosingCostsPercent}%): $${breakdown.otherClosingCosts.toLocaleString()}`;
}

/**
 * Validate financing parameters
 */
export function validateFinancingParams(params: {
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  strategy: InvestmentStrategy;
}): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const _defaults = getSimpleFinancingDefaults(params.strategy);

  // Check down payment
  if (params.strategy === 'house-hack' && params.downPaymentPercent < 3.5) {
    warnings.push('FHA loans require minimum 3.5% down payment');
  } else if (params.strategy === 'flip' && params.downPaymentPercent < 10) {
    warnings.push('Most hard money lenders require minimum 10% down');
  } else if (['rental', 'buy-and-hold'].includes(params.strategy) && params.downPaymentPercent < 20) {
    warnings.push('Investment properties typically require 20-25% down');
  }

  // Check interest rate
  if (params.interestRate > 15) {
    warnings.push('Interest rate seems unusually high - verify this is correct');
  }

  // Check loan term
  if (params.strategy === 'flip' && params.loanTermYears > 2) {
    warnings.push('Fix & flip loans are typically 6-18 months');
  }

  return {
    isValid: warnings.length === 0,
    warnings
  };
}
