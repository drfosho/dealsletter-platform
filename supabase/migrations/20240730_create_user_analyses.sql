-- Create user analyses table
CREATE TABLE IF NOT EXISTS public.user_analyses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    property_data JSONB NOT NULL,
    analysis_data JSONB NOT NULL,
    strategy TEXT NOT NULL CHECK (strategy IN ('rental', 'flip', 'brrrr', 'airbnb')),
    purchase_price DECIMAL(12, 2),
    down_payment DECIMAL(12, 2),
    loan_terms JSONB,
    rehab_costs DECIMAL(12, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create usage tracking table
CREATE TABLE IF NOT EXISTS public.user_usage (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    month_year TEXT NOT NULL, -- Format: YYYY-MM
    analyses_count INTEGER DEFAULT 0,
    last_analysis_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    UNIQUE(user_id, month_year)
);

-- Create subscription tiers table
CREATE TABLE IF NOT EXISTS public.subscription_tiers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    monthly_analysis_limit INTEGER NOT NULL,
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default subscription tiers
INSERT INTO public.subscription_tiers (name, monthly_analysis_limit, features) VALUES
    ('free', 5, '{"basic_analysis": true, "export_pdf": false, "api_access": false}'),
    ('pro', 50, '{"basic_analysis": true, "export_pdf": true, "api_access": false}'),
    ('enterprise', -1, '{"basic_analysis": true, "export_pdf": true, "api_access": true}'); -- -1 means unlimited

-- Add subscription tier to user profiles if not exists
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free' REFERENCES public.subscription_tiers(name);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analyses_user_id ON public.user_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_analyses_created_at ON public.user_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_month ON public.user_usage(user_id, month_year);

-- Create RLS policies
ALTER TABLE public.user_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can only see their own analyses
CREATE POLICY "Users can view own analyses" ON public.user_analyses
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own analyses" ON public.user_analyses
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analyses" ON public.user_analyses
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses" ON public.user_analyses
    FOR DELETE USING (auth.uid() = user_id);

-- Users can only see their own usage
CREATE POLICY "Users can view own usage" ON public.user_usage
    FOR ALL USING (auth.uid() = user_id);

-- Create function to update usage
CREATE OR REPLACE FUNCTION update_user_usage()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_usage (user_id, month_year, analyses_count, last_analysis_at)
    VALUES (
        NEW.user_id,
        TO_CHAR(NEW.created_at, 'YYYY-MM'),
        1,
        NEW.created_at
    )
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET
        analyses_count = user_usage.analyses_count + 1,
        last_analysis_at = NEW.created_at,
        updated_at = TIMEZONE('utc', NOW());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update usage on new analysis
CREATE TRIGGER update_usage_on_analysis
    AFTER INSERT ON public.user_analyses
    FOR EACH ROW
    EXECUTE FUNCTION update_user_usage();