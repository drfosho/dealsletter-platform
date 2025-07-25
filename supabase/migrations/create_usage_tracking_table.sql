-- Create usage_tracking table for monitoring analysis usage per user per month
CREATE TABLE IF NOT EXISTS usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month_year TEXT NOT NULL, -- Format: 'YYYY-MM'
  analysis_count INTEGER NOT NULL DEFAULT 0,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, month_year)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_id ON usage_tracking(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_month_year ON usage_tracking(month_year);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, month_year);

-- Enable Row Level Security
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert usage records" ON usage_tracking
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update usage records" ON usage_tracking
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to get or create current month's usage record
CREATE OR REPLACE FUNCTION get_or_create_usage_record(p_user_id UUID)
RETURNS usage_tracking AS $$
DECLARE
  v_month_year TEXT;
  v_record usage_tracking;
BEGIN
  -- Get current month in YYYY-MM format
  v_month_year := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Try to get existing record
  SELECT * INTO v_record
  FROM usage_tracking
  WHERE user_id = p_user_id AND month_year = v_month_year;
  
  -- If no record exists, create one
  IF NOT FOUND THEN
    INSERT INTO usage_tracking (user_id, month_year, analysis_count)
    VALUES (p_user_id, v_month_year, 0)
    RETURNING * INTO v_record;
  END IF;
  
  RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_analysis_usage(p_user_id UUID)
RETURNS usage_tracking AS $$
DECLARE
  v_record usage_tracking;
BEGIN
  -- Get or create current month's record
  v_record := get_or_create_usage_record(p_user_id);
  
  -- Increment the count
  UPDATE usage_tracking
  SET 
    analysis_count = analysis_count + 1,
    last_analysis_at = NOW(),
    updated_at = NOW()
  WHERE id = v_record.id
  RETURNING * INTO v_record;
  
  RETURN v_record;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can analyze (based on subscription limits)
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS TABLE(can_analyze BOOLEAN, remaining_analyses INTEGER, message TEXT) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_usage_record usage_tracking;
  v_limit INTEGER;
BEGIN
  -- Get user's subscription tier from profiles
  SELECT subscription_tier INTO v_subscription_tier
  FROM profiles
  WHERE id = p_user_id;
  
  -- If no profile found, assume basic
  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'basic';
  END IF;
  
  -- Set limits based on tier
  CASE v_subscription_tier
    WHEN 'basic' THEN v_limit := 0;
    WHEN 'pro' THEN v_limit := 15;
    WHEN 'premium' THEN v_limit := -1; -- -1 means unlimited
    ELSE v_limit := 0; -- Default to basic
  END CASE;
  
  -- If premium (unlimited), return true immediately
  IF v_limit = -1 THEN
    RETURN QUERY SELECT true, -1, 'Unlimited analyses available';
    RETURN;
  END IF;
  
  -- If basic (0 limit), return false immediately
  IF v_limit = 0 THEN
    RETURN QUERY SELECT false, 0, 'Upgrade to Pro or Premium to analyze properties';
    RETURN;
  END IF;
  
  -- Get current month's usage
  v_usage_record := get_or_create_usage_record(p_user_id);
  
  -- Check if under limit
  IF v_usage_record.analysis_count < v_limit THEN
    RETURN QUERY SELECT 
      true, 
      v_limit - v_usage_record.analysis_count,
      FORMAT('You have %s analyses remaining this month', v_limit - v_usage_record.analysis_count);
  ELSE
    RETURN QUERY SELECT 
      false, 
      0,
      'Monthly analysis limit reached. Upgrade to Premium for unlimited analyses';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_usage_tracking_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_usage_tracking_updated_at_trigger
  BEFORE UPDATE ON usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_usage_tracking_updated_at();

-- Grant execute permissions on functions
GRANT EXECUTE ON FUNCTION get_or_create_usage_record(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_analysis_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO authenticated;