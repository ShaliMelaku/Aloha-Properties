const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const { data, error } = await supabase.rpc('get_tables'); // This might not exist, alternative:
  const { data: tables, error: tableError } = await supabase
    .from('properties')
    .select('count', { count: 'exact', head: true });
  
  console.log('Connected to Supabase. Testing "properties" table...');
  if (tableError) console.error('Error fetching properties:', tableError);
  else console.log('Properties table found.');

  const { data: posts, error: postError } = await supabase
    .from('posts')
    .select('count', { count: 'exact', head: true });
    
  console.log('Testing "posts" table...');
  if (postError) console.error('Error fetching posts:', JSON.stringify(postError, null, 2));
  else console.log('Posts table found. Data:', posts);
}

checkTables();
