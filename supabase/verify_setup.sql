-- Verification Script for Property Analysis Database Setup
-- Run this in Supabase SQL Editor to verify everything is working

-- 1. Check all tables were created
SELECT 'Tables Created:' as check_type, COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences');

-- 2. Check indexes were created
SELECT 'Indexes Created:' as check_type, COUNT(*) as count
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences');

-- 3. Check RLS is enabled
SELECT 'RLS Enabled Tables:' as check_type, COUNT(*) as count
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences')
AND rowsecurity = true;

-- 4. Check policies were created
SELECT 'Policies Created:' as check_type, COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences');

-- 5. Check functions were created
SELECT 'Functions Created:' as check_type, COUNT(*) as count
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name IN ('can_user_analyze', 'increment_usage', 'get_or_create_usage', 'clean_expired_cache', 'update_updated_at_column');

-- 6. Test the can_user_analyze function (replace with your actual user ID)
-- First, get a user ID from your auth.users table
DO $$
DECLARE
    test_user_id UUID;
BEGIN
    -- Get the first user ID for testing (or use a specific one)
    SELECT id INTO test_user_id FROM auth.users LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        RAISE NOTICE 'Testing with user ID: %', test_user_id;
        
        -- Test can_user_analyze function
        RAISE NOTICE 'Can user analyze result: %', can_user_analyze(test_user_id);
        
        -- Test get_or_create_usage function
        RAISE NOTICE 'Usage record: %', get_or_create_usage(test_user_id, TO_CHAR(NOW(), 'YYYY-MM'));
    ELSE
        RAISE NOTICE 'No users found in auth.users table';
    END IF;
END $$;

-- 7. List all tables with their columns
SELECT 
    table_name,
    STRING_AGG(column_name || ' (' || data_type || ')', ', ' ORDER BY ordinal_position) as columns
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences')
GROUP BY table_name
ORDER BY table_name;

-- 8. Check triggers
SELECT 'Triggers Created:' as check_type, COUNT(*) as count
FROM information_schema.triggers
WHERE trigger_schema = 'public'
AND event_object_table IN ('user_analyses', 'user_usage', 'user_preferences');