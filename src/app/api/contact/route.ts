import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { supabase } from '@/lib/supabase';
import { renderEmailTemplate } from '@/lib/email-template';
import { syncToHubSpot } from '@/lib/hubspot-service';

const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

export async function POST(req: Request) {
  try {
    const { name, email, interest, message } = await req.json();

    if (!name || !email) {
      return NextResponse.json({ error: 'Name and email are required.' }, { status: 400 });
    }

    // 1. Check if email already exists in leads
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, status')
      .eq('email', email)
      .single();

    if (existingLead) {
      // 2. Automated Response Logging: Instead of a duplicate lead, log an engagement response
      await supabase
        .from('lead_responses')
        .insert([{
          lead_id: existingLead.id,
          response_text: message || `Contact Form Inquiry: ${interest || 'General'}`,
          interest_level: 'High',
          interest_summary: interest,
          location: 'Website Contact Form'
        }]);

      // 3. Update lead status to 'qualified' if they were just 'new' or 'contacted'
      if (existingLead.status === 'new' || existingLead.status === 'contacted') {
        await supabase
          .from('leads')
          .update({ status: 'qualified', notes: `Latest Inquiry: ${message}` })
          .eq('id', existingLead.id);
      }
      
      console.log(`Automated engagement logged for existing lead: ${email}`);
    } else {
      // 4. Create new lead if they don't exist
      const { error: dbError } = await supabase
        .from('leads')
        .insert([{ name, email, interest, message, source: 'contact_form' }]);
        
      if (dbError) {
        console.error("Database insert failed:", dbError);
      } else {
        // Parallel sync to HubSpot
        syncToHubSpot({ name, email, interest, message }).catch(err => console.error("HS Sync fail:", err));
      }
    }

    const isLocal = process.env.NODE_ENV === 'development';

    // Email 1: Notification to Admin
    const { data: adminData, error: adminError } = await resend.emails.send({
      from: 'Aloha Properties <onboarding@resend.dev>', 
      to: [isLocal ? 'shalieth101@gmail.com' : 'hello@alohaproperties.com'], 
      subject: `[${isLocal ? 'TEST' : 'NEW'}] Inquiry from ${name}: ${interest}`,
      html: `
        <h2>New Property Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Interest:</strong> ${interest || 'N/A'}</p>
        <p><strong>Message:</strong><br/> ${message?.replace(/\n/g, '<br/>') || 'N/A'}</p>
      `,
    });

    if (adminError) {
      return NextResponse.json({ error: adminError.message }, { status: 500 });
    }

    // Email 2: Aloha Concierge Auto-responder to Lead
    const conciergeContent = `
        <p>Thank you for reaching out to Aloha Properties. This is an automated confirmation that your inquiry regarding <strong>${interest || 'our premium real estate collection'}</strong> has been received by our Concierge Desk.</p>
        <p>Our team of dedicated real estate advisors is currently reviewing your message and will be in touch shortly to provide personalized assistance.</p>
        <p>In the meantime, feel free to explore our digital products to view our exquisite projects.</p>
    `;
    const leadHtml = renderEmailTemplate(conciergeContent, name);

    const { error: autoError } = await resend.emails.send({
      from: 'Aloha Concierge <onboarding@resend.dev>',
      to: [isLocal ? 'shalieth101@gmail.com' : email],
      subject: 'Inquiry Received — Aloha Properties',
      html: leadHtml,
    });
    
    // We do not fail the request if the auto responder fails, just log it.
    if (autoError) {
       console.error("Auto-responder failed:", autoError);
    }

    return NextResponse.json({ success: true, data: adminData });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
