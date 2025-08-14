-- Ensure metadata column exists in subscriptions table
-- This migration is idempotent and safe to run multiple times

DO $$ 
BEGIN
  -- Check if metadata column exists, if not add it
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'subscriptions' 
    AND column_name = 'metadata'
  ) THEN
    ALTER TABLE public.subscriptions 
    ADD COLUMN metadata JSONB DEFAULT '{}';
    
    RAISE NOTICE 'Added metadata column to subscriptions table';
  ELSE
    RAISE NOTICE 'metadata column already exists in subscriptions table';
  END IF;
END $$;