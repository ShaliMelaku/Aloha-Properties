const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function inspectProperties() {
  const { data, error } = await supabase.from('properties').select('*');
  console.log('Properties Raw:', JSON.stringify(data, null, 2));
}

inspectProperties();
