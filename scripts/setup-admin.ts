#!/usr/bin/env node
/**
 * Script to set up admin access for a user
 * Usage: npm run setup-admin -- your-email@gmail.com
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local');
  process.exit(1);
}

// Create Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin(email: string) {
  try {
    console.log(`\n🔧 Setting up admin access for: ${email}\n`);

    // First, check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw new Error(`Failed to list users: ${userError.message}`);
    }

    const targetUser = user.users.find(u => u.email === email);
    
    if (!targetUser) {
      console.error(`❌ User with email ${email} not found`);
      console.log('\nMake sure the user has signed up first.');
      return;
    }

    console.log(`✅ Found user: ${targetUser.id}`);

    // Update user profile to set admin status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        id: targetUser.id,
        is_admin: true,
        role: 'admin',
        subscription_tier: 'enterprise',
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      throw new Error(`Failed to update profile: ${profileError.message}`);
    }

    console.log('✅ User profile updated with admin status');

    // Also update the admin emails in the config file
    console.log('\n📝 Don\'t forget to update the ADMIN_EMAILS in:');
    console.log('   src/lib/admin-config.ts');
    console.log(`   Add: '${email}'`);

    console.log('\n🎉 Admin setup complete!');
    console.log('\nThe user now has:');
    console.log('  • Admin role in the database');
    console.log('  • Enterprise subscription tier');
    console.log('  • Unlimited analysis access');
    console.log('  • Access to admin-only features');

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('❌ Error: Please provide an email address');
  console.error('Usage: npm run setup-admin -- your-email@gmail.com');
  process.exit(1);
}

// Validate email format
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!emailRegex.test(email)) {
  console.error('❌ Error: Invalid email format');
  process.exit(1);
}

setupAdmin(email);