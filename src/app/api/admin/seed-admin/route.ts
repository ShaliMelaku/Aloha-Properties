import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { error } = await supabase.auth.admin.createUser({
      email: 'shalieth101@gmail.com',
      password: 'ShaliAloha2026',
      email_confirm: true
    });

    if (error) {
      // If user already exists or similar error
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created.',
      email: 'shalieth101@gmail.com',
      password: 'ShaliAloha2026'
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
    return NextResponse.json({ success: false, error: 'Unknown error occurred' }, { status: 500 });
  }
}
