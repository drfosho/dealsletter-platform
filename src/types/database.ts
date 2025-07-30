// Database types for property analysis feature
// These types match the Supabase schema created in the migration

export interface UserAnalysis {
  id: string;
  user_id: string;
  address: string;
  strategy: 'flip' | 'rental' | 'brrrr' | 'commercial';
  purchase_price?: number;
  down_payment_percent?: number;
  loan_term?: number;
  interest_rate?: number;
  rehab_costs?: number;
  property_data?: any; // RentCast property details
  market_data?: any; // RentCast market data
  rental_estimate?: any; // RentCast rental estimates
  comparables?: any; // RentCast comparables
  ai_analysis: {
    summary?: string;
    recommendation?: string;
    risks?: string[];
    opportunities?: string[];
    financial_metrics?: {
      monthly_cash_flow?: number;
      cap_rate?: number;
      cash_on_cash_return?: number;
      total_investment?: number;
      annual_noi?: number;
      roi?: number;
      total_profit?: number;
    };
    market_analysis?: any;
    investment_strategy?: any;
  };
  is_favorite: boolean;
  status: 'generating' | 'completed' | 'failed';
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month: string; // 'YYYY-MM' format
  analyses_count: number;
  subscription_tier: 'free' | 'pro' | 'premium';
  tier_limit: number;
  last_analysis_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyCache {
  id: string;
  address: string;
  property_data?: any;
  rental_estimate?: any;
  market_data?: any;
  comparables?: any;
  cache_hit_count: number;
  last_accessed: string;
  created_at: string;
  expires_at: string;
}

export interface UserPreferences {
  user_id: string;
  default_strategy: 'flip' | 'rental' | 'brrrr' | 'commercial';
  default_down_payment: number;
  default_loan_term: number;
  default_interest_rate: number;
  saved_financing_scenarios: any[];
  notification_settings: {
    email_analysis_complete: boolean;
    email_monthly_summary: boolean;
  };
  created_at: string;
  updated_at: string;
}

// Helper types for API responses
export interface UsageCheckResponse {
  can_analyze: boolean;
  analyses_used: number;
  tier_limit: number;
  remaining: number;
  subscription_tier: 'free' | 'pro' | 'premium';
  message: string;
}

export interface CreateAnalysisInput {
  address: string;
  strategy: 'flip' | 'rental' | 'brrrr' | 'commercial';
  purchase_price: number;
  down_payment_percent: number;
  loan_term: number;
  interest_rate: number;
  rehab_costs?: number;
}

// Database function response types
export type DatabaseError = {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
};

export type DatabaseResponse<T> = 
  | { data: T; error: null }
  | { data: null; error: DatabaseError };