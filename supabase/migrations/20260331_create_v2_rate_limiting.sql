-- V2 rate limiting table
-- Completely isolated from main site
-- Only V2 routes write to this table
CREATE TABLE IF NOT EXISTS v2_analysis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ip_address TEXT,
  tier TEXT NOT NULL DEFAULT 'free',
  model_type TEXT NOT NULL DEFAULT 'single',
  strategy TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast rate limit queries
CREATE INDEX IF NOT EXISTS v2_analysis_requests_user_created
  ON v2_analysis_requests(user_id, created_at);

CREATE INDEX IF NOT EXISTS v2_analysis_requests_ip_created
  ON v2_analysis_requests(ip_address, created_at);

-- RLS: users can only see their own rows
ALTER TABLE v2_analysis_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own requests"
  ON v2_analysis_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can insert/read all
CREATE POLICY "Service role full access"
  ON v2_analysis_requests
  FOR ALL USING (true)
  WITH CHECK (true);
