const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkPropertiesSchema() {
  console.log('Checking properties table schema...\n');

  try {
    // Check if properties table exists
    const { data: tables, error: tableError } = await supabase
      .from('properties')
      .select('id')
      .limit(1);

    if (tableError) {
      if (tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
        console.error('❌ Properties table does not exist!');
        console.log('Please run the migration: supabase_properties_migration.sql');
        return false;
      }
      console.error('Error checking table:', tableError.message);
      return false;
    }

    console.log('✅ Properties table exists');

    // Check for is_deleted column by attempting to query it
    const { error: columnError } = await supabase
      .from('properties')
      .select('id, is_deleted')
      .limit(1);

    if (columnError) {
      if (columnError.message.includes('is_deleted')) {
        console.error('❌ Column "is_deleted" does not exist!');
        console.log('\nTo fix this, run the following SQL in Supabase SQL Editor:');
        console.log('ALTER TABLE public.properties ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT false;');
        console.log('CREATE INDEX IF NOT EXISTS idx_properties_is_deleted ON public.properties(is_deleted);');
        return false;
      }
      console.error('Error checking is_deleted column:', columnError.message);
      return false;
    }

    console.log('✅ Column "is_deleted" exists');

    // Test soft delete functionality
    console.log('\n📊 Properties statistics:');
    
    const { data: allProps, error: allError } = await supabase
      .from('properties')
      .select('id, is_deleted', { count: 'exact' });

    if (!allError && allProps) {
      const deletedCount = allProps.filter(p => p.is_deleted === true).length;
      const activeCount = allProps.filter(p => p.is_deleted === false || p.is_deleted === null).length;
      
      console.log(`   Total properties: ${allProps.length}`);
      console.log(`   Active properties: ${activeCount}`);
      console.log(`   Deleted properties: ${deletedCount}`);
    }

    console.log('\n✅ Schema check complete! Properties table is properly configured for soft deletes.');
    return true;

  } catch (error) {
    console.error('Unexpected error:', error);
    return false;
  }
}

checkPropertiesSchema().then(success => {
  process.exit(success ? 0 : 1);
});