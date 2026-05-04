import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { properties as mockProperties, productProgress } from '@/data/mock-db';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    for (const mock of mockProperties) {
      // 1. Insert Property
      const { data: propData, error: propError } = await supabase
        .from('properties')
        .insert({
          name: mock.name,
          location: mock.location,
          developer: mock.developer,
          lat: mock.lat,
          lng: mock.lng,
          amenities: mock.amenities
        })
        .select()
        .single();

      if (propError) throw propError;

      // 2. Insert Units
      const units = mock.units.map(u => ({
        property_id: propData.id,
        type: u.type,
        beds: u.beds,
        baths: u.baths,
        sqm: u.sqm,
        price: u.price,
        variety_img: u.varietyImg
      }));

      const { error: unitError } = await supabase.from('property_units').insert(units);
      if (unitError) throw unitError;

      // 3. Insert Progress
      const progress = productProgress[mock.name];
      if (progress) {
        const { error: progError } = await supabase.from('property_progress').insert({
          property_id: propData.id,
          percent: progress.progress,
          status: progress.status,
          status_text: progress.statusText,
          estimated_completion: progress.estimated
        });
        if (progError) throw progError;
      }
    }

    return NextResponse.json({ success: true, message: 'Seeding completed successfully.' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: 'Unknown error occurred' }, { status: 500 });
  }
}
