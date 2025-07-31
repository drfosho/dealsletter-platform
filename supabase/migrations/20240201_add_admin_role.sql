-- Add admin role support to user profiles
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user';

-- Create an index on email for faster admin lookups
CREATE INDEX IF NOT EXISTS idx_auth_users_email ON auth.users(email);

-- Update the can_user_analyze function to consider admin status
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS TABLE(
  can_analyze BOOLEAN,
  analyses_used INTEGER,
  tier_limit INTEGER,
  remaining INTEGER,
  subscription_tier TEXT,
  message TEXT,
  is_admin BOOLEAN
) AS $$
DECLARE
  v_profile RECORD;
  v_usage RECORD;
  v_tier RECORD;
  v_is_admin BOOLEAN;
  v_user_email TEXT;
BEGIN
  -- Get user email and check if admin
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = p_user_id;
  
  -- Get user profile
  SELECT * INTO v_profile
  FROM user_profiles
  WHERE id = p_user_id;
  
  -- Check if user is admin (you can update this logic as needed)
  v_is_admin := COALESCE(v_profile.is_admin, FALSE);
  
  -- If admin, return unlimited access
  IF v_is_admin THEN
    RETURN QUERY
    SELECT 
      TRUE AS can_analyze,
      0 AS analyses_used,
      9999 AS tier_limit,
      9999 AS remaining,
      'enterprise'::TEXT AS subscription_tier,
      'Admin access - unlimited analyses'::TEXT AS message,
      TRUE AS is_admin;
    RETURN;
  END IF;
  
  -- For non-admin users, proceed with normal logic
  -- Get current month usage
  SELECT * INTO v_usage
  FROM user_usage
  WHERE user_id = p_user_id
  AND month = TO_CHAR(CURRENT_DATE, 'YYYY-MM');
  
  -- Get subscription tier limits
  SELECT * INTO v_tier
  FROM subscription_tiers
  WHERE name = COALESCE(v_profile.subscription_tier, 'free');
  
  -- Calculate values
  DECLARE
    v_used INTEGER;
    v_limit INTEGER;
    v_can_analyze BOOLEAN;
  BEGIN
    v_used := COALESCE(v_usage.usage_count, 0);
    v_limit := COALESCE(v_tier.analyses_per_month, 3);
    v_can_analyze := v_used < v_limit;
    
    RETURN QUERY
    SELECT 
      v_can_analyze AS can_analyze,
      v_used AS analyses_used,
      v_limit AS tier_limit,
      GREATEST(0, v_limit - v_used) AS remaining,
      COALESCE(v_profile.subscription_tier, 'free')::TEXT AS subscription_tier,
      CASE 
        WHEN v_can_analyze THEN 'You can analyze properties'::TEXT
        ELSE 'Monthly limit reached. Please upgrade to Pro for more analyses'::TEXT
      END AS message,
      FALSE AS is_admin;
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to set admin status (only callable by service role)
CREATE OR REPLACE FUNCTION set_user_admin_status(p_user_email TEXT, p_is_admin BOOLEAN)
RETURNS VOID AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_user_email;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User not found with email: %', p_user_email;
  END IF;
  
  -- Update user profile
  UPDATE user_profiles
  SET 
    is_admin = p_is_admin,
    role = CASE WHEN p_is_admin THEN 'admin' ELSE 'user' END,
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Create profile if it doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_profiles (id, is_admin, role, subscription_tier)
    VALUES (v_user_id, p_is_admin, CASE WHEN p_is_admin THEN 'admin' ELSE 'user' END, 'free');
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission only to service role
REVOKE ALL ON FUNCTION set_user_admin_status(TEXT, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION set_user_admin_status(TEXT, BOOLEAN) TO service_role;

-- Example: To make a user an admin, run this as service role:
-- SELECT set_user_admin_status('admin@example.com', true);