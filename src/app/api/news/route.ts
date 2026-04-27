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
    
    // Check if caller is the system cron (Vercel) or manual with secret
    const isCron = 
      request.headers.get('x-vercel-cron') === '1' || 
      authHeader === `Bearer ${CRON_SECRET}` || 
      searchParams.get('key') === CRON_SECRET;

    // 1. Check a simple "daily limit"
    const today = new Date().toISOString().split('T')[0];
    
    const { count, error: countError } = await supabase
      .from('posts')
      .select('id', { count: 'exact', head: true })
      .eq('author_name', 'Aloha News')
      .gte('created_at', today);

    if (countError) throw countError;

    const force = searchParams.get('force') === 'true';
    const DAILY_LIMIT = 5; 
    
    // Cron and Force bypass the limit to ensure daily consistency or manual testing
    if (!isCron && !force && count && count >= DAILY_LIMIT) {
      return NextResponse.json({ 
        message: `Daily news limit (${DAILY_LIMIT}) reached for manual sync. Use ?force=true to override.`,
        count 
      });
    }

    // 2. Fetch fresh news
    const articles = await fetchEthiopiaRealEstateNews();
    
    if (articles.length === 0) {
       return NextResponse.json({ 
         success: false, 
         message: "Zero articles returned from News API. Check your NEWS_API_KEY and keywords.",
         keywords: '"Ethiopia" AND (economics OR regulation OR "real estate" OR investment OR finance OR policy OR banking OR "Addis Ababa")'
       });
    }
    
    // 3. Guarantee at least 3 articles (prioritizing the freshest available)
    // We removed the strict 30-day filter because the user wants guaranteed content volume.
    const relevantArticles = articles;

    const sliced = relevantArticles.slice(0, DAILY_LIMIT);

    // 4. Auto-post logic: Upsert into 'posts' table
    let postedCount = 0;
    for (const art of sliced) {
      // Create a slug from title
      const slug = art.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').slice(0, 60);
      
      // DE-DUPLICATION: Check if this article was already fetched
      const { data: existing } = await supabase
        .from('posts')
        .select('id, title')
        .or(`slug.eq.${slug},title.eq.${art.title.replace(/'/g, "''")}`)
        .maybeSingle();

      if (existing) {
        continue; // Skip re-inserting and padding the post count for already synced news.
      }



      await supabase.from('posts').upsert({
        title: art.title,
        slug: slug,
        excerpt: art.description,
        content: art.content || art.description,
        cover_image: art.image,
        source_label: art.source.name,
        source_url: art.url,
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

