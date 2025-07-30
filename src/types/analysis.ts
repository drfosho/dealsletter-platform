import { PropertyAnalysisRequest } from './rentcast';

export interface UserAnalysis {
  id: string;
  user_id: string;
  address: string;
  property_data: any; // RentCast property data
  analysis_data: {
    summary: string;
    marketPosition: string;
    financialProjections: {
      cashFlow: number;
      capRate: number;
      roi: number;
      cocReturn: number;
      details: string;
    };
    strategyAnalysis: {
      type: string;
      details: string;
    };
    riskAssessment: {
      factors: string[];
      details: string;
    };
    recommendation: string;
    fullAnalysis: string;
  };
  strategy: 'rental' | 'flip' | 'brrrr' | 'airbnb';
  purchase_price: number;
  down_payment: number;
  loan_terms: {
    interestRate: number;
    loanTerm: number;
    loanType: string;
  };
  rehab_costs: number;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month_year: string;
  analyses_count: number;
  last_analysis_at: string;
}

export interface SubscriptionTier {
  id: string;
  name: 'free' | 'pro' | 'enterprise';
  monthly_analysis_limit: number;
  features: {
    basic_analysis: boolean;
    export_pdf: boolean;
    api_access: boolean;
  };
}

export interface AnalysisFormData extends PropertyAnalysisRequest {
  propertyAddress?: string;
}

export interface AnalysisListResponse {
  analyses: UserAnalysis[];
  total: number;
  page: number;
  limit: number;
}

export interface UsageStats {
  current_month_usage: number;
  monthly_limit: number;
  subscription_tier: string;
  can_create_analysis: boolean;
  remaining_analyses: number;
}