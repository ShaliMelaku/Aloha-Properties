import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ bucket: string; path: string[] }> }
) {
  try {
    const { bucket, path: pathArray } = await params;
    const path = pathArray.join('/');

    if (!bucket || !path) {
      return new NextResponse('Invalid parameters', { status: 400 });
    }

    const { data, error } = await supabase.storage.from(bucket).download(path);

    if (error || !data) {
      console.error('PDF Proxy Error:', error);
      return new NextResponse('File not found', { status: 404 });
    }

    // Stream the PDF back
    return new Response(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    console.error('PDF Proxy Internal Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
