/**
 * BRRRR Strategy Calculator
 * Buy, Rehab, Rent, Refinance, Repeat
 * 
 * This calculator implements the complete BRRRR financial model with 3 distinct phases:
 * 1. Acquisition & Renovation (negative cash flow)
 * 2. Refinance (capital recovery)
 * 3. Long-term Rental (positive cash flow)
 */

export interface BRRRRInputs {
  purchasePrice: number;
  downPaymentPercent: number;
  renovationCosts: number;
  monthlyRent: number;
  arv?: number; // After Repair Value - if not provided, will be calculated
  refinanceLTV?: number; // Loan-to-Value for refinance (default 75%)
  initialLoanType?: 'hardMoney' | 'conventional';
  initialInterestRate?: number;
  refinanceInterestRate?: number;
  renovationMonths?: number;
  closingCostPercent?: number;
  propertyTaxRate?: number;
  insuranceRate?: number;
  maintenancePercent?: number;
  managementPercent?: number;
  vacancyPercent?: number;
}

export interface BRRRRPhase1 {
  purchasePrice: number;
  downPayment: number;
  initialLoanAmount: number;
  renovationCosts: number;
  closingCosts: number;
  monthlyHoldingCosts: number;
  totalHoldingCosts: number;
  totalCashInvested: number;
  renovationMonths: number;
}

export interface BRRRRPhase2 {
  arv: number;
  refinanceLTV: number;
  refinanceAmount: number;
  initialLoanPayoff: number;
  cashReturned: number;
  cashLeftInDeal: number;
  capitalRecoveryPercent: number;
}

export interface BRRRRPhase3 {
  monthlyRent: number;
  newLoanPayment: number;
  monthlyOperatingExpenses: number;
  monthlyCashFlow: number;
  annualCashFlow: number;
  cashOnCashReturn: number;
  capRate: number;
  annualNOI: number;
}

export interface BRRRRResults {
  phase1: BRRRRPhase1;
  phase2: BRRRRPhase2;
  phase3: BRRRRPhase3;
  summary: {
    totalROI: number;
    isInfiniteReturn: boolean;
    brrrrRating: 'excellent' | 'good' | 'marginal' | 'poor';
    recommendation: string;
  };
  timeline: {
    year: number;
    cashFlow: number;
    totalReturn: number;
    description: string;
  }[];
}

export function calculateBRRRR(inputs: BRRRRInputs): BRRRRResults {
  // Set defaults
  const refinanceLTV = inputs.refinanceLTV || 0.75; // 75% default
  const initialRate = inputs.initialInterestRate || (inputs.initialLoanType === 'hardMoney' ? 10.45 : 7);
  const refinanceRate = inputs.refinanceInterestRate || 7;
  const renovationMonths = inputs.renovationMonths || 6;
  const closingCostPercent = inputs.closingCostPercent || 0.03;
  const propertyTaxRate = inputs.propertyTaxRate || 0.012; // 1.2% annually
  const insuranceRate = inputs.insuranceRate || 0.0035; // 0.35% annually
  const maintenancePercent = inputs.maintenancePercent || 0.10; // 10% of rent
  const managementPercent = inputs.managementPercent || 0.08; // 8% of rent
  const vacancyPercent = inputs.vacancyPercent || 0.05; // 5% vacancy

  // Phase 1: Acquisition & Renovation
  const downPayment = inputs.purchasePrice * (inputs.downPaymentPercent / 100);
  const initialLoanAmount = inputs.purchasePrice - downPayment;
  const closingCosts = inputs.purchasePrice * closingCostPercent;

  // Calculate monthly holding costs during renovation
  const monthlyPropertyTaxes = Math.round((inputs.purchasePrice * propertyTaxRate) / 12);
  const monthlyInsurance = Math.round((inputs.purchasePrice * insuranceRate) / 12);
  const monthlyUtilities = 200; // During renovation
  const monthlyMaintenance = 150; // Security/misc during renovation

  // Initial loan payment
  const monthlyInterestRate = initialRate / 100 / 12;
  let monthlyLoanPayment = 0;

  if (inputs.initialLoanType === 'hardMoney') {
    // Interest-only on purchase loan
    monthlyLoanPayment = Math.round(initialLoanAmount * monthlyInterestRate);
    // Add interest on rehab loan if financed
    if (inputs.renovationCosts > 0) {
      monthlyLoanPayment += Math.round(inputs.renovationCosts * monthlyInterestRate);
    }
  } else {
    // Traditional amortized payment
    const numPayments = 360; // 30 years
    if (monthlyInterestRate === 0) {
      monthlyLoanPayment = initialLoanAmount / numPayments;
    } else {
      monthlyLoanPayment = initialLoanAmount * 
        (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numPayments)) / 
        (Math.pow(1 + monthlyInterestRate, numPayments) - 1);
    }
  }

  const monthlyHoldingCosts = monthlyLoanPayment + monthlyPropertyTaxes + 
                              monthlyInsurance + monthlyUtilities + monthlyMaintenance;
  const totalHoldingCosts = monthlyHoldingCosts * renovationMonths;

  // Total cash invested (what you actually put in)
  const totalCashInvested = downPayment + 
                           (inputs.initialLoanType === 'hardMoney' ? 0 : inputs.renovationCosts) + 
                           closingCosts + 
                           totalHoldingCosts;

  const phase1: BRRRRPhase1 = {
    purchasePrice: inputs.purchasePrice,
    downPayment,
    initialLoanAmount,
    renovationCosts: inputs.renovationCosts,
    closingCosts,
    monthlyHoldingCosts,
    totalHoldingCosts,
    totalCashInvested,
    renovationMonths
  };

  // Phase 2: Refinance
  // Calculate ARV if not provided
  const arv = inputs.arv || (inputs.purchasePrice + inputs.renovationCosts * 1.5); // 150% of renovation value added
  const refinanceAmount = arv * refinanceLTV;
  
  // What needs to be paid off
  const initialLoanPayoff = initialLoanAmount + 
                           (inputs.initialLoanType === 'hardMoney' ? inputs.renovationCosts : 0);
  
  // Cash returned from refinance
  const cashReturned = refinanceAmount - initialLoanPayoff;
  const cashLeftInDeal = totalCashInvested - cashReturned;
  const capitalRecoveryPercent = totalCashInvested > 0 ? (cashReturned / totalCashInvested) * 100 : 0;

  const phase2: BRRRRPhase2 = {
    arv,
    refinanceLTV,
    refinanceAmount,
    initialLoanPayoff,
    cashReturned,
    cashLeftInDeal,
    capitalRecoveryPercent
  };

  // Phase 3: Long-term Rental
  // New loan payment after refinance (30-year conventional)
  const refinanceMonthlyRate = refinanceRate / 100 / 12;
  const refinanceNumPayments = 360; // 30 years
  
  let newLoanPayment = 0;
  if (refinanceMonthlyRate === 0) {
    newLoanPayment = refinanceAmount / refinanceNumPayments;
  } else {
    newLoanPayment = refinanceAmount * 
      (refinanceMonthlyRate * Math.pow(1 + refinanceMonthlyRate, refinanceNumPayments)) / 
      (Math.pow(1 + refinanceMonthlyRate, refinanceNumPayments) - 1);
  }

  // Operating expenses
  const monthlyOperatingExpenses = monthlyPropertyTaxes + 
                                   monthlyInsurance +
                                   Math.round(inputs.monthlyRent * maintenancePercent) +
                                   Math.round(inputs.monthlyRent * managementPercent) +
                                   Math.round(inputs.monthlyRent * vacancyPercent);

  const monthlyCashFlow = inputs.monthlyRent - newLoanPayment - monthlyOperatingExpenses;
  const annualCashFlow = monthlyCashFlow * 12;

  // Calculate returns
  const cashOnCashReturn = cashLeftInDeal > 0 ? (annualCashFlow / cashLeftInDeal) * 100 : 
                          cashLeftInDeal === 0 ? Infinity : 
                          cashLeftInDeal < 0 ? -Infinity : 0;

  // Cap rate based on ARV
  const annualNOI = (inputs.monthlyRent * 12) - (monthlyOperatingExpenses * 12);
  const capRate = arv > 0 ? (annualNOI / arv) * 100 : 0;

  const phase3: BRRRRPhase3 = {
    monthlyRent: inputs.monthlyRent,
    newLoanPayment: Math.round(newLoanPayment),
    monthlyOperatingExpenses,
    monthlyCashFlow,
    annualCashFlow,
    cashOnCashReturn,
    capRate,
    annualNOI
  };

  // Calculate total ROI over 5 years
  const fiveYearCashFlow = annualCashFlow * 5;
  const estimatedAppreciation = arv * 0.03 * 5; // 3% annual appreciation
  const totalReturn = fiveYearCashFlow + estimatedAppreciation + cashReturned;
  const totalROI = totalCashInvested > 0 ? (totalReturn / totalCashInvested) * 100 : 0;

  // Determine BRRRR rating
  let brrrrRating: 'excellent' | 'good' | 'marginal' | 'poor';
  let recommendation: string;

  if (capitalRecoveryPercent >= 100) {
    brrrrRating = 'excellent';
    recommendation = 'Exceptional BRRRR deal - recovers ALL invested capital or more!';
  } else if (capitalRecoveryPercent >= 80) {
    brrrrRating = 'excellent';
    recommendation = 'Excellent BRRRR candidate - recovers 80%+ of investment';
  } else if (capitalRecoveryPercent >= 60) {
    brrrrRating = 'good';
    recommendation = 'Good BRRRR candidate - recovers 60-80% of investment';
  } else if (capitalRecoveryPercent >= 40) {
    brrrrRating = 'marginal';
    recommendation = 'Marginal BRRRR candidate - recovers 40-60% of investment';
  } else {
    brrrrRating = 'poor';
    recommendation = 'Poor BRRRR candidate - recovers less than 40% of investment';
  }

  // Build timeline
  const timeline = [];
  
  // Year 0 - Renovation Phase
  timeline.push({
    year: 0,
    cashFlow: -totalCashInvested,
    totalReturn: -totalCashInvested,
    description: `Initial investment and ${renovationMonths}-month renovation`
  });

  // Year 1 - Refinance and first year rental
  const year1CashFlow = cashReturned + (annualCashFlow * (12 - renovationMonths) / 12);
  timeline.push({
    year: 1,
    cashFlow: year1CashFlow,
    totalReturn: year1CashFlow - totalCashInvested,
    description: 'Refinance cash-out + partial year rental income'
  });

  // Years 2-5 - Rental income
  let cumulativeReturn = year1CashFlow - totalCashInvested;
  for (let year = 2; year <= 5; year++) {
    cumulativeReturn += annualCashFlow;
    timeline.push({
      year,
      cashFlow: annualCashFlow,
      totalReturn: cumulativeReturn,
      description: 'Annual rental cash flow'
    });
  }

  return {
    phase1,
    phase2,
    phase3,
    summary: {
      totalROI,
      isInfiniteReturn: cashLeftInDeal <= 0,
      brrrrRating,
      recommendation
    },
    timeline
  };
}

/**
 * Format BRRRR results for display
 */
export function formatBRRRRResults(results: BRRRRResults): {
  phase1Display: string[];
  phase2Display: string[];
  phase3Display: string[];
  keyMetrics: { label: string; value: string; highlight?: boolean }[];
} {
  const { phase1, phase2, phase3, summary } = results;

  const phase1Display = [
    `Purchase Price: $${phase1.purchasePrice.toLocaleString()}`,
    `Down Payment: $${phase1.downPayment.toLocaleString()}`,
    `Renovation Budget: $${phase1.renovationCosts.toLocaleString()}`,
    `Monthly Holding Costs: $${phase1.monthlyHoldingCosts.toLocaleString()}`,
    `Total Cash Invested: $${phase1.totalCashInvested.toLocaleString()}`
  ];

  const phase2Display = [
    `After Repair Value: $${phase2.arv.toLocaleString()}`,
    `Refinance Amount (${(phase2.refinanceLTV * 100)}% LTV): $${phase2.refinanceAmount.toLocaleString()}`,
    `Cash Returned: $${phase2.cashReturned.toLocaleString()}`,
    `Cash Left in Deal: $${phase2.cashLeftInDeal.toLocaleString()}`,
    `Capital Recovery: ${phase2.capitalRecoveryPercent.toFixed(1)}%`
  ];

  const phase3Display = [
    `Monthly Rent: $${phase3.monthlyRent.toLocaleString()}`,
    `New Loan Payment: $${phase3.newLoanPayment.toLocaleString()}`,
    `Operating Expenses: $${phase3.monthlyOperatingExpenses.toLocaleString()}`,
    `Monthly Cash Flow: $${phase3.monthlyCashFlow.toLocaleString()}`,
    `Annual Cash Flow: $${phase3.annualCashFlow.toLocaleString()}`
  ];

  const keyMetrics = [
    { 
      label: 'Cash-on-Cash Return', 
      value: phase3.cashOnCashReturn === Infinity ? 'INFINITE' : 
             phase3.cashOnCashReturn === -Infinity ? 'N/A' : 
             `${phase3.cashOnCashReturn.toFixed(1)}%`,
      highlight: phase3.cashOnCashReturn === Infinity
    },
    { 
      label: 'Capital Recovery', 
      value: `${phase2.capitalRecoveryPercent.toFixed(1)}%`,
      highlight: phase2.capitalRecoveryPercent >= 80
    },
    { 
      label: '5-Year Total ROI', 
      value: `${summary.totalROI.toFixed(1)}%`,
      highlight: summary.totalROI > 100
    },
    { 
      label: 'BRRRR Rating', 
      value: summary.brrrrRating.toUpperCase(),
      highlight: summary.brrrrRating === 'excellent'
    }
  ];

  return {
    phase1Display,
    phase2Display,
    phase3Display,
    keyMetrics
  };
}