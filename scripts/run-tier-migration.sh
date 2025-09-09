#!/bin/bash

# Script to run the subscription tier migration
# This updates tier names from basic/pro to free/starter/professional/premium

echo "======================================"
echo "Running Subscription Tier Migration"
echo "======================================"
echo ""
echo "This migration will:"
echo "1. Update tier names from basic→free, pro→professional"
echo "2. Fix analysis limits (free:0, starter:12, professional:25, premium:unlimited)"
echo "3. Update database constraints and functions"
echo ""

# Load environment variables
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
fi

# Check if Supabase URL and key are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
    echo "❌ Error: Supabase credentials not found in .env.local"
    echo "Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set"
    exit 1
fi

# Path to migration file
MIGRATION_FILE="supabase/migrations/20250109_fix_subscription_tiers.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found at $MIGRATION_FILE"
    exit 1
fi

echo "Running migration..."
echo ""

# Run the migration using psql
SUPABASE_DB_URL="${NEXT_PUBLIC_SUPABASE_URL/https:\/\//postgresql:\/\/postgres:${SUPABASE_SERVICE_ROLE_KEY}@}"
SUPABASE_DB_URL="${SUPABASE_DB_URL}/postgres?sslmode=require"

# Execute the migration
psql "$SUPABASE_DB_URL" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "Summary of changes:"
    echo "- Updated tier names: basic→free, pro→professional"
    echo "- Set correct analysis limits per tier"
    echo "- Updated database constraints and functions"
    echo "- Fixed Stripe webhook tier mapping"
else
    echo ""
    echo "❌ Migration failed. Please check the error messages above."
    exit 1
fi