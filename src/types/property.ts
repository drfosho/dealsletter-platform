// Generic record type for flexible property data
export type PropertyData = Record<string, any>;

// Type for projection data
export interface ProjectionData {
  year: number;
  grossRent?: number;
  netOperatingIncome?: number;
  cashFlow?: number;
  propertyValue?: number;
  equity?: number;
  totalROI?: number;
  cumulativeCashFlow?: number;
}

// Type for financing scenario
export interface FinancingScenario {
  name: string;
  description?: string;
  downPayment?: number;
  downPaymentPercent?: number;
  interestRate?: number;
  loanTerm?: number;
  monthlyPI?: number;
  totalCashRequired?: number;
  closingCosts?: number;
  monthlyCashFlow?: number;
  cashOnCashReturn?: number;
  totalROI?: number;
  pros?: string[];
  cons?: string[];
}

// Type for exit strategy
export interface ExitStrategy {
  strategy: string;
  description?: string;
  timeline?: string;
  estimatedProfit?: number;
}