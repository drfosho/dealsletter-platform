-- Complete migration for properties system
-- This creates all necessary tables and handles dependencies

-- 1. Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for users to update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- 2. Create properties table for storing dashboard properties
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

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Public can view published properties" ON public.properties;
DROP POLICY IF EXISTS "Users can manage their own properties" ON public.properties;
DROP POLICY IF EXISTS "Admin can manage all properties" ON public.properties;

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

-- 3. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at for profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create trigger to automatically update updated_at for properties
DROP TRIGGER IF EXISTS update_properties_updated_at ON public.properties;
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Create function to handle new user creation (auto-create profile)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. Optional: Insert sample properties (remove if not needed)
INSERT INTO public.properties (
  id, title, type, price, monthly_rent, location, address, 
  bedrooms, bathrooms, square_feet, status, is_draft, is_deleted
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
  false,
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
  false,
  false
) ON CONFLICT (id) DO NOTHING;

-- 6. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.properties TO anon, authenticated;
GRANT ALL ON public.profiles TO anon, authenticated;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Tables created: profiles, properties';
  RAISE NOTICE 'RLS policies applied';
  RAISE NOTICE 'Triggers and functions created';
END $$;