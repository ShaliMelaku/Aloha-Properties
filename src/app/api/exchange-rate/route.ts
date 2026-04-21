import { NextResponse } from "next/server";
import * as cheerio from "cheerio";

// Cache valid for 1 hour
let cachedRate: number | null = null;
let lastFetchTime = 0;
const CACHE_DURATION = 1 * 60 * 60 * 1000; 

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
    const response = await fetch("https://www.google.com/search?q=1+usd+to+etb+rate", {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      next: { revalidate: 3600 }
    });
    
    if (!response.ok) throw new Error("Google Search Unreachable");
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Multiple possible selectors for Google's conversion result
    const rateStr = $('.BNeawe.iBp4i.AP7Wnd').first().text() || 
                  $('.DFlfde.SwHCTb').first().text() ||
                  $('.vk_ans').first().text();

    let rate = null;
    
    // Attempt 1: Scraper
    if (rateStr) {
      const match = rateStr.match(/(\d+[\.\,]\d+)/);
      if (match) {
        rate = parseFloat(match[1].replace(',', ''));
      }
    }

    // Attempt 2: Direct Regex on HTML (resilient to selector changes)
    if (!rate || isNaN(rate)) {
      const dataValueMatch = html.match(/data-value="(\d+\.\d+)"/);
      if (dataValueMatch) {
        rate = parseFloat(dataValueMatch[1]);
      }
    }

    // Attempt 3: Currency string match
    if (!rate || isNaN(rate)) {
      const regex = /([\d\.]+)\s*Ethiopian Birr/i;
      const fallbackMatch = html.match(regex);
      if (fallbackMatch) {
        rate = parseFloat(fallbackMatch[1]);
      }
    }
    
    // If Google fails, try a direct finance page if needed, but let's stick to this for now
    if (rate && !isNaN(rate) && rate > 50) { // Sanity check
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
  } catch {
    return NextResponse.json({ 
      success: false, 
      rate: cachedRate || 157.15, // Baseline for April 2026
      error: "Using fallback data",
      msg: "Live NBE Sync currently delayed"
    }, { status: 200 });
  }
}

