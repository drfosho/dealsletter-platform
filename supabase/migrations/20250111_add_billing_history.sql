-- Create billing history table for storing invoice data
CREATE TABLE IF NOT EXISTS billing_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount INTEGER, -- Amount in cents
  currency TEXT DEFAULT 'usd',
  status TEXT, -- 'paid', 'pending', 'failed'
  description TEXT,
  invoice_url TEXT,
  invoice_pdf TEXT,
  paid_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes for billing history
CREATE INDEX IF NOT EXISTS idx_billing_history_user_id ON billing_history(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_history_created_at ON billing_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_billing_history_status ON billing_history(status);

-- Enable RLS on billing history
ALTER TABLE billing_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own billing history
CREATE POLICY "Users can view own billing history" ON billing_history
  FOR SELECT USING (auth.uid() = user_id);

-- Add subscription trial end date to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_trial_end TIMESTAMP;

-- Add function to get user's subscription status with all details
CREATE OR REPLACE FUNCTION get_subscription_details(p_user_id UUID)
RETURNS TABLE(
  tier TEXT,
  status TEXT,
  trial_end TIMESTAMP,
  current_period_end TIMESTAMP,
  can_analyze BOOLEAN,
  analyses_used INTEGER,
  analyses_limit INTEGER,
  stripe_customer_id TEXT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_period TEXT;
  v_limit_result RECORD;
BEGIN
  v_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  RETURN QUERY
  SELECT 
    p.subscription_tier,
    p.subscription_status,
    p.subscription_trial_end,
    p.subscription_current_period_end,
    l.can_analyze,
    COALESCE(u.analysis_count, 0),
    l.tier_limit,
    p.stripe_customer_id
  FROM profiles p
  LEFT JOIN LATERAL (
    SELECT * FROM check_analysis_limit(p_user_id)
  ) l ON true
  LEFT JOIN usage_tracking u ON u.user_id = p_user_id AND u.period = v_period
  WHERE p.id = p_user_id;
END;
$$;