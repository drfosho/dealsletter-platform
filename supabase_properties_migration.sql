-- Create properties table for storing dashboard properties
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_properties_is_draft ON public.properties(is_draft);
CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON public.properties(is_deleted);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);

-- Enable Row Level Security
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access (non-draft, non-deleted properties)
CREATE POLICY "Public can view published properties" ON public.properties
  FOR SELECT
  USING (is_draft = false AND is_deleted = false);

-- Create policy for authenticated users to manage their own properties
CREATE POLICY "Users can manage their own properties" ON public.properties
  FOR ALL
  USING (auth.uid() = created_by);

-- Create policy for admin users to manage all properties
CREATE POLICY "Admin can manage all properties" ON public.properties
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert a few sample properties (optional - you can remove this if you don't want sample data)
INSERT INTO public.properties (
  id, title, type, price, monthly_rent, location, address, 
  bedrooms, bathrooms, square_feet, status, is_draft
) VALUES 
(
  'sample-1',
  'Sample Property 1',
  'Single Family',
  450000,
  3200,
  'Austin, TX',
  '123 Main St, Austin, TX 78701',
  3,
  2,
  1800,
  'active',
  false
),
(
  'sample-2',
  'Sample Property 2',
  'Multi-Family',
  850000,
  6500,
  'Dallas, TX',
  '456 Oak Ave, Dallas, TX 75201',
  8,
  4,
  4200,
  'active',
  false
) ON CONFLICT (id) DO NOTHING;