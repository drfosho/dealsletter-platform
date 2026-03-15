-- Fix: Recreate user_profiles trigger for automatic profile creation on signup
-- The trigger was dropped by CASCADE in 20250115_security_fix_part2_functions.sql
-- and never recreated. The old function also referenced columns (email, username)
-- that don't exist in the user_profiles table.

-- Step 1: Ensure the subscription_tier constraint accepts all current tiers
-- Drop old CHECK constraint(s) if they exist
ALTER TABLE user_profiles DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

-- Add the updated constraint with all valid tiers including 'free'
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_subscription_tier_check
  CHECK (subscription_tier IN ('free', 'basic', 'starter', 'pro', 'pro-plus', 'professional', 'premium', 'enterprise'));

-- Update default to 'free' (may already be set, safe to re-run)
ALTER TABLE user_profiles ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Step 2: Recreate the handle_new_user() function with correct columns
-- Uses only columns that exist in the user_profiles table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.user_profiles (
    id,
    full_name,
    first_name,
    last_name,
    subscription_tier,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Step 3: Recreate the trigger (dropped by CASCADE in security fix migration)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Recreate the updated_at trigger on user_profiles (also dropped by CASCADE)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
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

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Step 5: Fix can_user_analyze() — tier limits were wrong (pro=25 instead of 50)
-- and missing most tiers (pro-plus, professional, premium, basic, starter)
-- Must drop first because the old version has a different return type (TABLE vs JSON)
DROP FUNCTION IF EXISTS can_user_analyze(UUID);
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
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
  v_current_month := TO_CHAR(CURRENT_DATE, 'YYYY-MM');

  -- Get user's subscription tier from user_profiles and email from auth.users
  SELECT
    p.subscription_tier,
    au.email
  INTO
    v_subscription_tier,
    v_user_email
  FROM user_profiles p
  JOIN auth.users au ON au.id = p.id
  WHERE p.id = p_user_id;

  -- Check if user is admin
  IF v_user_email IN ('kevin@dealsletter.io', 'godbeykevin@gmail.com', 'admin@dealsletter.com') THEN
    v_is_admin := true;
  END IF;

  v_subscription_tier := COALESCE(LOWER(v_subscription_tier), 'free');

  -- Get current usage count
  SELECT COALESCE(analysis_count, 0)
  INTO v_current_count
  FROM usage_tracking
  WHERE user_id = p_user_id AND month_year = v_current_month;

  v_current_count := COALESCE(v_current_count, 0);

  -- Determine tier limit — must match TIER_LIMITS in /api/analysis/usage
  CASE v_subscription_tier
    WHEN 'free' THEN v_tier_limit := 10;
    WHEN 'basic' THEN v_tier_limit := 10;
    WHEN 'starter' THEN v_tier_limit := 10;
    WHEN 'pro' THEN v_tier_limit := 50;
    WHEN 'professional' THEN v_tier_limit := 50;
    WHEN 'pro-plus' THEN v_tier_limit := 200;
    WHEN 'premium' THEN v_tier_limit := 50;
    WHEN 'enterprise' THEN v_tier_limit := 9999;
    ELSE v_tier_limit := 10;
  END CASE;

  -- Admin users get unlimited
  IF v_is_admin THEN
    v_tier_limit := 9999;
    v_can_analyze := true;
    v_remaining := 9999;
  ELSE
    v_can_analyze := v_current_count < v_tier_limit;
    v_remaining := GREATEST(0, v_tier_limit - v_current_count);
  END IF;

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

-- Step 6: Backfill — create user_profiles rows for any auth users missing them
INSERT INTO public.user_profiles (id, full_name, subscription_tier, created_at, updated_at)
SELECT
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', ''),
  'free',
  COALESCE(au.created_at, NOW()),
  NOW()
FROM auth.users au
LEFT JOIN public.user_profiles up ON up.id = au.id
WHERE up.id IS NULL
ON CONFLICT (id) DO NOTHING;
