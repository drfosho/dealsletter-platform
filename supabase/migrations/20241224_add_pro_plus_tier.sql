-- Migration: Add Pro Plus Tier (December 2024)
-- Date: 2024-12-24
-- Description: Adds new 'pro-plus' tier with updated pricing structure
--
-- NEW PRICING STRUCTURE:
-- FREE:     $0/month   - 3 analyses/month
-- PRO:      $29/month  - 50 analyses/month ($278/year)
-- PRO PLUS: $59/month  - 200 analyses/month ($566/year)
-- PREMIUM:  Legacy     - 50 analyses/month (grandfathered users)

BEGIN;

-- ============================================================================
-- STEP 1: Update subscription_tier ENUM type (if using enum)
-- ============================================================================

-- Check if subscription_tier is an enum type and add 'pro-plus' value
DO $$
BEGIN
    -- Check if the enum type exists
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_tier') THEN
        -- Add 'pro-plus' to the enum if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM pg_enum
            WHERE enumtypid = 'subscription_tier'::regtype
            AND enumlabel = 'pro-plus'
        ) THEN
            ALTER TYPE subscription_tier ADD VALUE IF NOT EXISTS 'pro-plus' AFTER 'pro';
            RAISE NOTICE 'Added pro-plus to subscription_tier enum';
        ELSE
            RAISE NOTICE 'pro-plus already exists in subscription_tier enum';
        END IF;
    ELSE
        RAISE NOTICE 'subscription_tier enum type does not exist - using text columns';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not modify enum (may already exist or be text type): %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 2: Update CHECK constraints on user_profiles table
-- ============================================================================

DO $$
BEGIN
    -- Drop existing constraint
    ALTER TABLE user_profiles
    DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

    -- Add new constraint with pro-plus
    ALTER TABLE user_profiles
    ADD CONSTRAINT user_profiles_subscription_tier_check
    CHECK (subscription_tier IN ('free', 'basic', 'starter', 'pro', 'pro-plus', 'professional', 'premium', 'enterprise'));

    RAISE NOTICE 'Updated user_profiles subscription_tier constraint';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update user_profiles constraint: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 3: Update CHECK constraints on subscriptions table
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'subscriptions'
    ) THEN
        -- Drop existing constraint
        ALTER TABLE subscriptions
        DROP CONSTRAINT IF EXISTS subscriptions_tier_check;

        -- Check if tier column exists and is text type
        IF EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public'
            AND table_name = 'subscriptions'
            AND column_name = 'tier'
            AND data_type = 'text'
        ) THEN
            -- Add new constraint with pro-plus for text column
            ALTER TABLE subscriptions
            ADD CONSTRAINT subscriptions_tier_check
            CHECK (tier IN ('free', 'basic', 'starter', 'pro', 'pro-plus', 'professional', 'premium', 'enterprise'));

            RAISE NOTICE 'Updated subscriptions tier constraint (text)';
        ELSE
            RAISE NOTICE 'subscriptions.tier uses enum type - already updated in Step 1';
        END IF;
    ELSE
        RAISE NOTICE 'subscriptions table does not exist - skipping';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Could not update subscriptions constraint: %', SQLERRM;
END $$;

-- ============================================================================
-- STEP 4: Update usage_limits table
-- ============================================================================

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'usage_limits'
    ) THEN
        -- Update existing tier limits
        UPDATE usage_limits SET analysis_limit = 3 WHERE tier::text = 'free';
        UPDATE usage_limits SET analysis_limit = 3 WHERE tier::text = 'basic';
        UPDATE usage_limits SET analysis_limit = 3 WHERE tier::text = 'starter';
        UPDATE usage_limits SET analysis_limit = 50 WHERE tier::text = 'pro';
        UPDATE usage_limits SET analysis_limit = 50 WHERE tier::text = 'professional';
        UPDATE usage_limits SET analysis_limit = 50 WHERE tier::text = 'premium';

        -- Insert pro-plus tier if it doesn't exist
        INSERT INTO usage_limits (tier, analysis_limit, features)
        VALUES (
            'pro-plus'::subscription_tier,
            200,
            '{"deal_alerts": true, "advanced_analysis": true, "pdf_export": true, "priority_support": true, "email_support": true, "early_access": true, "advanced_dashboard": true}'::jsonb
        )
        ON CONFLICT (tier) DO UPDATE SET
            analysis_limit = 200,
            features = '{"deal_alerts": true, "advanced_analysis": true, "pdf_export": true, "priority_support": true, "email_support": true, "early_access": true, "advanced_dashboard": true}'::jsonb;

        RAISE NOTICE 'Updated usage_limits table with new tier limits';
    ELSE
        RAISE NOTICE 'usage_limits table does not exist - skipping';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        -- If enum casting fails, try with text
        BEGIN
            UPDATE usage_limits SET analysis_limit = 50 WHERE tier::text = 'pro';
            UPDATE usage_limits SET analysis_limit = 200 WHERE tier::text = 'pro-plus';
            RAISE NOTICE 'Updated usage_limits using text casting: %', SQLERRM;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Could not update usage_limits: %', SQLERRM;
        END;
END $$;

-- ============================================================================
-- STEP 5: Update can_user_analyze function
-- ============================================================================

DROP FUNCTION IF EXISTS can_user_analyze(UUID) CASCADE;

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

  -- Get subscription tier from user_profiles
  SELECT subscription_tier::text INTO v_subscription_tier
  FROM user_profiles
  WHERE id = v_user_id;

  v_subscription_tier := COALESCE(v_subscription_tier, 'free');

  -- Get current usage
  SELECT COALESCE(analysis_count, 0) INTO v_current_count
  FROM usage_tracking
  WHERE user_id = v_user_id AND month_year = v_current_month;

  v_current_count := COALESCE(v_current_count, 0);

  -- NEW PRICING STRUCTURE (December 2024):
  -- FREE/Basic: 3 analyses/month
  -- PRO: 50 analyses/month @ $29/month
  -- PRO PLUS: 200 analyses/month @ $59/month
  -- PREMIUM: 50 analyses/month (grandfathered users)
  CASE v_subscription_tier
    WHEN 'free' THEN v_tier_limit := 3;
    WHEN 'basic' THEN v_tier_limit := 3;
    WHEN 'starter' THEN v_tier_limit := 3;
    WHEN 'pro' THEN v_tier_limit := 50;
    WHEN 'professional' THEN v_tier_limit := 50;
    WHEN 'pro-plus' THEN v_tier_limit := 200;
    WHEN 'premium' THEN v_tier_limit := 50;
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO anon;

COMMENT ON FUNCTION can_user_analyze(UUID) IS 'Check if user can perform analysis. Dec 2024 pricing: FREE=3, PRO=50, PRO-PLUS=200, PREMIUM=50';

-- ============================================================================
-- STEP 6: Update get_user_analysis_stats function
-- ============================================================================

DROP FUNCTION IF EXISTS get_user_analysis_stats(UUID) CASCADE;

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

  SELECT subscription_tier::text INTO tier_val
  FROM user_profiles
  WHERE id = v_user_id;

  tier_val := COALESCE(tier_val, 'free');

  SELECT COALESCE(analysis_count, 0) INTO count_val
  FROM usage_tracking
  WHERE user_id = v_user_id AND month_year = month_val;

  count_val := COALESCE(count_val, 0);

  -- Updated limits (December 2024)
  CASE tier_val
    WHEN 'free' THEN limit_val := 3;
    WHEN 'basic' THEN limit_val := 3;
    WHEN 'starter' THEN limit_val := 3;
    WHEN 'pro' THEN limit_val := 50;
    WHEN 'professional' THEN limit_val := 50;
    WHEN 'pro-plus' THEN limit_val := 200;
    WHEN 'premium' THEN limit_val := 50;
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_analysis_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analysis_stats(UUID) TO anon;

COMMENT ON FUNCTION get_user_analysis_stats(UUID) IS 'Get user analysis statistics. Dec 2024 pricing: FREE=3, PRO=50, PRO-PLUS=200, PREMIUM=50';

-- ============================================================================
-- STEP 7: Verify migration
-- ============================================================================

DO $$
DECLARE
    tier_count INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '================================================';
    RAISE NOTICE '  PRO PLUS TIER MIGRATION COMPLETE';
    RAISE NOTICE '================================================';
    RAISE NOTICE '';
    RAISE NOTICE '  NEW PRICING STRUCTURE:';
    RAISE NOTICE '  - FREE:      $0/mo   → 3 analyses/month';
    RAISE NOTICE '  - PRO:       $29/mo  → 50 analyses/month';
    RAISE NOTICE '  - PRO PLUS:  $59/mo  → 200 analyses/month';
    RAISE NOTICE '  - PREMIUM:   Legacy  → 50 analyses/month';
    RAISE NOTICE '';

    -- Count users by tier
    IF EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'user_profiles'
    ) THEN
        SELECT COUNT(*) INTO tier_count FROM user_profiles;
        RAISE NOTICE '  Total user profiles: %', tier_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '================================================';
END $$;

COMMIT;
