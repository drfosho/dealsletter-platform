-- Fix 1: Add missing columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN IF NOT EXISTS cancel_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN DEFAULT false;

-- Fix 2: Create cancellation_feedback table
CREATE TABLE IF NOT EXISTS cancellation_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  reason TEXT,
  plan_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_user ON cancellation_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_cancellation_feedback_reason ON cancellation_feedback(reason);

ALTER TABLE cancellation_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own feedback" ON cancellation_feedback;
CREATE POLICY "Users can insert own feedback"
  ON cancellation_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can read all feedback" ON cancellation_feedback;
CREATE POLICY "Service role can read all feedback"
  ON cancellation_feedback FOR SELECT
  USING (true);
