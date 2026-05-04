import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const email = process.env.ADMIN_EMAIL!;
    const password = process.env.ADMIN_PASSWORD!;

    // 1. Check if user already exists
    const { data: users, error: listError } =
      await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      return NextResponse.json(
        { success: false, error: listError.message },
        { status: 400 }
      );
    }

    let user = users.users.find(u => u.email === email);

    // 2. Create user only if not exists
    if (!user) {
      const { data, error } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 400 }
        );
      }

      user = data.user;
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found or created' },
        { status: 400 }
      );
    }

    // 3. Ensure admin entry exists
    const { error: adminError } = await supabaseAdmin
      .from('admins')
      .upsert({ id: user.id });

    if (adminError) {
      return NextResponse.json(
        { success: false, error: adminError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin is ready',
      email
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Unknown error occurred' },
      { status: 500 }
    );
  }
}