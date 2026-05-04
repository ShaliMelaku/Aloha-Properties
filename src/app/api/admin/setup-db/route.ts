import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const INITIAL_PARTNERS = [
  { name: 'Getas Real Estate', category: 'Developer', website_url: 'https://getasrealestate.com', sort_order: 1 },
  { name: 'Abyssinia Bank', category: 'Bank', website_url: 'https://bankofabyssinia.com', sort_order: 2 },
  { name: 'Zemen Bank', category: 'Bank', website_url: 'https://zemenbank.com', sort_order: 3 },
  { name: 'Ovid Group', category: 'Developer', website_url: 'https://ovidgroup.com', sort_order: 4 },
  { name: 'Varnero', category: 'Developer', website_url: 'https://varnero.com', sort_order: 5 },
];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Check if trusted_companies exists
    const { error: tableError } = await supabase.from('trusted_companies').select('id').limit(1);
    
    if (tableError && (tableError.message.includes('does not exist') || tableError.message.includes('schema cache'))) {
       return NextResponse.json({ 
         error: 'Schema Missing or Cache Stale',
         message: 'The "trusted_companies" table is either missing or the Supabase schema cache is stale. Please copy the contents of "scripts/hardening.sql" and run it in your Supabase SQL Editor. If the table already exists, run: NOTIFY pgrst, \'reload schema\';',
         sql_tip: 'NOTIFY pgrst, \'reload schema\';'
       }, { status: 404 });
    }

    // 2. Seed if empty
    const { data: existing } = await supabase.from('trusted_companies').select('id').limit(1);
    
    if (!existing || existing.length === 0) {
      const { error: seedError } = await supabase.from('trusted_companies').insert(INITIAL_PARTNERS);
      if (seedError) throw seedError;
    }

    // 3. Check for admin_activity table
    const { error: activityError } = await supabase.from('admin_activity').select('id').limit(1);
    if (activityError && activityError.message.includes('does not exist')) {
        return NextResponse.json({ 
            success: true,
            warning: 'trusted_companies seeded, but admin_activity is missing. Audit logging will be disabled until hardening.sql is run.',
            seededPartners: INITIAL_PARTNERS.length
        });
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database synchronization completed. All administrative tables verified.',
      seededPartners: INITIAL_PARTNERS.length
    });
  } catch (err: unknown) {
    return NextResponse.json({ 
      error: 'Sync error',
      details: err instanceof Error ? err.message : 'Unknown'
    }, { status: 500 });
  }
}
