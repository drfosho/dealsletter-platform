-- Fix usage tracking and analysis storage issues

-- First, ensure the increment_analysis_usage function exists and works for all users
CREATE OR REPLACE FUNCTION increment_analysis_usage(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_month TEXT;
  v_current_count INTEGER;
  v_result JSON;
BEGIN
  -- Get current month in YYYY-MM format
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (user_id, month_year, analysis_count, last_analysis_at)
  VALUES (p_user_id, v_current_month, 1, NOW())
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET 
    analysis_count = usage_tracking.analysis_count + 1,
    last_analysis_at = NOW(),
    updated_at = NOW();
  
  -- Get the updated count
  SELECT analysis_count INTO v_current_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  -- Return the result
  v_result := json_build_object(
    'success', true,
    'month_year', v_current_month,
    'analysis_count', v_current_count,
    'message', 'Usage incremented successfully'
  );
  
  RETURN v_result;
END;
$$;

-- Update the can_user_analyze function to properly handle admin users
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_subscription_tier TEXT;
  v_current_month TEXT;
  v_current_count INTEGER;
  v_tier_limit INTEGER;
  v_can_analyze BOOLEAN;
  v_remaining INTEGER;
  v_result JSON;
  v_user_email TEXT;
  v_is_admin BOOLEAN := false;
BEGIN
  -- Get current month
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Get user's email and subscription tier
  SELECT 
    p.subscription_tier,
    au.email
  INTO 
    v_subscription_tier,
    v_user_email
  FROM user_profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = p_user_id;
  
  -- Check if user is admin (hardcoded for now - in production, use a proper admin table)
  IF v_user_email IN ('godbeykevin@gmail.com', 'admin@dealsletter.com') THEN
    v_is_admin := true;
  END IF;
  
  -- Set default values
  v_subscription_tier := COALESCE(v_subscription_tier, 'free');
  
  -- Get current usage count
  SELECT COALESCE(analysis_count, 0) 
  INTO v_current_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND month_year = v_current_month;
  
  -- If no record exists, count is 0
  v_current_count := COALESCE(v_current_count, 0);
  
  -- Determine tier limit
  CASE v_subscription_tier
    WHEN 'free' THEN v_tier_limit := 3;
    WHEN 'pro' THEN v_tier_limit := 25;
    WHEN 'enterprise' THEN v_tier_limit := 9999;
    ELSE v_tier_limit := 3;
  END CASE;
  
  -- Admin users get unlimited (but still track usage)
  IF v_is_admin THEN
    v_tier_limit := 9999;
    v_can_analyze := true;
    v_remaining := 9999;
  ELSE
    -- Calculate if user can analyze
    v_can_analyze := v_current_count < v_tier_limit;
    v_remaining := GREATEST(0, v_tier_limit - v_current_count);
  END IF;
  
  -- Build result
  v_result := json_build_object(
    'can_analyze', v_can_analyze,
    'analyses_used', v_current_count,
    'tier_limit', v_tier_limit,
    'remaining', v_remaining,
    'subscription_tier', v_subscription_tier,
    'is_admin', v_is_admin,
    'message', 
    CASE 
      WHEN v_is_admin THEN 'Admin access - unlimited analyses'
      WHEN v_can_analyze THEN 'Analysis available'
      ELSE 'Monthly limit reached. Please upgrade your subscription.'
    END
  );
  
  RETURN v_result;
END;
$$;

-- Create index on analyzed_properties for better performance
CREATE INDEX IF NOT EXISTS idx_analyzed_properties_user_date 
ON analyzed_properties(user_id, analysis_date DESC);

-- Create a view to simplify fetching user analyses with calculated metrics
CREATE OR REPLACE VIEW user_analysis_summary AS
SELECT 
  ap.id,
  ap.user_id,
  ap.address,
  ap.analysis_date,
  ap.deal_type,
  ap.is_favorite,
  ap.roi,
  ap.profit,
  ap.created_at,
  ap.updated_at,
  ap.analysis_data,
  (ap.analysis_data->>'strategy')::text as strategy,
  (ap.analysis_data->>'purchase_price')::numeric as purchase_price,
  (ap.analysis_data->'property_data') as property_data,
  (ap.analysis_data->'ai_analysis') as ai_analysis,
  (ap.analysis_data->'ai_analysis'->'financial_metrics'->>'roi')::numeric as calculated_roi,
  (ap.analysis_data->'ai_analysis'->'financial_metrics'->>'total_profit')::numeric as calculated_profit
FROM analyzed_properties ap;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_analysis_usage TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze TO authenticated;
GRANT SELECT ON user_analysis_summary TO authenticated;

-- Add RLS policies for the view
ALTER VIEW user_analysis_summary SET (security_invoker = true);