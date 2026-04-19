import { NextResponse } from 'next/server';
import { fetchEthiopiaRealEstateNews } from '@/lib/news-service';
import { supabase } from '@/lib/supabase';

// This API route acts as a proxy and simple rate-limiter
export const dynamic = 'force-dynamic';

const CRON_SECRET = process.env.CRON_SECRET || 'aloha_default_secret';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authHeader = request.headers.get('authorization');
    
    // Check if caller is the system cron
    const isCron = authHeader === `Bearer ${CRON_SECRET}` || searchParams.get('key') === CRON_SECRET;

    // 1. Check a simple "daily limit"
    const today = new Date().toISOString().split('T')[0];
    
    const { count, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_name', 'Aloha News')
      .gte('created_at', today);

    if (countError) throw countError;

    const DAILY_LIMIT = 5; 
    // Cron bypasses the limit to ensure daily consistency
    if (!isCron && count && count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        message: 'Daily news limit reached for manual sync. Schedule will run automatically.',
        count 
      });
    }

    // 2. Fetch fresh news
    const articles = await fetchEthiopiaRealEstateNews();
    
    // 3. Filter by Recency (Max 7 days old)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const relevantArticles = articles.filter(art => {
      const pubDate = new Date(art.publishedAt);
      return pubDate >= sevenDaysAgo;
    });

    const sliced = relevantArticles.slice(0, DAILY_LIMIT);

    // 4. Auto-post logic: Upsert into 'posts' table
    let postedCount = 0;
    for (const art of sliced) {
      // Create a slug from title
      const slug = art.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60);
      
      // DE-DUPLICATION: Check if this article was ever soft-deleted
      const { data: existing } = await supabase
        .from('posts')
        .select('is_deleted')
        .eq('slug', slug)
        .maybeSingle();

      if (existing?.is_deleted) {
        continue; // Skip re-inserting deleted posts
      }

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
        author_name: "Aloha News",
        type: art.type || 'article',
        is_deleted: false
      }, { onConflict: 'slug' });
      
      postedCount++;
    }

    return NextResponse.json({
      success: true,
      found: articles.length,
      relevant: relevantArticles.length,
      posted: postedCount,
      articles: sliced
    });
  } catch (error: unknown) {
    console.error("News Sync Fault:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Operational Fault"
    }, { status: 500 });
  }
}

