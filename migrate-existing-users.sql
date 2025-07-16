-- Migrate existing users from raw_user_meta_data to user_profiles table
INSERT INTO public.user_profiles (
  id,
  first_name,
  last_name,
  full_name,
  investor_experience,
  deal_types,
  investment_goals,
  budget,
  location
)
SELECT 
  id,
  raw_user_meta_data->>'first_name',
  raw_user_meta_data->>'last_name',
  raw_user_meta_data->>'full_name',
  raw_user_meta_data->>'investor_experience',
  CASE 
    WHEN raw_user_meta_data->>'deal_types' IS NOT NULL 
    THEN string_to_array(raw_user_meta_data->>'deal_types', ',')
    ELSE NULL
  END,
  raw_user_meta_data->>'investment_goals',
  raw_user_meta_data->>'budget',
  raw_user_meta_data->>'location'
FROM auth.users 
WHERE id NOT IN (SELECT id FROM public.user_profiles)
  AND raw_user_meta_data IS NOT NULL;

-- Check the results
SELECT COUNT(*) as migrated_users FROM user_profiles;