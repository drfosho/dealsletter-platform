-- Migration: Fix subscription tier names and limits (v4)
-- Date: 2025-01-09
-- Description: Update tier names from basic/pro/premium to free/starter/professional/premium
-- This version checks for column existence before updating

BEGIN;

-- Step 1: First, let's check what values currently exist
DO $$ 
BEGIN
    RAISE NOTICE 'Starting subscription tier migration...';
END $$;

-- Step 2: Temporarily remove the constraint to allow updates
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_subscription_tier_check;

-- Step 3: Update existing user records to new tier names
UPDATE user_profiles 
SET subscription_tier = CASE 
    WHEN subscription_tier = 'basic' THEN 'free'
    WHEN subscription_tier = 'pro' THEN 'professional'
    WHEN subscription_tier IS NULL THEN 'free'
    ELSE subscription_tier
END;

-- Step 4: Add new CHECK constraint with correct tier names
ALTER TABLE user_profiles 
ADD CONSTRAINT user_profiles_subscription_tier_check 
CHECK (subscription_tier IN ('free', 'starter', 'professional', 'premium'));

-- Step 5: Update default value from 'basic' to 'free'
ALTER TABLE user_profiles 
ALTER COLUMN subscription_tier SET DEFAULT 'free';

-- Step 6: DROP existing function before recreating
DROP FUNCTION IF EXISTS can_user_analyze(UUID);

-- Now create the new version of can_user_analyze function
CREATE OR REPLACE FUNCTION can_user_analyze(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    tier TEXT;
    current_month_count INTEGER;
    monthly_limit INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO tier
    FROM user_profiles
    WHERE id = user_uuid;
    
    -- If no profile found, assume free tier
    IF tier IS NULL THEN
        tier := 'free';
    END IF;
    
    -- Set monthly limits based on tier
    CASE tier
        WHEN 'free' THEN 
            monthly_limit := 0;  -- Free users cannot analyze
        WHEN 'starter' THEN 
            monthly_limit := 12;  -- Starter: 12 analyses per month
        WHEN 'professional' THEN 
            monthly_limit := 25;  -- Professional: 25 analyses per month
        WHEN 'premium' THEN 
            monthly_limit := 999999;  -- Premium: Unlimited (fair usage)
        ELSE 
            monthly_limit := 0;
    END CASE;
    
    -- Check if free tier (no analyses allowed)
    IF monthly_limit = 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Check if property_analyses table exists
    IF NOT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'property_analyses'
    ) THEN
        -- If table doesn't exist, allow based on tier only
        RETURN monthly_limit > 0;
    END IF;
    
    -- Count analyses in current month
    SELECT COUNT(*) INTO current_month_count
    FROM property_analyses
    WHERE user_id = user_uuid
    AND created_at >= date_trunc('month', CURRENT_DATE)
    AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    
    -- Return whether user is under their limit
    RETURN current_month_count < monthly_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: DROP and recreate the get_user_analysis_stats function
DROP FUNCTION IF EXISTS get_user_analysis_stats(UUID);

CREATE OR REPLACE FUNCTION get_user_analysis_stats(user_uuid UUID)
RETURNS TABLE (
    tier TEXT,
    monthly_limit INTEGER,
    current_month_count INTEGER,
    remaining INTEGER,
    can_analyze BOOLEAN
) AS $$
DECLARE
    user_tier TEXT;
    limit_val INTEGER;
    count_val INTEGER;
BEGIN
    -- Get user's subscription tier
    SELECT subscription_tier INTO user_tier
    FROM user_profiles
    WHERE id = user_uuid;
    
    -- If no profile found, assume free tier
    IF user_tier IS NULL THEN
        user_tier := 'free';
    END IF;
    
    -- Set monthly limits based on tier
    CASE user_tier
        WHEN 'free' THEN 
            limit_val := 0;
        WHEN 'starter' THEN 
            limit_val := 12;
        WHEN 'professional' THEN 
            limit_val := 25;
        WHEN 'premium' THEN 
            limit_val := 999999;  -- Display as unlimited in UI
        ELSE 
            limit_val := 0;
    END CASE;
    
    -- Initialize count
    count_val := 0;
    
    -- Count analyses in current month if table exists
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'property_analyses'
    ) THEN
        SELECT COUNT(*) INTO count_val
        FROM property_analyses
        WHERE user_id = user_uuid
        AND created_at >= date_trunc('month', CURRENT_DATE)
        AND created_at < date_trunc('month', CURRENT_DATE) + INTERVAL '1 month';
    END IF;
    
    RETURN QUERY
    SELECT 
        user_tier,
        limit_val,
        count_val,
        GREATEST(0, limit_val - count_val),
        count_val < limit_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 8: Update subscriptions table if it exists AND has a tier column
DO $$ 
BEGIN
    -- Check if subscriptions table exists and has a tier column
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'subscriptions'
        AND column_name = 'tier'
    ) THEN
        -- First drop the constraint
        ALTER TABLE subscriptions 
        DROP CONSTRAINT IF EXISTS subscriptions_tier_check;
        
        -- Update tier column in subscriptions table
        UPDATE subscriptions 
        SET tier = CASE 
            WHEN tier = 'basic' THEN 'free'
            WHEN tier = 'pro' THEN 'professional'
            WHEN tier IS NULL THEN 'free'
            ELSE tier
        END;
        
        -- Add new constraint
        ALTER TABLE subscriptions 
        ADD CONSTRAINT subscriptions_tier_check 
        CHECK (tier IN ('free', 'starter', 'professional', 'premium'));
        
        RAISE NOTICE 'Updated subscriptions table tier values';
    ELSE
        RAISE NOTICE 'Subscriptions table does not exist or does not have a tier column - skipping';
    END IF;
END $$;

-- Step 9: Update usage_limits table if it exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usage_limits'
    ) THEN
        -- Check if tier column exists
        IF EXISTS (
            SELECT 1
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'usage_limits'
            AND column_name = 'tier'
        ) THEN
            -- Delete old tier entries
            DELETE FROM usage_limits 
            WHERE tier IN ('basic', 'pro');
            
            -- Insert new tier limits if they don't exist
            INSERT INTO usage_limits (tier, analysis_limit, features)
            VALUES 
                ('free', 0, '{"deal_alerts": false, "pdf_export": false, "priority_support": false}'::jsonb),
                ('starter', 12, '{"deal_alerts": true, "pdf_export": true, "priority_support": true}'::jsonb),
                ('professional', 25, '{"deal_alerts": true, "pdf_export": true, "priority_support": true, "advanced_analytics": true}'::jsonb),
                ('premium', 999999, '{"deal_alerts": true, "pdf_export": true, "priority_support": true, "advanced_analytics": true, "early_access": true, "api_access": true}'::jsonb)
            ON CONFLICT (tier) DO UPDATE 
            SET 
                analysis_limit = EXCLUDED.analysis_limit,
                features = EXCLUDED.features;
            
            RAISE NOTICE 'Updated usage_limits table';
        END IF;
    ELSE
        RAISE NOTICE 'Usage_limits table does not exist - skipping';
    END IF;
END $$;

-- Step 10: Create index for performance if property_analyses exists
DO $$ 
BEGIN
    IF EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'property_analyses'
    ) THEN
        CREATE INDEX IF NOT EXISTS idx_property_analyses_user_month 
        ON property_analyses(user_id, created_at)
        WHERE created_at >= date_trunc('month', CURRENT_DATE);
        
        RAISE NOTICE 'Created/verified index on property_analyses table';
    ELSE
        RAISE NOTICE 'Property_analyses table does not exist - skipping index creation';
    END IF;
END $$;

-- Step 11: Add comment to document the tier structure
COMMENT ON COLUMN user_profiles.subscription_tier IS 'User subscription tier: free (0 analyses), starter (12/month), professional (25/month), premium (unlimited with fair usage)';

-- Step 12: Verify the migration
DO $$ 
DECLARE
    profile_count INTEGER;
    free_count INTEGER;
    starter_count INTEGER;
    professional_count INTEGER;
    premium_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO profile_count FROM user_profiles;
    SELECT COUNT(*) INTO free_count FROM user_profiles WHERE subscription_tier = 'free';
    SELECT COUNT(*) INTO starter_count FROM user_profiles WHERE subscription_tier = 'starter';
    SELECT COUNT(*) INTO professional_count FROM user_profiles WHERE subscription_tier = 'professional';
    SELECT COUNT(*) INTO premium_count FROM user_profiles WHERE subscription_tier = 'premium';
    
    RAISE NOTICE '';
    RAISE NOTICE '================================';
    RAISE NOTICE 'Migration Summary:';
    RAISE NOTICE '================================';
    RAISE NOTICE '  Total profiles: %', profile_count;
    RAISE NOTICE '  Free tier: %', free_count;
    RAISE NOTICE '  Starter tier: %', starter_count;
    RAISE NOTICE '  Professional tier: %', professional_count;
    RAISE NOTICE '  Premium tier: %', premium_count;
    RAISE NOTICE '================================';
END $$;

COMMIT;

-- Success message
DO $$ 
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '✅ Migration completed successfully!';
    RAISE NOTICE '  - Tier names updated: basic→free, pro→professional';
    RAISE NOTICE '  - Analysis limits set: free(0), starter(12), professional(25), premium(unlimited)';
    RAISE NOTICE '  - Functions updated with correct limits';
    RAISE NOTICE '  - Constraints updated for all tables';
END $$;