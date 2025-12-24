-- Part 2: Fix Critical Functions
-- Updates functions to use proper security context and search_path

-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS can_user_analyze(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_analysis_stats(UUID) CASCADE;
DROP FUNCTION IF EXISTS increment_analysis_usage(UUID) CASCADE;
DROP FUNCTION IF EXISTS get_or_create_usage_record(UUID, TEXT) CASCADE;

-- Function: update_updated_at_column (use SECURITY INVOKER)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function: handle_new_user (needs SECURITY DEFINER for profile creation)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, username, subscription_tier, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Function: can_user_analyze (use SECURITY INVOKER with checks)
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_subscription_tier TEXT;
  v_current_month TEXT;
  v_current_count INTEGER;
  v_tier_limit INTEGER;
  v_can_analyze BOOLEAN;
  v_remaining INTEGER;
BEGIN
  -- Use current user if not specified
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Only allow checking own status
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own analysis status';
  END IF;

  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');

  -- Get subscription tier
  SELECT subscription_tier INTO v_subscription_tier
  FROM user_profiles
  WHERE id = v_user_id;

  v_subscription_tier := COALESCE(v_subscription_tier, 'free');

  -- Get current usage
  SELECT COALESCE(analysis_count, 0) INTO v_current_count
  FROM usage_tracking
  WHERE user_id = v_user_id AND month_year = v_current_month;

  v_current_count := COALESCE(v_current_count, 0);

  -- Set limits
  CASE v_subscription_tier
    WHEN 'free' THEN v_tier_limit := 3;
    WHEN 'pro' THEN v_tier_limit := 25;
    WHEN 'premium' THEN v_tier_limit := 999;
    WHEN 'enterprise' THEN v_tier_limit := 9999;
    ELSE v_tier_limit := 3;
  END CASE;

  v_can_analyze := v_current_count < v_tier_limit;
  v_remaining := GREATEST(0, v_tier_limit - v_current_count);

  RETURN json_build_object(
    'can_analyze', v_can_analyze,
    'analyses_used', v_current_count,
    'tier_limit', v_tier_limit,
    'remaining', v_remaining,
    'subscription_tier', v_subscription_tier
  );
END;
$$;

-- Function: get_user_analysis_stats (use SECURITY INVOKER)
CREATE OR REPLACE FUNCTION get_user_analysis_stats(p_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  month_val TEXT;
  count_val INTEGER;
  limit_val INTEGER;
  tier_val TEXT;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Only allow checking own stats
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only check your own stats';
  END IF;

  month_val := TO_CHAR(CURRENT_DATE, 'YYYY-MM');

  SELECT subscription_tier INTO tier_val
  FROM user_profiles
  WHERE id = v_user_id;

  tier_val := COALESCE(tier_val, 'free');

  SELECT COALESCE(analysis_count, 0) INTO count_val
  FROM usage_tracking
  WHERE user_id = v_user_id AND month_year = month_val;

  count_val := COALESCE(count_val, 0);

  CASE tier_val
    WHEN 'free' THEN limit_val := 3;
    WHEN 'pro' THEN limit_val := 25;
    WHEN 'premium' THEN limit_val := 999;
    WHEN 'enterprise' THEN limit_val := 9999;
    ELSE limit_val := 3;
  END CASE;

  RETURN json_build_object(
    'current_month', month_val,
    'analyses_used', count_val,
    'monthly_limit', limit_val,
    'remaining', GREATEST(0, limit_val - count_val),
    'subscription_tier', tier_val,
    'can_analyze', count_val < limit_val
  );
END;
$$;

-- Function: increment_analysis_usage (needs SECURITY DEFINER for updates)
CREATE OR REPLACE FUNCTION increment_analysis_usage(p_user_id UUID DEFAULT NULL)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID;
  v_current_month TEXT;
  v_current_count INTEGER;
BEGIN
  v_user_id := COALESCE(p_user_id, auth.uid());

  -- Only allow incrementing own usage
  IF v_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only increment your own usage';
  END IF;

  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');

  -- Insert or update usage
  INSERT INTO usage_tracking (user_id, month_year, analysis_count, last_analysis_at)
  VALUES (v_user_id, v_current_month, 1, NOW())
  ON CONFLICT (user_id, month_year)
  DO UPDATE SET
    analysis_count = usage_tracking.analysis_count + 1,
    last_analysis_at = NOW(),
    updated_at = NOW();

  -- Get updated count
  SELECT analysis_count INTO v_current_count
  FROM usage_tracking
  WHERE user_id = v_user_id AND month_year = v_current_month;

  RETURN json_build_object(
    'success', true,
    'month_year', v_current_month,
    'analysis_count', v_current_count
  );
END;
$$;

-- Function: get_or_create_usage_record (needs SECURITY DEFINER for inserts)
CREATE OR REPLACE FUNCTION get_or_create_usage_record(p_user_id UUID, p_month TEXT)
RETURNS usage_tracking
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_record usage_tracking;
BEGIN
  -- Only allow managing own records
  IF p_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Unauthorized: Can only manage your own usage records';
  END IF;

  -- Try to get existing record
  SELECT * INTO v_record
  FROM usage_tracking
  WHERE user_id = p_user_id AND month_year = p_month;

  -- Create if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO usage_tracking (user_id, month_year, analysis_count)
    VALUES (p_user_id, p_month, 0)
    RETURNING * INTO v_record;
  END IF;

  RETURN v_record;
END;
$$;