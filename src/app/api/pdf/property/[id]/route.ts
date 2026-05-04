import { NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return new NextResponse('Invalid property ID', { status: 400 });
    }

    // Fetch the property brochure URL from the database
    const { data: property, error: dbError } = await supabaseClient
      .from('properties')
      .select('pdf_brochure_url')
      .eq('id', id)
      .single();

    if (dbError || !property?.pdf_brochure_url) {
      console.error('Database Error:', dbError);
      return new NextResponse('Property brochure not found', { status: 404 });
    }

    const url = property.pdf_brochure_url;
    
    // Match Supabase storage URL pattern to extract bucket and path
    const supabasePattern = /supabase\.co\/storage\/v1\/object\/public\/([^/]+)\/(.+)/;
    const match = url.match(supabasePattern);

    if (!match) {
      return new NextResponse('Invalid brochure URL format', { status: 500 });
    }

    const bucket = match[1];
    const path = match[2];

    const { data, error: storageError } = await supabaseClient.storage.from(bucket).download(path);

    if (storageError || !data) {
      console.error('Storage Error:', storageError);
      return new NextResponse('File could not be retrieved', { status: 404 });
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
    console.error('Secure PDF Internal Error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
