const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const today = new Date().toISOString().split('T')[0];
  const { data, count, error } = await supabase
    .from('posts')
    .select('id', { count: 'exact' })
    .eq('type', 'news')
    .gte('created_at', today)
    .limit(1);
    
  console.log("Count:", count);
  console.log("Error object:", error);
}

test();
