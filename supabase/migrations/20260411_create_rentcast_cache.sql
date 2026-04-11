-- RentCast API response cache
-- Persists property data for 30 days to reduce RentCast API spend
-- and survive serverless cold starts where in-memory cache doesn't help.

CREATE TABLE IF NOT EXISTS rentcast_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cache_key TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rentcast_cache_key
  ON rentcast_cache(cache_key);

CREATE INDEX IF NOT EXISTS idx_rentcast_cache_expires
  ON rentcast_cache(expires_at);

-- Helper to sweep expired entries (call from a cron or pg_cron job)
CREATE OR REPLACE FUNCTION delete_expired_rentcast_cache()
RETURNS void AS $$
BEGIN
  DELETE FROM rentcast_cache
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;
