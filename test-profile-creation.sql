-- Test to verify the trigger is working correctly
-- This query checks if the trigger function exists and is properly configured

-- Check if the trigger function exists
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' AND routine_schema = 'public';

-- Check if the trigger exists
SELECT trigger_name, event_manipulation, event_object_table, action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check current user_profiles
SELECT COUNT(*) as profile_count FROM user_profiles;

-- Check recent auth users and their metadata
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'first_name' as first_name,
  raw_user_meta_data->>'investor_experience' as investor_experience
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;