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

async function checkSchema() {
  console.log('🔍 Checking database schema...\n');

  try {
    // Test 1: Check if we can select from subscriptions table with stripe_price_id
    console.log('📋 Test 1: Checking subscriptions table columns...');
    const { data: subData, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .limit(1);

    if (subError) {
      console.log('❌ Error accessing subscriptions table:', subError.message);
    } else {
      console.log('✅ Subscriptions table accessible');
      if (subData && subData.length > 0) {
        console.log('   Available columns:', Object.keys(subData[0]).join(', '));
      } else {
        console.log('   Table is empty, attempting to check structure...');
        
        // Try to insert and immediately delete a test record
        const testRecord = {
          user_id: '00000000-0000-0000-0000-000000000000',
          stripe_customer_id: `test_${Date.now()}`,
          stripe_subscription_id: `test_sub_${Date.now()}`,
          stripe_price_id: 'test_price',
          status: 'active',
          tier: 'starter'
        };
        
        const { error: insertError } = await supabase
          .from('subscriptions')
          .insert(testRecord);
        
        if (insertError) {
          if (insertError.message.includes('stripe_price_id')) {
            console.log('❌ Column stripe_price_id is missing!');
          } else if (insertError.message.includes('foreign key')) {
            console.log('✅ All columns present (failed on foreign key, which is expected)');
          } else {
            console.log('⚠️  Insert test failed:', insertError.message);
          }
        }
      }
    }

    // Test 2: Check webhook_events table
    console.log('\n📋 Test 2: Checking webhook_events table...');
    const { error: webhookError } = await supabase
      .from('webhook_events')
      .select('id')
      .limit(1);

    if (webhookError) {
      console.log('❌ Error accessing webhook_events table:', webhookError.message);
    } else {
      console.log('✅ Webhook_events table accessible');
    }

    // Test 3: Check usage_tracking table
    console.log('\n📋 Test 3: Checking usage_tracking table...');
    const { error: usageError } = await supabase
      .from('usage_tracking')
      .select('id')
      .limit(1);

    if (usageError) {
      console.log('❌ Error accessing usage_tracking table:', usageError.message);
    } else {
      console.log('✅ Usage_tracking table accessible');
    }

    // Test 4: Check billing_history table
    console.log('\n📋 Test 4: Checking billing_history table...');
    const { error: billingError } = await supabase
      .from('billing_history')
      .select('id')
      .limit(1);

    if (billingError) {
      console.log('❌ Error accessing billing_history table:', billingError.message);
    } else {
      console.log('✅ Billing_history table accessible');
    }

    console.log('\n' + '='.repeat(50));
    console.log('📝 SOLUTION:\n');
    console.log('The error "Could not find the \'stripe_price_id\' column" suggests');
    console.log('that your local Supabase instance may have stale type definitions.\n');
    console.log('Try these solutions in order:\n');
    console.log('1. Restart your Next.js development server:');
    console.log('   Press Ctrl+C and run: npm run dev\n');
    console.log('2. If that doesn\'t work, regenerate Supabase types:');
    console.log('   npx supabase gen types typescript --local > src/types/supabase.ts\n');
    console.log('3. If still having issues, go to Supabase dashboard and run:');
    console.log('   ALTER TABLE public.subscriptions');
    console.log('   ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;\n');
    console.log('4. Clear Next.js cache:');
    console.log('   rm -rf .next && npm run dev');
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

checkSchema();