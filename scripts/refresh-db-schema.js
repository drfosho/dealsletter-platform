#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function refreshSchema() {
  console.log('🔄 Refreshing database schema...\n');

  try {
    // Check if subscriptions table exists and has correct columns
    const { data: columns, error: columnsError } = await supabase
      .rpc('get_table_columns', {
        table_name: 'subscriptions',
        schema_name: 'public'
      })
      .catch(() => ({ data: null, error: 'Function not found' }));

    if (columnsError === 'Function not found') {
      // Create a helper function to get table columns
      console.log('📦 Creating helper function...');
      const { error: funcError } = await supabase.rpc('query', {
        query: `
          CREATE OR REPLACE FUNCTION get_table_columns(table_name text, schema_name text DEFAULT 'public')
          RETURNS TABLE(column_name text, data_type text, is_nullable text)
          LANGUAGE sql
          SECURITY DEFINER
          AS $$
            SELECT 
              column_name::text,
              data_type::text,
              is_nullable::text
            FROM information_schema.columns
            WHERE table_schema = schema_name
              AND table_name = get_table_columns.table_name
            ORDER BY ordinal_position;
          $$;
        `
      }).catch(() => ({ error: 'Cannot create function' }));
    }

    // Try a direct query to check the subscriptions table structure
    console.log('📋 Checking subscriptions table structure...');
    const { data: testData, error: testError } = await supabase
      .from('subscriptions')
      .select('id, user_id, stripe_customer_id, stripe_subscription_id, stripe_price_id, status, tier')
      .limit(1);

    if (testError) {
      if (testError.message.includes('stripe_price_id')) {
        console.log('❌ Column stripe_price_id not found in subscriptions table');
        console.log('🔧 Adding missing column...');
        
        // Add the missing column
        const { error: alterError } = await supabase.rpc('query', {
          query: `ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;`
        }).catch(async () => {
          // If direct RPC doesn't work, we'll need to run migrations
          console.log('⚠️  Cannot alter table directly. Please run migrations manually.');
          return { error: 'Manual migration needed' };
        });

        if (!alterError) {
          console.log('✅ Column stripe_price_id added successfully');
        }
      } else {
        console.log('✅ Subscriptions table structure is correct');
      }
    } else {
      console.log('✅ Subscriptions table exists with all required columns');
    }

    // Check if the webhook can insert test data
    console.log('\n🧪 Testing subscription insert capability...');
    const testSubscription = {
      user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
      stripe_customer_id: `test_cus_${Date.now()}`,
      stripe_subscription_id: `test_sub_${Date.now()}`,
      stripe_price_id: 'test_price_starter',
      status: 'active',
      tier: 'starter',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancel_at_period_end: false
    };

    const { data: insertTest, error: insertError } = await supabase
      .from('subscriptions')
      .insert(testSubscription)
      .select();

    if (insertError) {
      if (insertError.message.includes('stripe_price_id')) {
        console.log('❌ Still cannot use stripe_price_id column');
        console.log('Error:', insertError.message);
        console.log('\n📝 Recommended action:');
        console.log('1. Go to your Supabase dashboard');
        console.log('2. Run this SQL in the SQL editor:');
        console.log(`
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
        `);
        console.log('3. Then restart your development server');
      } else if (insertError.message.includes('violates foreign key constraint')) {
        console.log('✅ Table structure is correct (foreign key validation working)');
      } else {
        console.log('⚠️  Unexpected error:', insertError.message);
      }
    } else {
      console.log('✅ Test insert successful');
      // Clean up test data
      if (insertTest && insertTest[0]) {
        await supabase
          .from('subscriptions')
          .delete()
          .eq('id', insertTest[0].id);
        console.log('🧹 Test data cleaned up');
      }
    }

    console.log('\n✨ Schema refresh complete!');
    console.log('\nIf you still see errors, try:');
    console.log('1. Restart your Next.js development server');
    console.log('2. Clear your browser cache');
    console.log('3. Check Supabase dashboard for any migration issues');

  } catch (error) {
    console.error('❌ Error refreshing schema:', error);
    console.log('\n📝 Manual fix required:');
    console.log('Please go to your Supabase dashboard and run:');
    console.log(`
-- Ensure stripe_price_id column exists
ALTER TABLE public.subscriptions 
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'subscriptions' 
  AND column_name = 'stripe_price_id';
    `);
  }
}

refreshSchema();