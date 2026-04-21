import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Cache valid for 12 hours
let cachedRate: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 12 * 60 * 60 * 1000; 

export async function GET() {
  const now = Date.now();
  
  if (cachedRate && (now - lastFetchTime < CACHE_DURATION)) {
    return NextResponse.json({
      success: true,
      rate: cachedRate,
      source: "Google Search (Cached)",
      timestamp: new Date(lastFetchTime).toISOString()
    });
  }

  try {
    const response = await fetch("https://www.google.com/search?q=1+usd+to+etb", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/122.0.0.0 Safari/537.36'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) throw new Error("Google Search Unreachable");
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Google typically embeds the conversion in a data attribute or specific span
    // One common class is .a61j6 or we can look for the data-exchange-rate attribute
    const rateText = $('.BNeawe.iBp4i.AP7Wnd').text() || $('span[data-value]').attr('data-value');
    
    let rate = null;
    if (rateText) {
      const match = rateText.match(/(\d+[,\.]\d+)/);
      if (match) {
        rate = parseFloat(match[1].replace(',', ''));
      }
    }

    if (!rate) {
      // Fallback regex over raw HTML if cheerio selector missed
      const fallbackMatch = html.match(/([\d,\.]+)\s*Ethiopian Birr/i);
      if (fallbackMatch) {
         rate = parseFloat(fallbackMatch[1].replace(',', ''));
      }
    }
    
    if (rate && !isNaN(rate)) {
      cachedRate = rate;
      lastFetchTime = now;
      
      return NextResponse.json({
        success: true,
        rate: rate,
        source: "Google Search (Live)",
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("Invalid Conversion Data");
    }
  } catch (e) {
    return NextResponse.json({ 
      success: false, 
      rate: cachedRate || 157.00, // Updated Baseline April 2026 (~157 ETB)
      error: "Using fallback data due to connectivity or parsing issues" 
    }, { status: 200 });
  }
}

