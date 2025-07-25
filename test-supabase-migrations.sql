-- Test queries to verify migrations were successful
-- Run these in your Supabase SQL editor to confirm everything is set up

-- 1. Check if subscription_tier column exists in user_profiles
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_profiles' 
AND column_name = 'subscription_tier';

-- 2. Check if usage_tracking table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'usage_tracking'
);

-- 3. Check if analyzed_properties table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'analyzed_properties'
);

-- 4. Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('can_user_analyze', 'increment_analysis_usage', 'get_or_create_usage_record');

-- 5. Check RLS policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('usage_tracking', 'analyzed_properties');

-- 6. Test the can_user_analyze function (replace with a real user ID)
-- SELECT * FROM can_user_analyze('YOUR-USER-ID-HERE');