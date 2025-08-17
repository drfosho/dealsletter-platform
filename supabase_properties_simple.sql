-- Simple properties table migration without profiles dependency
-- Use this if you just want to get the properties table working quickly

-- 1. Create properties table for storing dashboard properties
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT,
  price DECIMAL,
  monthly_rent DECIMAL,
  location TEXT,
  address TEXT,
  bedrooms INTEGER,
  bathrooms DECIMAL,
  square_feet INTEGER,
  lot_size DECIMAL,
  year_built INTEGER,
  property_type TEXT,
  status TEXT,
  is_draft BOOLEAN DEFAULT false,
  images JSONB,
  description TEXT,
  features JSONB,
  coordinates JSONB,
  url TEXT,
  source TEXT,
  listing_date TIMESTAMP,
  cap_rate DECIMAL,
  cash_flow DECIMAL,
  roi DECIMAL,
  total_return DECIMAL,
  financing_scenarios JSONB,
  thirty_year_projections JSONB,
  location_analysis JSONB,
  strategic_overview JSONB,
  property_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  is_deleted BOOLEAN DEFAULT false
);

-- 2. Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_is_draft ON public.properties(is_draft);
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON public.properties(is_deleted);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- 3. Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- 4. Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view published properties" ON public.properties;
DROP POLICY IF EXISTS "Authenticated users can manage properties" ON public.properties;

-- 5. Create simplified policies
-- Allow public to view non-draft, non-deleted properties
CREATE POLICY "Public can view published properties" ON public.properties
  FOR SELECT
  USING (is_draft = false AND is_deleted = false);

-- Allow authenticated users to manage all properties (simplified for admin panel)
-- In production, you'd want more restrictive policies
CREATE POLICY "Authenticated users can manage properties" ON public.properties
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- 6. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.properties TO anon, authenticated;

-- 9. Optional: Insert sample properties for testing
INSERT INTO public.properties (
  id, title, type, price, monthly_rent, location, address, 
  bedrooms, bathrooms, square_feet, status, is_draft, is_deleted
) VALUES 
(
  'test-property-1',
  'Test Property - Can be deleted',
  'Single Family',
  350000,
  2800,
  'Test City, TX',
  '789 Test St, Test City, TX 78701',
  3,
  2,
  1500,
  'active',
  false,
  false
) ON CONFLICT (id) DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Properties table created successfully!';
  RAISE NOTICE '✅ Column is_deleted added for soft deletes';
  RAISE NOTICE '✅ RLS policies applied';
  RAISE NOTICE '✅ You can now delete properties from the admin panel';
  RAISE NOTICE '';
END $$;