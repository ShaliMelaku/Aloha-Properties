import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const { error } = await supabase.storage.createBucket('aloha-assets', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4'],
      fileSizeLimit: 52428800 // 50MB
    });

    if (error && !error.message.includes("already exists")) {
       throw error;
    }

    return NextResponse.json({ success: true, message: "Storage bucket 'aloha-assets' initialized." });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error during storage setup';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
