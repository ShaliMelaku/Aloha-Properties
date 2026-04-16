import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { renderEmailTemplate } from '@/lib/email-template';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const token = authHeader?.split(' ')[1];
    if (!token) return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });

    const { leads, subject, htmlBody } = await req.json();

    if (!leads || !leads.length || !subject || !htmlBody) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 });
    }

    const isSandbox = process.env.RESEND_SANDBOX === 'true';
    const adminEmail = process.env.ADMIN_EMAIL || 'shalieth101@gmail.com';
    
    console.log(`[Broadcast] Sending payload. Sandbox: ${isSandbox}, Admin: ${adminEmail}`);

    const emailsToSend = leads.map((lead: { name: string; email: string }) => {
      // Basic personalization & Newline conversion
      const personalizedMessage = htmlBody.replace(/{{name}}/g, lead.name).replace(/\n/g, '<br/>');
      
      // Wrap in Cinematic Template
      const premiumHtml = renderEmailTemplate(personalizedMessage, lead.name);

      return {
        from: 'Aloha Admin <onboarding@resend.dev>', 
        to: isSandbox ? adminEmail : lead.email,
        subject: isSandbox ? `[TEST] ${subject} (To: ${lead.email})` : subject,
        html: premiumHtml,
      };
    });

    // Send emails in batch using Resend
    const { data, error } = await resend.batch.send(emailsToSend);
    console.log('[Broadcast] Resend Response:', { data, error });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log the campaign in Supabase for history
    await supabase.from('campaigns').insert({
      subject,
      audience_size: leads.length,
      sent_by: user.id
    });

    return NextResponse.json({ success: true, count: leads.length, data });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Broadcast transmission error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
