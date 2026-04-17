import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const path = formData.get('path') as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = path ? `${path}/${fileName}` : fileName;

    const { data, error } = await supabase.storage
      .from('aloha-assets')
      .upload(filePath, file, { contentType: file.type });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('aloha-assets')
      .getPublicUrl(filePath);

    return NextResponse.json({ success: true, url: publicUrlData.publicUrl });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
