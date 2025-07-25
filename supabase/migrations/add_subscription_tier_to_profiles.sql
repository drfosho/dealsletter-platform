-- Add subscription_tier column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'basic' 
CHECK (subscription_tier IN ('basic', 'pro', 'premium'));

-- Update existing users to have basic tier if null
UPDATE user_profiles 
SET subscription_tier = 'basic' 
WHERE subscription_tier IS NULL;

-- Make the column NOT NULL after setting defaults
ALTER TABLE user_profiles 
ALTER COLUMN subscription_tier SET NOT NULL;

-- Create an index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_subscription_tier 
ON user_profiles(subscription_tier);

-- Update the usage tracking function to use the correct table name
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS TABLE(can_analyze BOOLEAN, remaining_analyses INTEGER, message TEXT) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_usage_record usage_tracking;
  v_limit INTEGER;
BEGIN
  -- Get user's subscription tier from user_profiles (corrected table name)
  SELECT subscription_tier INTO v_subscription_tier
  FROM user_profiles
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