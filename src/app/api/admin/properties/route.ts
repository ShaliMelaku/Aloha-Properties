import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

/**
 * Admin properties API
 * Handles CRUD for properties, units, and progress
 */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data: properties, error } = await supabase
      .from('properties')
      .select(`
        *,
        units:property_units(*),
        progress:property_progress(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json({ properties });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { property, units, progress } = await req.json();

    // 1. Insert Property
    const { data: propData, error: propError } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single();

    if (propError) throw propError;

    // 2. Insert Units
    if (units && units.length > 0) {
      const unitsWithId = units.map((u: any) => ({ ...u, property_id: propData.id }));
      const { error: unitError } = await supabase.from('property_units').insert(unitsWithId);
      if (unitError) throw unitError;
    }

    // 3. Insert Progress
    if (progress) {
      const { error: progError } = await supabase.from('property_progress').insert({
        ...progress,
        property_id: propData.id
      });
      if (progError) throw progError;
    }

    return NextResponse.json({ success: true, propertyId: propData.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');
  const id = searchParams.get('id');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { percent, status_text } = await req.json();
    const { error } = await supabase
      .from('property_progress')
      .update({ percent, status_text })
      .eq('property_id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
