/**
 * Universal Financial Calculations Utility
 *
 * This module provides bulletproof financial calculations for the property analysis tool.
 * All monetary values are validated and calculations include sanity checks.
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface FinancialInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  interestRate: number;
  loanTermYears: number;
  numberOfUnits?: number;
  rentPerUnit?: number;
  totalMonthlyRent?: number;
  renovationCosts?: number;
  arv?: number;
  propertyType?: string;
  loanType?: 'conventional' | 'hardMoney';
  points?: number;
}

export interface FinancialOutputs {
  loanAmount: number;
  downPayment: number;
  monthlyMortgage: number;
  totalMonthlyRent: number;
  monthlyExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  capRate: number;
  cashOnCashReturn: number;
  totalInvestment: number;
  annualNOI: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// ============================================================================
// PARSING UTILITIES - Fix data type issues
// ============================================================================

/**
 * Safely parse a price value from various input formats
 * Handles strings with commas, dollar signs, and prevents extra zeros
 */
export function parsePrice(value: unknown): number {
  // Handle null/undefined
  if (value === null || value === undefined) {
    return 0;
  }

  // Already a number
  if (typeof value === 'number') {
    if (isNaN(value) || !isFinite(value)) {
      console.error('[parsePrice] Invalid number:', value);
      return 0;
    }
    return Math.round(value * 100) / 100; // Round to 2 decimal places
  }

  // Handle string inputs
  if (typeof value === 'string') {
    // Remove common formatting: $, commas, spaces, and other non-numeric chars (except . and -)
    let cleaned = value
      .replace(/[$,\s]/g, '')  // Remove $, commas, spaces
      .replace(/[^\d.-]/g, '') // Remove anything that's not a digit, decimal, or minus
      .trim();

    // Handle empty string
    if (!cleaned) {
      return 0;
    }

    // Parse as float
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed) || !isFinite(parsed)) {
      console.error('[parsePrice] Failed to parse:', value, '-> cleaned:', cleaned);
      return 0;
    }

    return Math.round(parsed * 100) / 100;
  }

  console.error('[parsePrice] Unexpected type:', typeof value, value);
  return 0;
}

/**
 * Safely parse a percentage value (handles 7 vs 0.07 formats)
 */
export function parsePercentage(value: unknown, expectDecimal: boolean = false): number {
  const parsed = parsePrice(value);

  if (parsed === 0) return 0;

  // If the value is small (< 1) and we don't expect decimal, it's likely already a decimal
  if (!expectDecimal && parsed > 0 && parsed < 1) {
    return parsed * 100;
  }

  // If the value is large (> 100) and we expect a rate, something is wrong
  if (parsed > 100) {
    console.warn('[parsePercentage] Value > 100%, might be parsing error:', value, '-> ', parsed);
  }

  return parsed;
}

/**
 * Safely parse an integer (for units, years, etc.)
 */
export function parseInteger(value: unknown): number {
  const parsed = parsePrice(value);
  return Math.floor(parsed);
}

// ============================================================================
// MORTGAGE CALCULATIONS - Fix calculation errors
// ============================================================================

/**
 * Calculate monthly mortgage payment using standard amortization formula
 * Includes validation to prevent impossible results
 */
export function calculateMonthlyMortgage(
  principal: number,
  annualInterestRate: number,
  termYears: number,
  loanType: 'conventional' | 'hardMoney' = 'conventional',
  additionalPrincipal: number = 0 // For hard money rehab financing
): number {
  // Validate inputs
  if (principal <= 0) {
    console.log('[calculateMonthlyMortgage] No principal, returning 0');
    return 0;
  }

  if (annualInterestRate <= 0) {
    // Interest-free loan (unlikely but handle it)
    return termYears > 0 ? principal / (termYears * 12) : 0;
  }

  if (termYears <= 0) {
    console.error('[calculateMonthlyMortgage] Invalid term:', termYears);
    return 0;
  }

  const monthlyRate = annualInterestRate / 100 / 12;
  const numPayments = termYears * 12;

  // Hard money loans are typically interest-only
  if (loanType === 'hardMoney') {
    let payment = principal * monthlyRate;

    // Add interest on additional principal (rehab funds)
    if (additionalPrincipal > 0) {
      payment += additionalPrincipal * monthlyRate;
    }

    return Math.round(payment * 100) / 100;
  }

  // Standard amortization formula for conventional loans
  const payment = principal *
    (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
    (Math.pow(1 + monthlyRate, numPayments) - 1);

  // Sanity check - monthly payment should be roughly 0.5% to 3% of principal
  // (depends on rate and term, but 3% would be extreme)
  const paymentPercent = (payment / principal) * 100;
  if (paymentPercent > 5) {
    console.error('[calculateMonthlyMortgage] CALCULATION ERROR: Payment too high!', {
      principal,
      annualInterestRate,
      termYears,
      payment,
      paymentPercent: paymentPercent.toFixed(2) + '%'
    });
  }

  return Math.round(payment * 100) / 100;
}

/**
 * Calculate loan amount from purchase price and down payment
 */
export function calculateLoanAmount(
  purchasePrice: number,
  downPaymentPercent: number
): number {
  const price = parsePrice(purchasePrice);
  const downPct = parsePercentage(downPaymentPercent);

  if (price <= 0) return 0;
  if (downPct < 0 || downPct > 100) {
    console.error('[calculateLoanAmount] Invalid down payment %:', downPct);
    return price; // Assume 0% down if invalid
  }

  const downPayment = (price * downPct) / 100;
  return price - downPayment;
}

// ============================================================================
// REVENUE CALCULATIONS - Fix multi-family multiplication
// ============================================================================

/**
 * Calculate total monthly revenue for a property
 * CRITICAL: Always multiplies rent by units for multi-family
 */
export function calculateMonthlyRevenue(
  rentPerUnit: number,
  numberOfUnits: number,
  propertyType?: string
): number {
  const rent = parsePrice(rentPerUnit);
  const units = Math.max(1, parseInteger(numberOfUnits));

  // Calculate total rent
  const totalRent = rent * units;

  // Validation for multi-family properties
  const isMultiFamily = propertyType ?
    propertyType.toLowerCase().includes('multi') ||
    propertyType.toLowerCase().includes('apartment') ||
    propertyType.toLowerCase().includes('duplex') ||
    propertyType.toLowerCase().includes('triplex') ||
    propertyType.toLowerCase().includes('fourplex') :
    units > 1;

  if (isMultiFamily && units > 1 && totalRent === rent) {
    console.error('[calculateMonthlyRevenue] ERROR: Multi-family not multiplying by units!', {
      rentPerUnit: rent,
      numberOfUnits: units,
      totalRent,
      propertyType
    });
  }

  console.log('[calculateMonthlyRevenue] Revenue calculation:', {
    rentPerUnit: rent,
    numberOfUnits: units,
    totalRent,
    calculation: `$${rent.toLocaleString()} × ${units} = $${totalRent.toLocaleString()}`
  });

  return totalRent;
}

// ============================================================================
// OPERATING EXPENSES
// ============================================================================

export interface ExpenseRates {
  propertyTaxRate?: number;    // Default 1.2% annually
  insuranceRate?: number;      // Default 0.35% annually
  maintenancePercent?: number; // Default 10% of rent
  managementPercent?: number;  // Default 8% of rent
  vacancyPercent?: number;     // Default 5% of rent
  hoaMonthly?: number;         // HOA if applicable
}

/**
 * Calculate monthly operating expenses
 */
export function calculateMonthlyExpenses(
  purchasePrice: number,
  monthlyRent: number,
  rates: ExpenseRates = {}
): number {
  const price = parsePrice(purchasePrice);
  const rent = parsePrice(monthlyRent);

  // Default expense rates
  const propertyTaxRate = rates.propertyTaxRate ?? 0.012;    // 1.2% annually
  const insuranceRate = rates.insuranceRate ?? 0.0035;      // 0.35% annually
  const maintenancePercent = rates.maintenancePercent ?? 0.10; // 10% of rent
  const managementPercent = rates.managementPercent ?? 0.08;   // 8% of rent
  const vacancyPercent = rates.vacancyPercent ?? 0.05;         // 5% of rent
  const hoaMonthly = rates.hoaMonthly ?? 0;

  // Calculate each expense
  const monthlyPropertyTax = (price * propertyTaxRate) / 12;
  const monthlyInsurance = (price * insuranceRate) / 12;
  const monthlyMaintenance = rent * maintenancePercent;
  const monthlyManagement = rent * managementPercent;
  const monthlyVacancy = rent * vacancyPercent;

  const totalExpenses =
    monthlyPropertyTax +
    monthlyInsurance +
    monthlyMaintenance +
    monthlyManagement +
    monthlyVacancy +
    hoaMonthly;

  return Math.round(totalExpenses * 100) / 100;
}

// ============================================================================
// COMPLETE FINANCIAL ANALYSIS
// ============================================================================

/**
 * Perform complete financial analysis with all validations
 */
export function calculateCompleteFinancials(inputs: FinancialInputs): FinancialOutputs {
  // Parse all inputs safely
  const purchasePrice = parsePrice(inputs.purchasePrice);
  const downPaymentPercent = parsePercentage(inputs.downPaymentPercent);
  const interestRate = parsePercentage(inputs.interestRate);
  const loanTermYears = parseInteger(inputs.loanTermYears) || 30;
  const numberOfUnits = Math.max(1, parseInteger(inputs.numberOfUnits || 1));
  const rentPerUnit = parsePrice(inputs.rentPerUnit || inputs.totalMonthlyRent || 0);
  const renovationCosts = parsePrice(inputs.renovationCosts || 0);
  const points = parsePercentage(inputs.points || 0);

  // Calculate base values
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const loanAmount = purchasePrice - downPayment;
  const pointsCost = (loanAmount * points) / 100;

  // Calculate monthly mortgage
  const monthlyMortgage = calculateMonthlyMortgage(
    loanAmount,
    interestRate,
    loanTermYears,
    inputs.loanType || 'conventional',
    inputs.loanType === 'hardMoney' ? renovationCosts : 0
  );

  // Calculate revenue (CRITICAL: multiply by units)
  const totalMonthlyRent = inputs.totalMonthlyRent && inputs.totalMonthlyRent > 0
    ? parsePrice(inputs.totalMonthlyRent)
    : calculateMonthlyRevenue(rentPerUnit, numberOfUnits, inputs.propertyType);

  // Calculate expenses
  const monthlyExpenses = calculateMonthlyExpenses(purchasePrice, totalMonthlyRent);

  // Calculate cash flow
  const monthlyCashFlow = totalMonthlyRent - monthlyMortgage - monthlyExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Calculate investment metrics
  // IMPORTANT: Closing costs INCLUDE lender points - do NOT double count
  // Total closing costs = lender points + other fees (title, escrow, etc.)
  // If points are provided, they are PART OF the 3% closing costs
  // If points are 0, use full 3% for other closing costs
  const otherClosingCostsPercent = points > 0 ? (3 - points) : 3; // Remaining after points
  const otherClosingCosts = (purchasePrice * Math.max(0, otherClosingCostsPercent)) / 100;
  const totalClosingCosts = pointsCost + otherClosingCosts; // Points ARE part of closing costs
  const totalInvestment = downPayment + renovationCosts + totalClosingCosts;
  const annualNOI = (totalMonthlyRent * 12) - (monthlyExpenses * 12);

  // Cap Rate
  const capRate = purchasePrice > 0 ? (annualNOI / purchasePrice) * 100 : 0;

  // Cash-on-Cash Return
  const cashOnCashReturn = totalInvestment > 0 ? (annualCashFlow / totalInvestment) * 100 : 0;

  const results: FinancialOutputs = {
    loanAmount,
    downPayment,
    monthlyMortgage,
    totalMonthlyRent,
    monthlyExpenses,
    monthlyCashFlow,
    annualCashFlow,
    capRate,
    cashOnCashReturn,
    totalInvestment,
    annualNOI
  };

  // Log for debugging
  console.log('[calculateCompleteFinancials] Results:', {
    inputs: {
      purchasePrice,
      downPaymentPercent,
      interestRate,
      loanTermYears,
      numberOfUnits,
      rentPerUnit,
      loanType: inputs.loanType
    },
    outputs: results
  });

  return results;
}

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validate financial inputs before calculation
 */
export function validateInputs(inputs: FinancialInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const price = parsePrice(inputs.purchasePrice);
  const downPct = parsePercentage(inputs.downPaymentPercent);
  const rate = parsePercentage(inputs.interestRate);
  const term = parseInteger(inputs.loanTermYears);
  const units = parseInteger(inputs.numberOfUnits || 1);
  const rent = parsePrice(inputs.rentPerUnit || inputs.totalMonthlyRent || 0);

  // Price validation
  if (price < 10000) {
    errors.push('Purchase price is too low (minimum $10,000)');
  } else if (price > 100000000) {
    errors.push('Purchase price exceeds maximum ($100M)');
  }

  // Down payment validation
  if (downPct < 0 || downPct > 100) {
    errors.push('Down payment percentage must be 0-100%');
  } else if (downPct < 3) {
    warnings.push('Down payment below 3% may not qualify for most loans');
  }

  // Interest rate validation
  if (rate < 0 || rate > 30) {
    errors.push('Interest rate out of reasonable range (0-30%)');
  } else if (rate > 15) {
    warnings.push('Interest rate seems high - verify this is correct');
  }

  // Term validation
  if (term < 1 || term > 40) {
    errors.push('Loan term must be 1-40 years');
  }

  // Units validation
  if (units < 1) {
    errors.push('Number of units must be at least 1');
  } else if (units > 500) {
    errors.push('Number of units exceeds maximum (500)');
  }

  // Rent validation
  if (rent < 0) {
    errors.push('Rent cannot be negative');
  } else if (rent > 0 && rent < 100) {
    warnings.push('Rent per unit seems very low');
  } else if (rent > 50000) {
    warnings.push('Rent per unit seems very high - verify this is correct');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate financial outputs for sanity
 */
export function validateOutputs(outputs: FinancialOutputs, inputs: FinancialInputs): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  const price = parsePrice(inputs.purchasePrice);

  // Monthly payment sanity check
  // Payment should be roughly 0.3% to 2% of loan amount monthly
  if (outputs.loanAmount > 0) {
    const paymentPercent = (outputs.monthlyMortgage / outputs.loanAmount) * 100;
    if (paymentPercent > 5) {
      errors.push(`Monthly payment calculation error: ${paymentPercent.toFixed(2)}% of loan amount`);
    }
  }

  // Cash flow sanity check
  if (Math.abs(outputs.monthlyCashFlow) > price * 0.1) {
    warnings.push('Monthly cash flow is unusually high relative to property value');
  }

  // ROI sanity check
  if (Math.abs(outputs.cashOnCashReturn) > 500) {
    warnings.push('Cash-on-cash return is unusually high - verify inputs');
  }

  // Cap rate sanity check
  if (outputs.capRate < 0 || outputs.capRate > 30) {
    warnings.push('Cap rate is outside typical range (0-15%)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// ============================================================================
// STRATEGY-SPECIFIC CALCULATIONS
// ============================================================================

export interface FlipCalculationInputs extends FinancialInputs {
  arv: number;
  holdingPeriodMonths?: number;
  isHardMoney?: boolean; // Indicates hard money loan with rehab holdback
}

export interface ClosingCostsBreakdown {
  lenderPoints: number;
  lenderPointsPercent: number;
  otherClosingCosts: number;
  otherClosingCostsPercent: number;
  totalClosingCosts: number;
  totalClosingCostsPercent: number;
}

export interface FlipCalculationOutputs {
  // Cash Required = What investor brings to closing (down payment + closing costs)
  // For hard money: does NOT include rehab (lender funds via holdback)
  cashRequired: number;

  // Total Investment = All-in project cost for tracking purposes
  // Includes: purchase + rehab + closing + holding
  totalInvestment: number;

  // Total Project Cost = Everything including selling costs
  totalProjectCost: number;

  // Individual cost components
  downPayment: number;
  acquisitionLoan: number;
  rehabHoldback: number;     // Amount funded by lender for rehab (0 if conventional)
  totalLoan: number;         // acquisitionLoan + rehabHoldback
  holdingCosts: number;
  sellingCosts: number;
  closingCosts: number;
  closingCostsBreakdown: ClosingCostsBreakdown;

  // Returns
  netProfit: number;
  roi: number;               // Based on cashRequired (what you actually invest)
  profitMargin: number;      // Based on ARV

  // Financing details
  isHardMoney: boolean;

  // Validation results
  validation: FlipValidationResult;
}

export interface FlipValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Calculate fix & flip returns
 *
 * IMPORTANT: Properly handles hard money financing with rehab holdback:
 * - Hard Money: Lender funds 100% of rehab via holdback (not cash from investor)
 * - Cash Required = Down payment + Closing costs (what investor brings)
 * - Total Investment = All-in cost (for project tracking)
 * - ROI = Net Profit / Cash Required (shows return on actual cash invested)
 */
export function calculateFlipReturns(inputs: FlipCalculationInputs): FlipCalculationOutputs {
  console.log('=== FIX & FLIP CALCULATION DEBUG ===');
  console.log('STEP 1: Parsing inputs...');

  // Parse and validate all inputs
  const purchasePrice = parsePrice(inputs.purchasePrice);
  const downPaymentPercent = parsePercentage(inputs.downPaymentPercent);
  const interestRate = parsePercentage(inputs.interestRate);
  const renovationCosts = parsePrice(inputs.renovationCosts || 0);
  const arv = parsePrice(inputs.arv);
  const holdingMonths = parseInteger(inputs.holdingPeriodMonths || 6);
  const points = parsePercentage(inputs.points || 0);

  console.log('Parsed Input Values:', {
    purchasePrice,
    downPaymentPercent,
    interestRate,
    renovationCosts,
    arv,
    holdingMonths,
    points
  });

  // Initialize validation
  const errors: string[] = [];
  const warnings: string[] = [];

  // INPUT VALIDATION
  console.log('STEP 2: Validating inputs...');

  if (purchasePrice <= 0) {
    errors.push('Purchase price must be greater than 0');
  }
  if (arv <= 0) {
    errors.push('ARV (After Repair Value) must be greater than 0');
  }
  if (arv < purchasePrice) {
    errors.push(`ARV ($${arv.toLocaleString()}) is less than purchase price ($${purchasePrice.toLocaleString()}) - flip cannot be profitable`);
  }
  if (downPaymentPercent < 0 || downPaymentPercent > 100) {
    errors.push(`Down payment percentage (${downPaymentPercent}%) is invalid - must be 0-100%`);
  }
  if (interestRate < 0 || interestRate > 30) {
    errors.push(`Interest rate (${interestRate}%) is out of reasonable range (0-30%)`);
  }
  if (holdingMonths < 1 || holdingMonths > 36) {
    warnings.push(`Holding period (${holdingMonths} months) is unusual - typical flips are 3-12 months`);
  }

  // Determine if this is a hard money loan (default to true for flips with points > 2%)
  const isHardMoney = inputs.isHardMoney ??
    (inputs.loanType === 'hardMoney' || points >= 2);

  console.log('STEP 3: Calculating financing structure...');

  // Calculate financing structure
  const downPayment = (purchasePrice * downPaymentPercent) / 100;
  const acquisitionLoan = purchasePrice - downPayment;

  console.log('Financing:', {
    downPayment: `$${downPayment.toLocaleString()} (${downPaymentPercent}%)`,
    acquisitionLoan: `$${acquisitionLoan.toLocaleString()}`,
    isHardMoney
  });

  // REHAB HOLDBACK: Hard money lenders fund 100% of rehab in holdback
  // This is NOT cash from the investor
  const rehabHoldback = isHardMoney ? renovationCosts : 0;
  const cashForRehab = isHardMoney ? 0 : renovationCosts; // Only pay if conventional

  // Total loan = acquisition + rehab holdback
  const totalLoan = acquisitionLoan + rehabHoldback;

  // Lender points (on acquisition loan, not on rehab holdback typically)
  const pointsCost = (acquisitionLoan * points) / 100;

  console.log('STEP 4: Calculating holding costs...');

  // Calculate holding costs
  // Interest on acquisition loan
  const monthlyAcquisitionInterest = acquisitionLoan * (interestRate / 100 / 12);
  // Interest on rehab holdback (drawn over time, so use 50% average)
  const monthlyRehabInterest = rehabHoldback * (interestRate / 100 / 12) * 0.5;
  const monthlyPropertyTax = (purchasePrice * 0.012) / 12;
  const monthlyInsurance = (purchasePrice * 0.0035) / 12;
  const monthlyUtilities = 200;
  const monthlyMaintenance = 150;

  const monthlyHoldingCosts = monthlyAcquisitionInterest + monthlyRehabInterest +
    monthlyPropertyTax + monthlyInsurance + monthlyUtilities + monthlyMaintenance;
  const totalHoldingCosts = monthlyHoldingCosts * holdingMonths;

  console.log('Holding Costs Breakdown:', {
    monthlyAcquisitionInterest: `$${monthlyAcquisitionInterest.toFixed(2)}`,
    monthlyRehabInterest: `$${monthlyRehabInterest.toFixed(2)}`,
    monthlyPropertyTax: `$${monthlyPropertyTax.toFixed(2)}`,
    monthlyInsurance: `$${monthlyInsurance.toFixed(2)}`,
    monthlyUtilities: `$${monthlyUtilities}`,
    monthlyMaintenance: `$${monthlyMaintenance}`,
    totalMonthly: `$${monthlyHoldingCosts.toFixed(2)}`,
    holdingMonths,
    totalHoldingCosts: `$${totalHoldingCosts.toFixed(2)}`
  });

  console.log('STEP 5: Calculating closing costs...');

  // Calculate closing costs
  // IMPORTANT: Closing costs INCLUDE lender points - do NOT double count
  // For hard money: 2.5% points + 0.5% other = 3% total
  const otherClosingCostsPercent = points > 0 ? Math.max(0.5, 3 - points) : 3;
  const otherClosingCosts = purchasePrice * (otherClosingCostsPercent / 100);
  const totalClosingCosts = pointsCost + otherClosingCosts; // Points ARE part of closing costs

  console.log('Closing Costs:', {
    pointsCost: `$${pointsCost.toFixed(2)} (${points}%)`,
    otherClosingCosts: `$${otherClosingCosts.toFixed(2)} (${otherClosingCostsPercent}%)`,
    totalClosingCosts: `$${totalClosingCosts.toFixed(2)}`
  });

  console.log('STEP 6: Calculating selling costs...');

  // Selling costs
  const sellingCosts = arv * 0.08; // 8% for realtor + closing

  console.log('Selling Costs:', {
    sellingCosts: `$${sellingCosts.toFixed(2)} (8% of ARV $${arv.toLocaleString()})`
  });

  console.log('STEP 7: Calculating investment totals...');

  // CASH REQUIRED = What investor actually brings to closing
  // For hard money: Down payment + Closing costs (NOT including rehab)
  // For conventional: Down payment + Closing costs + Rehab costs
  const cashRequired = downPayment + totalClosingCosts + cashForRehab;

  // TOTAL INVESTMENT = All-in project cost (for tracking, not cash flow)
  // Includes all costs regardless of financing source
  const totalInvestment = purchasePrice + renovationCosts + totalClosingCosts + totalHoldingCosts;

  // TOTAL PROJECT COST = Total investment + selling costs
  const totalProjectCost = totalInvestment + sellingCosts;

  console.log('Investment Summary:', {
    cashRequired: `$${cashRequired.toLocaleString()} (what investor brings)`,
    totalInvestment: `$${totalInvestment.toLocaleString()} (all-in cost)`,
    totalProjectCost: `$${totalProjectCost.toLocaleString()} (including selling)`
  });

  console.log('STEP 8: Calculating returns...');

  // Calculate returns
  const netProfit = arv - totalProjectCost;

  // ROI = Net Profit / Cash Required (shows return on actual cash invested)
  // This accounts for leverage from hard money financing
  const roi = cashRequired > 0 ? (netProfit / cashRequired) * 100 : 0;

  // Profit Margin = Net Profit / ARV (industry standard)
  const profitMargin = arv > 0 ? (netProfit / arv) * 100 : 0;

  console.log('Returns:', {
    arv: `$${arv.toLocaleString()}`,
    totalProjectCost: `$${totalProjectCost.toLocaleString()}`,
    netProfit: `$${netProfit.toLocaleString()}`,
    cashRequired: `$${cashRequired.toLocaleString()}`,
    roi: `${roi.toFixed(2)}%`,
    profitMargin: `${profitMargin.toFixed(2)}%`
  });

  console.log('STEP 9: Running sanity checks...');

  // SANITY CHECKS - Catch calculation errors
  if (netProfit > arv) {
    errors.push(`CALCULATION ERROR: Net profit ($${netProfit.toLocaleString()}) exceeds ARV ($${arv.toLocaleString()}) - this is mathematically impossible`);
    console.error('SANITY CHECK FAILED: Net profit exceeds ARV!');
  }

  if (netProfit > purchasePrice && profitMargin > 50) {
    warnings.push(`Net profit ($${netProfit.toLocaleString()}) exceeds purchase price with ${profitMargin.toFixed(1)}% margin - verify ARV is accurate`);
  }

  if (roi > 500) {
    warnings.push(`ROI of ${roi.toFixed(1)}% is unusually high - verify inputs are correct`);
  }

  if (roi > 1000) {
    errors.push(`CALCULATION ERROR: ROI of ${roi.toFixed(1)}% is unrealistic - likely a calculation error`);
    console.error('SANITY CHECK FAILED: ROI over 1000%!');
  }

  if (totalProjectCost < purchasePrice) {
    errors.push(`CALCULATION ERROR: Total project cost ($${totalProjectCost.toLocaleString()}) is less than purchase price ($${purchasePrice.toLocaleString()})`);
    console.error('SANITY CHECK FAILED: Total project cost less than purchase price!');
  }

  if (totalInvestment < purchasePrice) {
    errors.push(`CALCULATION ERROR: Total investment ($${totalInvestment.toLocaleString()}) is less than purchase price ($${purchasePrice.toLocaleString()})`);
    console.error('SANITY CHECK FAILED: Total investment less than purchase price!');
  }

  // Check if holding costs seem reasonable (1-15% of purchase price for typical 3-12 month flip)
  const holdingCostPercent = (totalHoldingCosts / purchasePrice) * 100;
  if (holdingCostPercent < 1) {
    warnings.push(`Holding costs (${holdingCostPercent.toFixed(1)}% of purchase price) seem too low`);
  }
  if (holdingCostPercent > 20) {
    warnings.push(`Holding costs (${holdingCostPercent.toFixed(1)}% of purchase price) seem too high`);
  }

  const validation: FlipValidationResult = {
    isValid: errors.length === 0,
    errors,
    warnings
  };

  console.log('STEP 10: Validation Results:', {
    isValid: validation.isValid,
    errors: validation.errors,
    warnings: validation.warnings
  });

  console.log('=== END FIX & FLIP CALCULATION ===');

  // Log final summary for easy debugging
  console.log('[calculateFlipReturns] FINAL SUMMARY:', {
    isHardMoney,
    purchasePrice: `$${purchasePrice.toLocaleString()}`,
    arv: `$${arv.toLocaleString()}`,
    renovationCosts: `$${renovationCosts.toLocaleString()}`,
    netProfit: `$${netProfit.toLocaleString()}`,
    roi: `${roi.toFixed(2)}%`,
    isValid: validation.isValid
  });

  return {
    cashRequired,
    totalInvestment,
    totalProjectCost,
    downPayment,
    acquisitionLoan,
    rehabHoldback,
    totalLoan,
    holdingCosts: totalHoldingCosts,
    sellingCosts,
    netProfit,
    roi,
    profitMargin,
    closingCosts: totalClosingCosts,
    closingCostsBreakdown: {
      lenderPoints: pointsCost,
      lenderPointsPercent: points,
      otherClosingCosts,
      otherClosingCostsPercent,
      totalClosingCosts,
      totalClosingCostsPercent: points + otherClosingCostsPercent
    },
    isHardMoney,
    validation
  };
}

/**
 * Validate flip calculation results for sanity
 * Use this to catch impossible results before displaying to user
 */
export function validateFlipResults(results: FlipCalculationOutputs): FlipValidationResult {
  return results.validation;
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Format a number as currency
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

/**
 * Format a number as percentage
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}
