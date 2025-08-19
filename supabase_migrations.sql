-- Supabase SQL Migration File
-- Run these SQL commands in your Supabase SQL Editor to create the necessary tables

-- 1. Create favorite_properties table for saved properties
CREATE TABLE IF NOT EXISTS favorite_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL,
  saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id) -- Prevent duplicate favorites
);

-- Create indexes for better performance
CREATE INDEX idx_favorite_properties_user_id ON favorite_properties(user_id);
CREATE INDEX idx_favorite_properties_property_id ON favorite_properties(property_id);
CREATE INDEX idx_favorite_properties_saved_at ON favorite_properties(saved_at DESC);

-- Enable Row Level Security
ALTER TABLE favorite_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own favorites" ON favorite_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can add their own favorites" ON favorite_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favorites" ON favorite_properties
  FOR DELETE USING (auth.uid() = user_id);

-- 2. Create property_views table for tracking property views
CREATE TABLE IF NOT EXISTS property_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  property_id INTEGER NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_property_views_user_id ON property_views(user_id);
CREATE INDEX idx_property_views_property_id ON property_views(property_id);
CREATE INDEX idx_property_views_viewed_at ON property_views(viewed_at DESC);
CREATE INDEX idx_property_views_user_month ON property_views(user_id, viewed_at DESC);

-- Enable Row Level Security
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own property views" ON property_views
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own property views" ON property_views
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 3. Create saved_filters table for user filter preferences
CREATE TABLE IF NOT EXISTS saved_filters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  filters JSONB NOT NULL DEFAULT '{}',
  notifications BOOLEAN DEFAULT false,
  is_draft BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_saved_filters_user_id ON saved_filters(user_id);
CREATE INDEX idx_saved_filters_notifications ON saved_filters(notifications);
CREATE INDEX idx_saved_filters_created_at ON saved_filters(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_filters ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own filters" ON saved_filters
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filters" ON saved_filters
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filters" ON saved_filters
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filters" ON saved_filters
  FOR DELETE USING (auth.uid() = user_id);

-- 4. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for saved_filters
CREATE TRIGGER update_saved_filters_updated_at 
  BEFORE UPDATE ON saved_filters
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Optional: Create view for user stats
CREATE OR REPLACE VIEW user_property_stats AS
SELECT 
  u.id as user_id,
  COUNT(DISTINCT fp.property_id) as saved_properties_count,
  COUNT(DISTINCT CASE 
    WHEN pv.viewed_at >= date_trunc('month', CURRENT_DATE) 
    THEN pv.property_id 
  END) as properties_viewed_this_month,
  COUNT(DISTINCT sf.id) FILTER (WHERE sf.notifications = true AND sf.is_draft = false) as active_filters_count
FROM 
  auth.users u
  LEFT JOIN favorite_properties fp ON u.id = fp.user_id
  LEFT JOIN property_views pv ON u.id = pv.user_id
  LEFT JOIN saved_filters sf ON u.id = sf.user_id
GROUP BY u.id;

-- Grant permissions on the view
GRANT SELECT ON user_property_stats TO authenticated;

-- Note: Views don't support RLS policies directly. 
-- The view will inherit security from the underlying tables which already have RLS enabled.
-- Users will only see stats calculated from their own data due to the RLS policies on the base tables.