import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const BLOG_POSTS = [
  {
    title: "Addis Ababa 2026: The Rise of Vertical Luxury",
    slug: "addis-ababa-2026-vertical-luxury",
    excerpt: "Exploring the shift from traditional sprawl to high-density premium developments in the heart of Ethiopia's capital.",
    content: "Addis Ababa is undergoing a dramatic transformation. As land scarcity in prime districts like Bole and Kazanchis increases, developers are looking skyward. This vertical evolution isn't just about height—it's about a new standard of living. Integrated amenities like sky-pools, private gyms, and concierge services are becoming the baseline for the city's new elite.\n\nInvestment yields in these vertical communities are currently trending 15% higher than traditional standalone villas, driven by a growing class of professional expatriates and the diaspora who prioritize security and a 'lock-and-leave' lifestyle.",
    cover_image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000",
    author_name: "Aloha Intelligence"
  },
  {
    title: "The Diaspora Playbook: Hedging with Premium Real Estate",
    slug: "diaspora-playbook-hedging-real-estate",
    excerpt: "Why Ethiopian investors abroad are shifting capital from traditional savings to high-appreciation property assets.",
    content: "With global economic volatility, the Ethiopian Diaspora is increasingly seeking stability in tangible assets. Addis Ababa's real estate market has historically shown resilience, often outperforming traditional stock indices in the long term. \n\nOur latest data suggests that properties in 'Emerging Districts' are seeing price-per-square-meter increases of up to 12% annually. By investing in projects early in their construction phase, diaspora members are securing double-digit capital gains before the finishing touches are even applied. The dual-currency tools now available on platforms like Aloha make this analysis simpler than ever.",
    cover_image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=1000",
    author_name: "Strategic Desk"
  },
  {
    title: "Eco-Conscious Living: The Future of High-End Housing",
    slug: "eco-conscious-living-future-housing",
    excerpt: "How sustainable architecture and green spaces are becoming the primary value drivers for modern developers.",
    content: "Sustainability is no longer a buzzword; it's a value multiplier. Modern tenants and buyers are willing to pay a premium for buildings that feature cross-ventilation, low-emissivity glass, and integrated solar solutions. \n\nIn projects like the upcoming Getas Green Residences, the inclusion of vertical gardens and water recycling systems has contributed to a 20% faster pre-sale rate compared to traditional concrete-heavy designs. As global standards align, these green buildings will hold their value significantly better in the secondary market.",
    cover_image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=1000",
    author_name: "Aloha Editorial"
  }
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Clear existing posts to prevent slug conflicts
    await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // 2. Insert Posts
    const { data, error } = await supabase
      .from('posts')
      .insert(BLOG_POSTS)
      .select();

    if (error) {
      console.error('Supabase Error:', error);
      return NextResponse.json({ error: error.message, details: error }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `${data?.length || 0} blog posts seeded successfully.`,
      posts: data 
    });
  } catch (err: any) {
    console.error('Seeding Catch:', err);
    return NextResponse.json({ 
      error: err?.message || 'Unknown error', 
      stack: err?.stack,
      raw: JSON.stringify(err)
    }, { status: 500 });
  }
}
