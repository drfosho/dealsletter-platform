-- Part 3: Update Permissions and RLS Policies
-- Sets up proper row level security and permissions

-- Enable RLS on critical tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyzed_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view own usage" ON usage_tracking;
DROP POLICY IF EXISTS "Users can view own properties" ON analyzed_properties;
DROP POLICY IF EXISTS "Users can view own subscriptions" ON subscriptions;

-- User profiles policies
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

-- Usage tracking policies
CREATE POLICY "Users can view own usage" ON usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

-- Analyzed properties policies
CREATE POLICY "Users can view own properties" ON analyzed_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own properties" ON analyzed_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own properties" ON analyzed_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own properties" ON analyzed_properties
  FOR DELETE USING (auth.uid() = user_id);

-- Subscriptions policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Grant function permissions (with explicit signatures)
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO authenticated;
GRANT EXECUTE ON FUNCTION handle_new_user() TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_analysis_stats(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_analysis_usage(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_usage_record(UUID, TEXT) TO authenticated;

-- Revoke unnecessary public permissions
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM public;
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM public;

-- Grant necessary schema permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;