import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://mock-url.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key';

// For API routes (Service Role bypasses RLS)
export const supabase = createClient(supabaseUrl, supabaseKey);

// For Frontend Client (Anon Key respects RLS and persists auth)
export const supabaseClient = createClient(
  supabaseUrl,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'mock-key'
);
