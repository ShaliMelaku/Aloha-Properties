const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectSchema() {
  // We can't directly list columns with the JS client but we can select 1 row from each table
  const tables = ['properties', 'property_units', 'property_unit_types', 'posts', 'leads', 'campaigns'];
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`Table ${table} error:`, error.message);
    } else if (data && data.length > 0) {
      console.log(`Table ${table} columns:`, Object.keys(data[0]));
    } else {
      console.log(`Table ${table} is empty.`);
    }
  }
}

inspectSchema();
