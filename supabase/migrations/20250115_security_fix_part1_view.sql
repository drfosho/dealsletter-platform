-- Part 1: Fix user_property_stats View Security
-- This fixes the critical issue of exposing auth.users data

-- Drop the insecure view
DROP VIEW IF EXISTS user_property_stats CASCADE;

-- Create secure view that uses auth.uid() instead of exposing auth.users
CREATE OR REPLACE VIEW user_property_stats AS
SELECT
  auth.uid() as user_id,
  COUNT(DISTINCT fp.property_id) as saved_properties_count,
  COUNT(DISTINCT CASE
    WHEN pv.viewed_at >= date_trunc('month', CURRENT_DATE)
    THEN pv.property_id
  END) as properties_viewed_this_month,
  COUNT(DISTINCT sf.id) FILTER (WHERE sf.notifications = true AND sf.is_draft = false) as active_filters_count
FROM
  favorite_properties fp
  LEFT JOIN property_views pv ON fp.user_id = pv.user_id
  LEFT JOIN saved_filters sf ON fp.user_id = sf.user_id
WHERE
  fp.user_id = auth.uid()
  AND pv.user_id = auth.uid()
  AND sf.user_id = auth.uid()
GROUP BY auth.uid();

-- Enable security invoker for the view
ALTER VIEW user_property_stats SET (security_invoker = true);

-- Grant select to authenticated users
GRANT SELECT ON user_property_stats TO authenticated;