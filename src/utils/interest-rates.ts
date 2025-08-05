/**
 * Interest Rate Defaults by Strategy
 * Based on current market conditions (2024-2025)
 */

export interface InterestRateRange {
  min: number;
  max: number;
  default: number;
  description: string;
}

export const INTEREST_RATE_DEFAULTS: Record<string, InterestRateRange> = {
  // Buy & Hold / Rental Properties
  'Buy & Hold': {
    min: 7.0,
    max: 8.0,
    default: 7.5,
    description: 'Conventional investment property loan (20-25% down)'
  },
  
  // House Hack - Owner Occupied
  'House Hack': {
    min: 6.5,
    max: 7.5,
    default: 7.0,
    description: 'Owner-occupied rates (FHA or conventional with 3.5-20% down)'
  },
  
  // BRRRR Strategy
  'BRRRR': {
    min: 10.0,
    max: 12.0,
    default: 11.0,
    description: 'Hard money for purchase/rehab, then refinance to 7-8%'
  },
  
  // Fix & Flip
  'Fix & Flip': {
    min: 10.0,
    max: 12.0,
    default: 11.0,
    description: 'Hard money or private lending rates'
  },
  
  // Commercial / Multi-Family (5+ units)
  'Commercial': {
    min: 7.5,
    max: 8.5,
    default: 8.0,
    description: 'Commercial loan rates for larger properties'
  },
  
  // Portfolio Lending
  'Portfolio': {
    min: 8.0,
    max: 9.0,
    default: 8.5,
    description: 'Portfolio lender rates for multiple properties'
  },
  
  // Short-Term Rental / Airbnb
  'Short-Term Rental': {
    min: 7.5,
    max: 8.5,
    default: 8.0,
    description: 'Specialty STR loans or conventional investment'
  },
  
  // Default fallback
  'Default': {
    min: 7.0,
    max: 8.5,
    default: 7.75,
    description: 'Standard investment property rates'
  }
};

/**
 * Get appropriate interest rate based on strategy and property type
 */
export function getStrategyInterestRate(
  strategy: string,
  propertyType?: string,
  units?: number
): InterestRateRange {
  // Multi-family properties (5+ units) should use commercial rates
  if (units && units >= 5) {
    return INTEREST_RATE_DEFAULTS['Commercial'];
  }
  
  // Check if strategy exists in our defaults
  if (strategy in INTEREST_RATE_DEFAULTS) {
    return INTEREST_RATE_DEFAULTS[strategy];
  }
  
  // Check common variations
  const strategyLower = strategy.toLowerCase();
  if (strategyLower.includes('flip')) {
    return INTEREST_RATE_DEFAULTS['Fix & Flip'];
  }
  if (strategyLower.includes('brrrr')) {
    return INTEREST_RATE_DEFAULTS['BRRRR'];
  }
  if (strategyLower.includes('house') && strategyLower.includes('hack')) {
    return INTEREST_RATE_DEFAULTS['House Hack'];
  }
  if (strategyLower.includes('airbnb') || strategyLower.includes('short')) {
    return INTEREST_RATE_DEFAULTS['Short-Term Rental'];
  }
  
  // Default to standard investment property rates
  return INTEREST_RATE_DEFAULTS['Default'];
}

/**
 * Format interest rate for display
 */
export function formatInterestRate(rate: number): string {
  return `${rate.toFixed(2)}%`;
}

/**
 * Calculate monthly payment (Principal & Interest)
 */
export function calculateMonthlyPayment(
  loanAmount: number,
  interestRate: number,
  loanTermYears: number = 30
): number {
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = loanTermYears * 12;
  
  if (monthlyRate === 0) {
    return loanAmount / numPayments;
  }
  
  const monthlyPayment = loanAmount * 
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
    (Math.pow(1 + monthlyRate, numPayments) - 1);
  
  return Math.round(monthlyPayment);
}