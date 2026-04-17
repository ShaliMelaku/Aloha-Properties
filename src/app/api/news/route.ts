import { NextResponse } from 'next/server';
import { fetchEthiopiaRealEstateNews } from '@/lib/news-service';
import { supabase } from '@/lib/supabase';

// This API route acts as a proxy and simple rate-limiter
export async function GET() {
  try {
    // 1. Check a simple "daily limit"
    // Here we can fetch the count of news added today from our DB
    const today = new Date().toISOString().split('T')[0];
    
    const { count, error: countError } = await supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('type', 'news')
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
      const slug = art.title.toLowerCase().replace(/[^a-z0-0]/g, '-').slice(0, 50);
      
      await supabase.from('posts').upsert({
        title: art.title,
        slug: slug,
        excerpt: art.description,
        content: art.content || art.description,
        cover_image: art.image,
        source_label: art.source.name,
        source_url: art.url,
        type: art.type, // 'article' | 'report' | 'guide'
        author_name: "Aloha Intelligence"
      }, { onConflict: 'title' });
    }

    return NextResponse.json({
      success: true,
      posted: sliced.length,
      articles: sliced
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Internal Operational Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

