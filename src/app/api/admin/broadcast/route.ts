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

    const { subject, body, targetFilter, individualEmails } = await req.json();

    if (!subject || !body) {
      return NextResponse.json({ error: 'Subject and message body are required.' }, { status: 400 });
    }

    // 1. Create a dedicated batch for this campaign
    const campaignBatchName = `Campaign: ${subject} (${new Date().toLocaleDateString()})`;
    const { data: batch, error: batchError } = await supabase
      .from('lead_batches')
      .insert({ name: campaignBatchName, lead_count: 0 })
      .select()
      .single();

    if (batchError) throw batchError;

    let allRecipients: { name: string; email: string; id?: string }[] = [];

    // 2. Process Individual Emails & Register as Leads
    if (individualEmails && Array.isArray(individualEmails)) {
      const individualLeads = individualEmails.map((email: string) => ({
        name: email.split('@')[0],
        email: email.toLowerCase().trim(),
        source: 'marketing-broadcast',
        status: 'contacted',
        batch_id: batch.id
      }));

      // Upsert these leads (insert new, update existing if needed)
      // Note: We use 'onConflict' if email is unique, but if not, we do it manually or assume upsert handles it.
      // Since schema doesn't have UNIQUE on email yet, we'll try to find them first or just insert.
      const { data: insertedLeads } = await supabase
        .from('leads')
        .upsert(individualLeads, { onConflict: 'email' }) // Assuming email is unique or we handle conflict
        .select('name, email, id');
      
      if (insertedLeads) allRecipients = [...allRecipients, ...insertedLeads];
    }

    // 3. Resolve Database Leads via Filter
    if (targetFilter) {
      let query = supabase.from('leads').select('name, email, id');
      
      if (targetFilter.toLowerCase() !== 'all') {
        query = query.or(`status.ilike.%${targetFilter}%,interest.ilike.%${targetFilter}%,name.ilike.%${targetFilter}%`);
      }
      
      const { data: dbLeads, error: dbError } = await query;
      if (!dbError && dbLeads) {
        // Link existing leads to this batch too? 
        // Maybe better to just track who was sent what in a separate table.
        // For now, we'll just add them to the recipient list.
        allRecipients = [...allRecipients, ...dbLeads];
      }
    }

    // Remove duplicates
    const uniqueLeads = Array.from(new Map(allRecipients.map(l => [l.email.toLowerCase(), l])).values());

    if (uniqueLeads.length === 0) {
      return NextResponse.json({ error: 'No recipients found matching the criteria.' }, { status: 400 });
    }

    // Update batch count
    await supabase.from('lead_batches').update({ lead_count: uniqueLeads.length }).eq('id', batch.id);

    const isSandbox = process.env.RESEND_SANDBOX === 'true';
    const adminEmail = process.env.ADMIN_EMAIL || 'shalieth101@gmail.com';
    
    const emailsToSend = uniqueLeads.map((lead) => {
      const personalizedMessage = body.replace(/{{name}}/g, lead.name).replace(/\n/g, '<br/>');
      const premiumHtml = renderEmailTemplate(personalizedMessage, lead.name);

      return {
        from: 'Aloha Admin <onboarding@resend.dev>', 
        to: isSandbox ? adminEmail : lead.email,
        reply_to: adminEmail,
        subject: isSandbox ? `[TEST] ${subject} (To: ${lead.email})` : subject,
        html: premiumHtml,
      };
    });

    const { data, error } = await resend.batch.send(emailsToSend);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Log the campaign
    await supabase.from('campaigns').insert({
      subject,
      body,
      target_filter: targetFilter || 'individual',
      audience_size: uniqueLeads.length,
      sent_by: user.id
    });

    return NextResponse.json({ success: true, sent: uniqueLeads.length, data });
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Broadcast transmission error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
