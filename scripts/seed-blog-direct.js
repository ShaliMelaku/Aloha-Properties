const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const BLOG_POSTS = [
  {
    title: "Addis Ababa 2026: The Rise of Vertical Luxury",
    slug: "addis-ababa-2026-vertical-luxury",
    excerpt: "Exploring the shift from traditional sprawl to high-density premium developments in the heart of Ethiopia's capital.",
    content: "Addis Ababa is undergoing a dramatic transformation...",
    cover_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000",
    author_name: "Aloha Intelligence"
  },
  {
    title: "The Diaspora Playbook: Hedging with Premium Real Estate",
    slug: "diaspora-playbook-hedging-real-estate",
    excerpt: "Why Ethiopian investors abroad are shifting capital from traditional savings to high-appreciation property assets.",
    content: "With global economic volatility, the Ethiopian Diaspora is increasingly seeking stability in tangible assets...",
    cover_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000",
    author_name: "Strategic Desk"
  },
  {
    title: "Eco-Conscious Living: The Future of High-End Housing",
    slug: "eco-conscious-living-future-housing",
    excerpt: "How sustainable architecture and green spaces are becoming the primary value drivers for modern developers.",
    content: "Sustainability is no longer a buzzword; it's a value multiplier...",
    cover_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
    author_name: "Aloha Editorial"
  }
];

async function seed() {
  console.log('Seeding blog posts...');
  const { data, error } = await supabase.from('posts').insert(BLOG_POSTS).select();
  if (error) {
    console.error('Error seeding:', error);
  } else {
    console.log('Successfully seeded:', data.length, 'posts');
  }
}

seed();
