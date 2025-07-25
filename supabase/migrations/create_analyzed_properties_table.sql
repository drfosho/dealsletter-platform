-- Create analyzed_properties table for storing user's property analyses
CREATE TABLE IF NOT EXISTS analyzed_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  address TEXT NOT NULL,
  analysis_date DATE NOT NULL DEFAULT CURRENT_DATE,
  roi DECIMAL(5,2) NOT NULL,
  profit INTEGER NOT NULL,
  deal_type TEXT NOT NULL CHECK (deal_type IN ('Fix & Flip', 'BRRRR', 'Buy & Hold', 'House Hack', 'Short-term Rental', 'Value-Add')),
  is_favorite BOOLEAN DEFAULT FALSE,
  analysis_data JSONB, -- Store full analysis results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_analyzed_properties_user_id ON analyzed_properties(user_id);
CREATE INDEX IF NOT EXISTS idx_analyzed_properties_analysis_date ON analyzed_properties(analysis_date DESC);
CREATE INDEX IF NOT EXISTS idx_analyzed_properties_is_favorite ON analyzed_properties(user_id, is_favorite) WHERE is_favorite = true;

-- Enable Row Level Security
ALTER TABLE analyzed_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own analyzed properties" ON analyzed_properties
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyzed properties" ON analyzed_properties
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own analyzed properties" ON analyzed_properties
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyzed properties" ON analyzed_properties
  FOR DELETE USING (auth.uid() = user_id);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_analyzed_properties_updated_at BEFORE UPDATE ON analyzed_properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();