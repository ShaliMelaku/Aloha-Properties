import { NextResponse } from "next/server";

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
      source: "Frankfurter API (Cached)",
      timestamp: new Date(lastFetchTime).toISOString()
    });
  }

  try {
    const response = await fetch("https://api.frankfurter.dev/v2/latest?base=USD&symbols=ETB", {
      next: { revalidate: 3600 } // Next.js level fetch caching
    });
    
    if (!response.ok) throw new Error("API Unreachable");
    
    const data = await response.json();
    const rate = data.rates.ETB;
    
    if (rate) {
      cachedRate = rate;
      lastFetchTime = now;
      
      return NextResponse.json({
        success: true,
        rate: rate,
        source: "Frankfurter API (Live)",
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error("Invalid Data");
    }
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      rate: cachedRate || 156.91, // Fallback to last known good or hardcoded baseline
      error: "Using fallback data due to connectivity issues" 
    }, { status: 200 }); // Status 200 even on fallback to prevent UI breakage
  }
}
