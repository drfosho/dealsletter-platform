-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_current_period_end TIMESTAMP;

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  period TEXT NOT NULL, -- Format: YYYY-MM
  analysis_count INTEGER DEFAULT 0,
  period_start TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, period)
);

-- Create analysis history table
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id TEXT NOT NULL,
  property_address TEXT,
  analysis_type TEXT, -- 'personal', 'curated'
  created_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_tier ON profiles(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_period ON usage_tracking(user_id, period);
CREATE INDEX IF NOT EXISTS idx_analysis_history_user_id ON analysis_history(user_id);
CREATE INDEX IF NOT EXISTS idx_analysis_history_created_at ON analysis_history(created_at);

-- Create function to check analysis limits
CREATE OR REPLACE FUNCTION check_analysis_limit(p_user_id UUID)
RETURNS TABLE(can_analyze BOOLEAN, remaining_analyses INTEGER, tier_limit INTEGER)
LANGUAGE plpgsql
AS $$
DECLARE
  v_tier TEXT;
  v_limit INTEGER;
  v_count INTEGER;
  v_period TEXT;
BEGIN
  -- Get current period (YYYY-MM)
  v_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Get user's subscription tier
  SELECT subscription_tier INTO v_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- Set limit based on tier
  CASE v_tier
    WHEN 'free' THEN v_limit := 0;
    WHEN 'starter' THEN v_limit := 12;
    WHEN 'pro' THEN v_limit := 35;
    WHEN 'premium' THEN v_limit := -1; -- Unlimited
    ELSE v_limit := 0;
  END CASE;
  
  -- Get current usage count
  SELECT COALESCE(analysis_count, 0) INTO v_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND period = v_period;
  
  IF v_count IS NULL THEN
    v_count := 0;
  END IF;
  
  -- Return results
  IF v_limit = -1 THEN
    -- Unlimited
    RETURN QUERY SELECT true, -1, -1;
  ELSIF v_count < v_limit THEN
    RETURN QUERY SELECT true, (v_limit - v_count), v_limit;
  ELSE
    RETURN QUERY SELECT false, 0, v_limit;
  END IF;
END;
$$;

-- Create function to increment analysis count
CREATE OR REPLACE FUNCTION increment_analysis_count(p_user_id UUID, p_property_id TEXT, p_property_address TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_period TEXT;
  v_can_analyze BOOLEAN;
BEGIN
  -- Get current period
  v_period := TO_CHAR(NOW(), 'YYYY-MM');
  
  -- Check if user can analyze
  SELECT can_analyze INTO v_can_analyze
  FROM check_analysis_limit(p_user_id);
  
  IF NOT v_can_analyze THEN
    RETURN false;
  END IF;
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (user_id, period, analysis_count, period_start)
  VALUES (p_user_id, v_period, 1, NOW())
  ON CONFLICT (user_id, period)
  DO UPDATE SET 
    analysis_count = usage_tracking.analysis_count + 1,
    updated_at = NOW();
  
  -- Record analysis in history
  INSERT INTO analysis_history (user_id, property_id, property_address, analysis_type)
  VALUES (p_user_id, p_property_id, p_property_address, 'personal');
  
  RETURN true;
END;
$$;

-- Create RLS policies
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can only see their own analysis history
CREATE POLICY "Users can view own analysis history" ON analysis_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analysis history" ON analysis_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);