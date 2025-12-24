-- Migration: Update subscription limits for new pricing structure (December 2024)
-- FREE: 3 analyses/month
-- PRO: 30 analyses/month @ $49/month
-- PREMIUM: 30 analyses/month (grandfathered users)

-- Drop and recreate the can_user_analyze function with new limits
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS TABLE(
  can_analyze BOOLEAN,
  remaining_analyses INTEGER,
  message TEXT,
  analyses_used INTEGER,
  tier_limit INTEGER,
  subscription_tier TEXT
) AS $$
DECLARE
  v_subscription_tier TEXT;
  v_usage_record usage_tracking;
  v_limit INTEGER;
  v_used INTEGER;
BEGIN
  -- Get user's subscription tier from profiles
  SELECT COALESCE(profiles.subscription_tier, 'basic') INTO v_subscription_tier
  FROM profiles
  WHERE id = p_user_id;

  -- If no profile found, assume basic/free
  IF v_subscription_tier IS NULL THEN
    v_subscription_tier := 'basic';
  END IF;

  -- NEW PRICING STRUCTURE (December 2024):
  -- FREE/Basic: 3 analyses/month
  -- PRO: 30 analyses/month @ $49/month
  -- PREMIUM: 30 analyses/month (grandfathered)
  CASE v_subscription_tier
    WHEN 'free' THEN v_limit := 3;
    WHEN 'basic' THEN v_limit := 3;
    WHEN 'starter' THEN v_limit := 3;  -- Legacy - maps to free
    WHEN 'pro' THEN v_limit := 30;
    WHEN 'professional' THEN v_limit := 30;  -- Legacy - maps to pro
    WHEN 'premium' THEN v_limit := 30;  -- Grandfathered pro users
    ELSE v_limit := 3; -- Default to free tier
  END CASE;

  -- Get current month's usage
  v_usage_record := get_or_create_usage_record(p_user_id);
  v_used := COALESCE(v_usage_record.analysis_count, 0);

  -- Check if under limit
  IF v_used < v_limit THEN
    RETURN QUERY SELECT
      true,
      v_limit - v_used,
      FORMAT('%s of %s analyses remaining this month', v_limit - v_used, v_limit),
      v_used,
      v_limit,
      v_subscription_tier;
  ELSE
    RETURN QUERY SELECT
      false,
      0,
      CASE
        WHEN v_subscription_tier IN ('pro', 'professional', 'premium') THEN
          'Monthly limit reached. Contact us for enterprise pricing.'
        ELSE
          'Monthly limit reached. Upgrade to Pro for 30 analyses/month.'
      END,
      v_used,
      v_limit,
      v_subscription_tier;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO anon;

-- Add a comment to document the change
COMMENT ON FUNCTION can_user_analyze(UUID) IS 'Check if user can perform analysis based on subscription tier. Updated Dec 2024: FREE=3, PRO=30, PREMIUM=30';
