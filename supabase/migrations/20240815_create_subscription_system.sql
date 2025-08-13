-- Subscription System Database Schema
-- This migration creates all necessary tables for Stripe subscription management

-- Create enum for subscription status
CREATE TYPE subscription_status AS ENUM (
  'active',
  'canceled',
  'past_due',
  'trialing',
  'incomplete',
  'incomplete_expired',
  'unpaid',
  'paused'
);

-- Create enum for subscription tier
CREATE TYPE subscription_tier AS ENUM (
  'free',
  'starter',
  'pro',
  'premium'
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  stripe_price_id TEXT,
  status subscription_status DEFAULT 'incomplete',
  tier subscription_tier DEFAULT 'free',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  cancel_at TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create subscription_items table for tracking individual subscription items
CREATE TABLE IF NOT EXISTS public.subscription_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  stripe_item_id TEXT UNIQUE,
  stripe_price_id TEXT NOT NULL,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create usage_limits table
CREATE TABLE IF NOT EXISTS public.usage_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier subscription_tier PRIMARY KEY,
  analysis_limit INTEGER NOT NULL,
  features JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default usage limits
INSERT INTO public.usage_limits (tier, analysis_limit, features) VALUES
  ('free', 3, '{"deal_alerts": true, "basic_analysis": true, "pdf_export": false, "priority_support": false}'),
  ('starter', 12, '{"deal_alerts": true, "basic_analysis": true, "pdf_export": true, "priority_support": false, "email_support": true}'),
  ('pro', 35, '{"deal_alerts": true, "advanced_analysis": true, "pdf_export": true, "priority_support": true, "email_support": true, "early_access": true}'),
  ('premium', 999, '{"deal_alerts": true, "advanced_analysis": true, "pdf_export": true, "priority_support": true, "phone_support": true, "api_access": true, "team_collaboration": true}')
ON CONFLICT (tier) DO NOTHING;

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  last_analysis_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, period_start)
);

-- Create billing_history table
CREATE TABLE IF NOT EXISTS public.billing_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.subscriptions(id) ON DELETE SET NULL,
  stripe_invoice_id TEXT UNIQUE,
  stripe_payment_intent_id TEXT,
  amount_paid INTEGER, -- in cents
  currency TEXT DEFAULT 'usd',
  status TEXT,
  invoice_pdf TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create webhook_events table for idempotency
CREATE TABLE IF NOT EXISTS public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  processed BOOLEAN DEFAULT false,
  error TEXT,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_usage_tracking_user_id ON public.usage_tracking(user_id);
CREATE INDEX idx_usage_tracking_period ON public.usage_tracking(period_start, period_end);
CREATE INDEX idx_billing_history_user_id ON public.billing_history(user_id);
CREATE INDEX idx_webhook_events_stripe_event_id ON public.webhook_events(stripe_event_id);

-- Enable Row Level Security
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for usage_limits (public read)
CREATE POLICY "Anyone can view usage limits" ON public.usage_limits
  FOR SELECT USING (true);

-- RLS Policies for usage_tracking
CREATE POLICY "Users can view own usage" ON public.usage_tracking
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage usage" ON public.usage_tracking
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for billing_history
CREATE POLICY "Users can view own billing history" ON public.billing_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage billing" ON public.billing_history
  FOR ALL USING (auth.role() = 'service_role');

-- RLS Policies for webhook_events (service role only)
CREATE POLICY "Service role can manage webhooks" ON public.webhook_events
  FOR ALL USING (auth.role() = 'service_role');

-- Function to get user's current subscription
CREATE OR REPLACE FUNCTION get_user_subscription(user_uuid UUID)
RETURNS TABLE (
  subscription_id UUID,
  tier subscription_tier,
  status subscription_status,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN,
  analysis_limit INTEGER,
  analysis_used INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.tier,
    s.status,
    s.current_period_end,
    s.cancel_at_period_end,
    ul.analysis_limit,
    COALESCE(ut.analysis_count, 0) as analysis_used
  FROM subscriptions s
  LEFT JOIN usage_limits ul ON ul.tier = s.tier
  LEFT JOIN usage_tracking ut ON ut.user_id = s.user_id 
    AND ut.period_start <= NOW() 
    AND ut.period_end > NOW()
  WHERE s.user_id = user_uuid
  AND s.status IN ('active', 'trialing')
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if user can perform analysis
CREATE OR REPLACE FUNCTION check_analysis_limit(user_uuid UUID)
RETURNS TABLE (
  can_analyze BOOLEAN,
  current_usage INTEGER,
  usage_limit INTEGER,
  tier subscription_tier
) AS $$
DECLARE
  v_subscription RECORD;
  v_usage INTEGER;
BEGIN
  -- Get user's subscription
  SELECT * INTO v_subscription
  FROM get_user_subscription(user_uuid);
  
  -- If no subscription, use free tier
  IF v_subscription IS NULL THEN
    v_subscription.tier := 'free';
    v_subscription.analysis_limit := 3;
    v_subscription.analysis_used := 0;
  END IF;
  
  -- Get current usage
  SELECT COALESCE(analysis_count, 0) INTO v_usage
  FROM usage_tracking
  WHERE user_id = user_uuid
    AND period_start <= NOW()
    AND period_end > NOW();
  
  IF v_usage IS NULL THEN
    v_usage := 0;
  END IF;
  
  RETURN QUERY SELECT 
    v_usage < v_subscription.analysis_limit,
    v_usage,
    v_subscription.analysis_limit,
    v_subscription.tier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment usage
CREATE OR REPLACE FUNCTION increment_usage(user_uuid UUID)
RETURNS void AS $$
DECLARE
  v_period_start TIMESTAMP WITH TIME ZONE;
  v_period_end TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current billing period (monthly)
  v_period_start := date_trunc('month', NOW());
  v_period_end := date_trunc('month', NOW()) + INTERVAL '1 month';
  
  -- Insert or update usage tracking
  INSERT INTO usage_tracking (
    user_id,
    period_start,
    period_end,
    analysis_count,
    last_analysis_at
  ) VALUES (
    user_uuid,
    v_period_start,
    v_period_end,
    1,
    NOW()
  )
  ON CONFLICT (user_id, period_start)
  DO UPDATE SET
    analysis_count = usage_tracking.analysis_count + 1,
    last_analysis_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscription_items_updated_at BEFORE UPDATE ON public.subscription_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_limits_updated_at BEFORE UPDATE ON public.usage_limits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_tracking_updated_at BEFORE UPDATE ON public.usage_tracking
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT ALL ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscription_items TO authenticated;
GRANT ALL ON public.usage_limits TO authenticated;
GRANT ALL ON public.usage_tracking TO authenticated;
GRANT ALL ON public.billing_history TO authenticated;
GRANT ALL ON public.webhook_events TO service_role;

GRANT EXECUTE ON FUNCTION get_user_subscription TO authenticated;
GRANT EXECUTE ON FUNCTION check_analysis_limit TO authenticated;
GRANT EXECUTE ON FUNCTION increment_usage TO authenticated;