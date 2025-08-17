const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_KEY are set in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  console.log('🚀 Running properties table migration...\n');

  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, '..', 'supabase_properties_migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded: supabase_properties_migration.sql');
    console.log('⚠️  Note: This script cannot run raw SQL directly.');
    console.log('\n📋 Please copy and run the following SQL in your Supabase SQL Editor:\n');
    console.log('========================================');
    console.log('Go to: https://app.supabase.com/project/[your-project]/sql/new');
    console.log('========================================\n');
    
    // Display the migration SQL
    console.log(migrationSQL);
    
    console.log('\n========================================');
    console.log('After running the SQL above, the properties table will be created with:');
    console.log('✅ All necessary columns including is_deleted');
    console.log('✅ Proper indexes for performance');
    console.log('✅ Row Level Security policies');
    console.log('========================================\n');

    // Alternative: Try to create the table programmatically (basic version)
    console.log('Alternatively, running basic table creation...\n');
    
    // This won't work with Supabase client, but we can provide instructions
    console.log('❌ Cannot execute DDL statements through Supabase client.');
    console.log('Please use the Supabase SQL Editor as described above.');

  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigration();