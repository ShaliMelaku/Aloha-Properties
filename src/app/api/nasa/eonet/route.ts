import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get('lat');
    const lngStr = searchParams.get('lng');
    const days = searchParams.get('days') || '365'; // Look back up to a year

    if (!latStr || !lngStr) {
      return NextResponse.json({ success: false, error: 'Latitude and longitude are required' }, { status: 400 });
    }

    const lat = parseFloat(latStr);
    const lng = parseFloat(lngStr);

    // Create a generic bounding box (roughly ~2-3 degrees around the property)
    // format: min_lon,min_lat,max_lon,max_lat
    const delta = 2.5; 
    const minLon = (lng - delta).toFixed(2);
    const minLat = (lat - delta).toFixed(2);
    const maxLon = (lng + delta).toFixed(2);
    const maxLat = (lat + delta).toFixed(2);

    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    const eonetUrl = `https://eonet.gsfc.nasa.gov/api/v3/events?bbox=${bbox}&status=all&days=${days}`;

    const res = await fetch(eonetUrl, { next: { revalidate: 3600 * 24 } }); // Cache 24 hours
    
    if (!res.ok) {
      throw new Error(`NASA EONET responded with status ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json({ success: true, events: data.events || [] });
  } catch (error) {
    console.error('EONET API Error:', error);
    return NextResponse.json({ success: false, events: [], error: String(error) }, { status: 500 });
  }
}
