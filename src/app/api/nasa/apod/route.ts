import { NextResponse } from 'next/server';

const NASA_API_KEY = process.env.NASA_API_KEY || 'DEMO_KEY';
const APOD_URL = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`;

export const revalidate = 86400; // Cache for 24 hours — new image every day

export async function GET() {
  try {
    const res = await fetch(APOD_URL, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`NASA API error: ${res.status}`);

    const data = await res.json();

    // Normalize — only return what we need
    return NextResponse.json({
      success: true,
      date: data.date,
      title: data.title,
      explanation: data.explanation?.slice(0, 280) + '…',
      url: data.media_type === 'image' ? data.url : null,
      hdurl: data.media_type === 'image' ? (data.hdurl || data.url) : null,
      media_type: data.media_type,
      copyright: data.copyright || 'NASA',
    });
  } catch (err: unknown) {
    // Return a fallback so the UI never crashes
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'NASA API unavailable',
      url: null,
    });
  }
}
