-- Add missing columns to properties table for auto-analyzer compatibility
-- Run this in Supabase SQL Editor to fix column not found errors

-- Add ARV (After Repair Value) column for flip properties
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS arv DECIMAL;

-- Add AVM (Automated Valuation Model) column
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS avm DECIMAL;

-- Add other commonly used columns from the auto-analyzer
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS city TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS state TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS zip_code TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS strategy TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS investment_strategy TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS down_payment DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS down_payment_percent DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS monthly_cash_flow DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS total_roi DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS cash_on_cash_return DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rehab_costs DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS current_cap_rate DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS pro_forma_cap_rate DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rent_analysis JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS market_analysis JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rehab_analysis JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_metrics JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS value_add_description TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS confidence TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS risk_level TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS days_on_market INTEGER;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS listing_url TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS listing_source TEXT;

-- Additional columns from scrapers and analyzers
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS units INTEGER;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS estimated_rehab DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS total_investment DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS expected_profit DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS interest_rate DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS loan_term INTEGER;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS monthly_pi DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS closing_costs DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_taxes DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS insurance DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS hoa_fees DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS utilities DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS maintenance DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS property_management DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS vacancy_rate DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS capital_expenditures DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS executive_summary TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS investment_thesis TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS risk_assessment JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS value_add_opportunities JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS exit_strategy TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS recommended_actions JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rehab_details JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS current_rent DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS projected_rent DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS rent_upside DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS cash_required DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS neighborhood TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS neighborhood_class TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS walk_score INTEGER;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS crime_rate TEXT;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS schools JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS pro_forma_cash_flow DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS timeframe TEXT;

-- Additional fields that might be sent by scrapers
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS data_completeness DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS financing_details JSONB;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS monthly_expenses DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS net_operating_income DECIMAL;

ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS debt_service DECIMAL;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Missing columns added successfully!';
  RAISE NOTICE '✅ Properties table is now compatible with auto-analyzer';
  RAISE NOTICE '✅ You can now use the property import feature';
  RAISE NOTICE '';
END $$;