import { NextResponse } from "next/server";

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
    const response = await fetch("https://open.er-api.com/v6/latest/USD", {
      next: { revalidate: 3600 }
    });

    if (!response.ok) throw new Error("Exchange Rate API Unreachable");

    const data = await response.json();
    const rate = data?.rates?.ETB;

    if (rate && !isNaN(rate) && rate > 50) { // Sanity check
      cachedRate = rate;
      lastFetchTime = now;

      return NextResponse.json({
        success: true,
        rate: rate,
        source: "Open Exchange Rates (Live)",
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

