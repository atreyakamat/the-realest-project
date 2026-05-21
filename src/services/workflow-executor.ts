import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { bridgeCall } from '@/services/callService';
import { sendMessage } from '@/services/messageService';
import { sharePropertyWithLead } from '@/services/propertyShareService';
import { sendEmail } from '@/services/emailService';
import { getLeadWorkflowInsight } from '@/lib/workflow';
import type { LeadRecord, PropertyRecord } from '@/lib/estateflow-types';

export async function runWorkflowExecutor(limit = 20) {
  const supabase = createSupabaseAdminClient();

  const { data: pending, error } = await supabase
    .from('workflow_actions')
    .select('*')
    .eq('status', 'pending')
    .eq('dry_run', false)
    .limit(limit);

  if (error) throw error;
  if (!pending || pending.length === 0) return { processed: 0 };

  let processed = 0;

  for (const action of pending) {
    const id = action.id;
    const leadId = action.lead_id;
    const actionId = action.action_id;
    const actionPayload = action.action_payload;

    try {
      // Fetch lead record
      const { data: leadData, error: leadErr } = await supabase.from('leads').select('*').eq('id', leadId).single();
      if (leadErr || !leadData) throw new Error(leadErr?.message || 'Lead not found');
      const lead: LeadRecord = leadData as any;

      // Fetch inventory to compute matches when needed
      const { data: propsData } = await supabase.from('properties').select('*').limit(50);
      const properties: PropertyRecord[] = (propsData || []) as any;

      let result: any = { ok: true, notes: [] };

      if (actionId === 'call_now') {
        // attempt to bridge a call using Twilio (callService)
        const agentPhone = process.env.TWILIO_PHONE_NUMBER ?? '';
        const leadPhone = (lead.phone ?? '') as string;
        if (!agentPhone || !leadPhone) throw new Error('Missing phone numbers for call');

        const callRes = await bridgeCall({ agentPhone, leadPhone, leadId, dryRun: false, organizationId: '' });
        result.call = callRes;
      } else if (actionId === 'send_matches') {
        // compute top matches and share via propertyShareService + send a notification
        const insight = getLeadWorkflowInsight(lead, properties);
        const matches = insight.propertyMatches || [];
        result.shared = [];
        for (const m of matches.slice(0, 3)) {
          try {
            await sharePropertyWithLead({ organizationId: '', actorId: 'system', leadId: lead.id, propertyId: m.property.id, channel: 'whatsapp' });
            result.shared.push({ propertyId: m.property.id, ok: true });
          } catch (err: any) {
            result.shared.push({ propertyId: m.property.id, ok: false, error: err.message ?? String(err) });
          }
        }

        // Send a followup message to lead summarizing the shortlist
        const leadPhone = (lead.phone ?? '') as string;
        if (leadPhone) {
          const body = `Hi ${lead.full_name ?? ''}, we've shared a shortlist of properties. Reply to this message to schedule a visit.`;
          await sendMessage({ to: leadPhone, body, channel: 'whatsapp', dryRun: false });
          result.notification = 'sent';
        }
      } else if (actionId === 'book_visit') {
        // Send a message to lead to propose visit slots
        const leadPhone = (lead.phone ?? '') as string;
        if (leadPhone) {
          const body = `Hi ${lead.full_name ?? ''}, please pick a convenient time for a site visit and we'll confirm.`;
          await sendMessage({ to: leadPhone, body, channel: 'sms', dryRun: false });
          result.notification = 'sent';
        }
      } else if (actionId === 'manager_review') {
        // Email the manager/ops team for review
        const managerEmail = process.env.MANAGER_EMAIL ?? '';
        if (managerEmail) {
          await sendEmail({ to: managerEmail, subject: `Lead ${lead.full_name} requires review`, html: `<p>Please review lead ${lead.full_name} (ID: ${lead.id}).</p>` });
          result.notification = 'emailed_manager';
        } else {
          result.notification = 'no_manager_email_configured';
        }
      } else if (actionId === 'nurture') {
        // Add a note — maybe send a weekly newsletter opt-in
        result.note = 'moved to nurture list';
      }

      // mark as executed
      await supabase
        .from('workflow_actions')
        .update({ status: 'executed', result: result, executed_at: new Date().toISOString() })
        .eq('id', id);

      processed += 1;
    } catch (err: any) {
      // mark as failed with error details
      await supabase
        .from('workflow_actions')
        .update({ status: 'failed', result: { error: err.message ?? String(err) }, executed_at: new Date().toISOString() })
        .eq('id', action.id);
    }
  }

  return { processed };
}
