# Supabase Database Setup for Property Analysis Feature

This guide provides instructions for setting up the Supabase database tables, functions, and policies required for the property analysis feature.

## Prerequisites

- Access to your Supabase project dashboard
- Database permissions to create tables and functions

## Setup Instructions

### 1. Run the Migration

1. Open your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy the entire contents of `/supabase/migrations/20240730_property_analysis_setup.sql`
5. Paste into the SQL Editor
6. Click **Run** to execute the migration

### 2. Verify Table Creation

After running the migration, verify that the following tables were created:

- `user_analyses` - Stores property analysis results
- `user_usage` - Tracks monthly usage and limits
- `property_cache` - Caches property data from external APIs
- `user_preferences` - Stores user settings and preferences

You can verify by running:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_analyses', 'user_usage', 'property_cache', 'user_preferences');
```

### 3. Test Database Functions

Test the helper functions by running these queries:

```sql
-- Test usage check (replace with actual user ID)
SELECT can_user_analyze('00000000-0000-0000-0000-000000000000'::uuid);

-- Test usage increment (replace with actual user ID)
SELECT increment_usage('00000000-0000-0000-0000-000000000000'::uuid);

-- Clean expired cache entries
SELECT clean_expired_cache();
```

## Database Schema Overview

### Tables

#### `user_analyses`
- Stores complete property analysis data
- Includes property details, financial inputs, and AI-generated analysis
- Tracks analysis status (generating, completed, failed)
- Supports favorites for quick access

#### `user_usage`
- Tracks monthly analysis usage per user
- Enforces subscription tier limits:
  - Free: 3 analyses/month
  - Pro: 25 analyses/month
  - Premium: Unlimited
- Automatically resets each month

#### `property_cache`
- Caches external API data for 30 days
- Reduces API calls and improves performance
- Tracks cache hits for analytics
- Auto-expires old entries

#### `user_preferences`
- Stores user's default analysis settings
- Saves financing scenarios for reuse
- Manages notification preferences

### Key Functions

#### `can_user_analyze(user_id)`
Returns whether a user can perform an analysis based on their current usage and subscription tier.

#### `increment_usage(user_id)`
Increments the user's monthly analysis count after a successful analysis.

#### `get_or_create_usage(user_id, month)`
Gets or creates a usage record for the specified month.

#### `clean_expired_cache()`
Removes expired entries from the property cache.

## Row Level Security (RLS)

All tables have RLS enabled with the following policies:

- **user_analyses**: Users can only access their own analyses
- **user_usage**: Users can only view their own usage data
- **property_cache**: Public read access, authenticated write
- **user_preferences**: Users can only access their own preferences

## Performance Optimization

The migration includes indexes on:
- User IDs for fast user-specific queries
- Timestamps for chronological sorting
- Address fields for property lookups
- Status fields for filtering

## Subscription Tiers

The system supports three subscription tiers:

1. **Free Tier**
   - 3 analyses per month
   - Basic features

2. **Pro Tier**
   - 25 analyses per month
   - Advanced features

3. **Premium Tier**
   - Unlimited analyses
   - All features

## Environment Variables

Ensure these environment variables are set in your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (if needed)
```

## Troubleshooting

### Migration Fails
- Check for existing tables with the same names
- Ensure you have proper permissions
- Try running the migration in smaller chunks

### RLS Issues
- Verify that RLS is enabled on all tables
- Check that policies are correctly applied
- Test with different user contexts

### Usage Tracking Not Working
- Verify the database functions were created
- Check that the user ID is valid
- Ensure proper permissions on functions

## Next Steps

After setting up the database:

1. Test the property analysis feature end-to-end
2. Monitor usage patterns
3. Set up automated cache cleanup (optional)
4. Configure subscription management integration

## Support

For issues or questions:
1. Check Supabase logs for errors
2. Verify all environment variables are set
3. Ensure database permissions are correct
4. Review the migration SQL for any customizations needed