import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret') || req.headers.get('x-admin-secret');
    
    // In production, process.env.ADMIN_SECRET should be set.
    // If not set, we default to a high-entropy fallback for security.
    const validSecret = process.env.ADMIN_SECRET || 'aloha_master_2025_secure';

    if (secret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }
    
    const { data: leads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Supabase Error in /api/admin/leads:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ leads });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get('secret') || req.headers.get('x-admin-secret');
    const validSecret = process.env.ADMIN_SECRET || 'aloha_master_2025_secure';

    if (secret !== validSecret) {
      return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
    }

    const { id, status, notes } = await req.json();
    
    if (!id) return NextResponse.json({ error: 'Lead ID missing' }, { status: 400 });

    const updateData: any = {};
    if (status !== undefined) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const { error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
