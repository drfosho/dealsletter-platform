-- Property Analysis Feature Database Setup
-- This migration creates all necessary tables, indexes, RLS policies, and functions
-- for the property analysis feature including usage tracking and caching

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS property_cache CASCADE;
DROP TABLE IF EXISTS user_usage CASCADE;
DROP TABLE IF EXISTS user_analyses CASCADE;

-- User property analyses table
CREATE TABLE user_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  address TEXT NOT NULL,
  strategy TEXT NOT NULL CHECK (strategy IN ('flip', 'rental', 'brrrr', 'commercial')),
  purchase_price NUMERIC(12, 2),
  down_payment_percent NUMERIC(5, 2),
  loan_term INTEGER,
  interest_rate NUMERIC(5, 3),
  rehab_costs NUMERIC(12, 2),
  property_data JSONB, -- RentCast property details
  market_data JSONB, -- RentCast market data
  rental_estimate JSONB, -- RentCast rental estimates
  comparables JSONB, -- RentCast comparables
  ai_analysis JSONB NOT NULL, -- Full Claude analysis response
  is_favorite BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Monthly usage tracking table
CREATE TABLE user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  month TEXT NOT NULL, -- 'YYYY-MM' format
  analyses_count INTEGER DEFAULT 0 CHECK (analyses_count >= 0),
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'premium')),
  tier_limit INTEGER DEFAULT 3, -- Free: 3, Pro: 25, Premium: 999
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_user_month UNIQUE(user_id, month)
);

-- Property data cache table (to minimize RentCast API calls)
CREATE TABLE property_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT UNIQUE NOT NULL,
  property_data JSONB,
  rental_estimate JSONB,
  market_data JSONB,
  comparables JSONB,
  cache_hit_count INTEGER DEFAULT 0,
  last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days')
);

-- User preferences and settings table
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  default_strategy TEXT DEFAULT 'rental' CHECK (default_strategy IN ('flip', 'rental', 'brrrr', 'commercial')),
  default_down_payment NUMERIC(5, 2) DEFAULT 20.00,
  default_loan_term INTEGER DEFAULT 30,
  default_interest_rate NUMERIC(5, 3) DEFAULT 7.000,
  saved_financing_scenarios JSONB DEFAULT '[]'::jsonb,
  notification_settings JSONB DEFAULT '{"email_analysis_complete": true, "email_monthly_summary": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_user_analyses_user_id ON user_analyses(user_id);
CREATE INDEX idx_user_analyses_created_at ON user_analyses(created_at DESC);
CREATE INDEX idx_user_analyses_address ON user_analyses(address);
CREATE INDEX idx_user_analyses_status ON user_analyses(status);
CREATE INDEX idx_user_analyses_favorite ON user_analyses(user_id, is_favorite) WHERE is_favorite = TRUE;

CREATE INDEX idx_user_usage_user_month ON user_usage(user_id, month);
CREATE INDEX idx_user_usage_month ON user_usage(month);

CREATE INDEX idx_property_cache_address ON property_cache(address);
CREATE INDEX idx_property_cache_expires ON property_cache(expires_at);

-- Enable Row Level Security (RLS)
ALTER TABLE user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_analyses
CREATE POLICY "Users can view own analyses" ON user_analyses
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON user_analyses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON user_analyses
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON user_analyses
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_usage
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own usage records" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for property_cache (public read, authenticated write)
CREATE POLICY "Anyone can read property cache" ON property_cache
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert to cache" ON property_cache
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update cache" ON property_cache
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- RLS Policies for user_preferences
CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_user_analyses_updated_at BEFORE UPDATE ON user_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_usage_updated_at BEFORE UPDATE ON user_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to get or create monthly usage record
CREATE OR REPLACE FUNCTION get_or_create_usage(p_user_id UUID, p_month TEXT)
RETURNS user_usage AS $$
DECLARE
  v_usage user_usage;
  v_subscription_tier TEXT;
  v_tier_limit INTEGER;
BEGIN
  -- For now, default to free tier. In production, this would check actual subscription
  v_subscription_tier := 'free';
  v_tier_limit := CASE 
    WHEN v_subscription_tier = 'free' THEN 3
    WHEN v_subscription_tier = 'pro' THEN 25
    WHEN v_subscription_tier = 'premium' THEN 999
    ELSE 3
  END;

  -- Try to get existing record
  SELECT * INTO v_usage FROM user_usage 
  WHERE user_id = p_user_id AND month = p_month;
  
  -- Create if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO user_usage (user_id, month, subscription_tier, tier_limit)
    VALUES (p_user_id, p_month, v_subscription_tier, v_tier_limit)
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform analysis
CREATE OR REPLACE FUNCTION can_user_analyze(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_month TEXT;
  v_usage user_usage;
  v_can_analyze BOOLEAN;
  v_remaining INTEGER;
BEGIN
  v_month := TO_CHAR(NOW(), 'YYYY-MM');
  v_usage := get_or_create_usage(p_user_id, v_month);
  
  v_can_analyze := v_usage.analyses_count < v_usage.tier_limit OR v_usage.subscription_tier = 'premium';
  v_remaining := GREATEST(0, v_usage.tier_limit - v_usage.analyses_count);
  
  RETURN jsonb_build_object(
    'can_analyze', v_can_analyze,
    'analyses_used', v_usage.analyses_count,
    'tier_limit', v_usage.tier_limit,
    'remaining', v_remaining,
    'subscription_tier', v_usage.subscription_tier,
    'message', CASE 
      WHEN v_can_analyze THEN 'Analysis available'
      ELSE 'Monthly limit reached. Upgrade to Pro for more analyses.'
    END
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage count
CREATE OR REPLACE FUNCTION increment_usage(p_user_id UUID)
RETURNS user_usage AS $$
DECLARE
  v_month TEXT;
  v_usage user_usage;
BEGIN
  v_month := TO_CHAR(NOW(), 'YYYY-MM');
  
  UPDATE user_usage 
  SET analyses_count = analyses_count + 1,
      last_analysis_at = NOW()
  WHERE user_id = p_user_id AND month = v_month
  RETURNING * INTO v_usage;
  
  IF NOT FOUND THEN
    v_usage := get_or_create_usage(p_user_id, v_month);
    UPDATE user_usage 
    SET analyses_count = 1,
        last_analysis_at = NOW()
    WHERE user_id = p_user_id AND month = v_month
    RETURNING * INTO v_usage;
  END IF;
  
  RETURN v_usage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean expired cache entries
CREATE OR REPLACE FUNCTION clean_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  v_deleted INTEGER;
BEGIN
  DELETE FROM property_cache 
  WHERE expires_at < NOW()
  RETURNING COUNT(*) INTO v_deleted;
  
  RETURN v_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_or_create_usage TO authenticated;
GRANT EXECUTE ON FUNCTION can_user_analyze TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage TO authenticated;
GRANT EXECUTE ON FUNCTION clean_expired_cache TO authenticated;

-- Insert sample data for testing (optional - comment out in production)
-- This creates a test analysis for the first authenticated user
DO $$
BEGIN
  -- Only run if tables are empty
  IF NOT EXISTS (SELECT 1 FROM user_analyses LIMIT 1) THEN
    -- Sample data would go here if needed
    NULL;
  END IF;
END $$;

-- Comments for documentation
COMMENT ON TABLE user_analyses IS 'Stores all property analyses performed by users';
COMMENT ON TABLE user_usage IS 'Tracks monthly usage and subscription limits';
COMMENT ON TABLE property_cache IS 'Caches property data from RentCast API to reduce API calls';
COMMENT ON TABLE user_preferences IS 'Stores user preferences and default settings';

COMMENT ON FUNCTION can_user_analyze IS 'Checks if user has available analyses for the current month';
COMMENT ON FUNCTION increment_usage IS 'Increments usage count when user performs an analysis';
COMMENT ON FUNCTION clean_expired_cache IS 'Removes expired entries from property cache';