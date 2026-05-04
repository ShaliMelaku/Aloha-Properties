const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkData() {
  const { data: properties, error: pErr } = await supabase.from('properties').select('id, name');
  const { data: leads, error: lErr } = await supabase.from('leads').select('id, name');
  const { data: posts, error: poErr } = await supabase.from('posts').select('id, title');
  
  console.log('Properties:', properties?.length, properties);
  console.log('Leads:', leads?.length);
  console.log('Posts:', posts?.length);
}

checkData();
