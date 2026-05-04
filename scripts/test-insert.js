const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedOne() {
  console.log('Seeding one blog post...');
  const post = {
    title: "Test Post",
    slug: "test-post-" + Date.now(),
    excerpt: "Testing...",
    content: "Testing...",
    author_name: "Tester"
  };

  const { data, error } = await supabase.from('posts').insert([post]).select();
  
  if (error) {
    console.error('Core Error:', JSON.stringify(error, null, 2));
  } else {
    console.log('Success:', data);
  }
}

seedOne();
