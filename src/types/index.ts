// Common type definitions for the platform

export interface Analysis {
  id: string;
  user_id: string;
  address: string;
  property_data: PropertyData;
  rental_estimate: RentalEstimate | null;
  market_data: MarketData | null;
  strategy: string;
  purchase_price: number;
  down_payment_percent: number;
  interest_rate: number;
  loan_term: number;
  rehab_costs: number;
  ai_analysis: AIAnalysis | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyData {
  property?: Array<{
    propertyType?: string;
    squareFootage?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuilt?: number;
    city?: string;
    state?: string;
    zipCode?: string;
    neighborhood?: string;
    lotSize?: number;
  }>;
  [key: string]: unknown;
}

export interface RentalEstimate {
  rent?: number;
  rentRangeLow?: number;
  rentRangeHigh?: number;
  [key: string]: unknown;
}

export interface MarketData {
  medianRent?: number;
  medianSalePrice?: number;
  averageDaysOnMarket?: number;
  [key: string]: unknown;
}

export interface AIAnalysis {
  summary?: string;
  risks?: string[];
  opportunities?: string[];
  financial_metrics?: {
    roi?: number;
    cap_rate?: number;
    cash_on_cash_return?: number;
    monthly_cash_flow?: number;
    annual_noi?: number;
    total_investment?: number;
    total_profit?: number;
    net_profit?: number;
    holding_costs?: number;
  };
  [key: string]: unknown;
}

export interface WizardData {
  address: string;
  propertyData?: PropertyData;
  strategy: string;
  strategyDetails?: {
    targetRent?: number;
    renovationBudget?: number;
    holdPeriod?: number;
    exitStrategy?: string;
    targetGuests?: number;
    avgNightlyRate?: number;
    occupancyRate?: number;
    monthlyRevenue?: number;
    targetMonthlyRent?: number;
    targetSalePrice?: number;
    improvementBudget?: number;
  };
  financial: {
    purchasePrice: number;
    downPaymentPercent: number;
    interestRate: number;
    loanTerm: number;
    renovationCosts: number;
  };
  analysis?: AIAnalysis;
  analysisId?: string;
}

export interface UsageStats {
  used: number;
  limit: number;
  nextReset: Date;
}

export interface AnalysisStats {
  total: number;
  monthly: number;
  saved: number;
  usage: UsageStats;
}