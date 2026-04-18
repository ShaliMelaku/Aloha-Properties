import { NextResponse } from 'next/server';
import { fetchEthiopiaRealEstateNews } from '@/lib/news-service';
import { supabase } from '@/lib/supabase';

// This API route acts as a proxy and simple rate-limiter
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 1. Check a simple "daily limit"
    // Here we can fetch the count of news added today from our DB
    const today = new Date().toISOString().split('T')[0];
    
    const { count, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_name', 'Aloha Intelligence')
      .gte('created_at', today);

    if (countError) throw countError;

    const DAILY_LIMIT = 5; // As requested, a daily limit
    if (count && count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        message: 'Daily news limit reached. Check back tomorrow.',
        count 
      });
    }

    // 2. Fetch fresh news
    const articles = await fetchEthiopiaRealEstateNews();
    const sliced = articles.slice(0, DAILY_LIMIT);

    // 3. Auto-post logic: Upsert into 'posts' table
    for (const art of sliced) {
      // Create a slug from title
      const slug = art.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60);
      
      await supabase.from('posts').upsert({
        title: art.title,
        slug: slug,
        excerpt: art.description,
        content: art.content || art.description,
        cover_image: art.image,
        source_label: art.source.name,
        source_url: art.url,
        // For reports, use the article URL as a downloadable reference
        file_url: art.type === 'report' ? art.url : null,
        author_name: "Aloha Intelligence",
        type: art.type || 'article',
      }, { onConflict: 'slug' });
    }

    return NextResponse.json({
      success: true,
      posted: sliced.length,
      articles: sliced
    });
  } catch (error: unknown) {
    console.error("News Sync Fault:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Operational Fault",
      details: error instanceof Error ? error.stack : JSON.stringify(error)
    }, { status: 500 });
  }
}

