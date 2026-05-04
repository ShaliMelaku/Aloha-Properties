import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Allowed buckets whitelist (security)
const ALLOWED_BUCKETS = ['aloha-assets', 'blog-media'];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const path = (formData.get('path') as string) || 'uploads';
    const bucket = (formData.get('bucket') as string) || 'aloha-assets';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!ALLOWED_BUCKETS.includes(bucket)) {
      return NextResponse.json({ error: 'Invalid bucket target' }, { status: 400 });
    }

    // Ensure bucket exists (create if not) — service role can do this
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some((b) => b.name === bucket);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucket, { public: true });
    }

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${path}/${fileName}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false,
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown upload error';
    console.error('[Upload API Error]', msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
