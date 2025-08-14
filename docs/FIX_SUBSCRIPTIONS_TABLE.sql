-- Fix Subscriptions Table Schema
-- Run this SQL in your Supabase SQL Editor to fix the missing columns

-- First, check what columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
-- This is safe to run multiple times

-- Add stripe_price_id column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Add metadata column
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add other potentially missing columns
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_start TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS trial_end TIMESTAMP WITH TIME ZONE;

-- Add unique constraints if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_stripe_customer_id_key'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_stripe_customer_id_key UNIQUE (stripe_customer_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'subscriptions_stripe_subscription_id_key'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD CONSTRAINT subscriptions_stripe_subscription_id_key UNIQUE (stripe_subscription_id);
  END IF;
END $$;

-- Verify the final structure
SELECT 
  column_name, 
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'subscriptions'
ORDER BY ordinal_position;