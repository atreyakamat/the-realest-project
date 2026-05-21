import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { sendMessage } from '@/services/messageService';

function addHours(date: Date, hours: number) {
  return new Date(date.getTime() + hours * 60 * 60 * 1000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function buildDripMessage(templateKey: string, leadName: string) {
  if (templateKey === 'intro') {
    return `Hi ${leadName}, thanks for your interest in EstateFlow listings. I can help you shortlist the best options today.`;
  }

  if (templateKey === 'day3_value') {
    return `Hi ${leadName}, quick follow-up. We have fresh listings and better-negotiated deals this week. Want me to share top matches?`;
  }

  return `Hi ${leadName}, checking in again. I can schedule a site visit and send options near your preferred location whenever you're ready.`;
}

export async function scheduleDefaultLeadDripSequence(args: {
  organizationId: string;
  leadId: string;
  leadCreatedAt?: string | null;
}) {
  const supabase = createSupabaseAdminClient();
  const baseDate = args.leadCreatedAt ? new Date(args.leadCreatedAt) : new Date();

  const sequence = [
    { stepNumber: 1, templateKey: 'intro', dueAt: addHours(baseDate, 2).toISOString() },
    { stepNumber: 2, templateKey: 'day3_value', dueAt: addDays(baseDate, 3).toISOString() },
    { stepNumber: 3, templateKey: 'day7_last_touch', dueAt: addDays(baseDate, 7).toISOString() },
  ];

  const { error } = await supabase.from('drip_sequences').insert(
    sequence.map((item) => ({
      organization_id: args.organizationId,
      lead_id: args.leadId,
      step_number: item.stepNumber,
      template_key: item.templateKey,
      channel: 'whatsapp',
      due_at: item.dueAt,
      status: 'pending',
    })),
  );

  if (error) throw error;
}

export async function runDueDripCampaigns(limit = 40) {
  const supabase = createSupabaseAdminClient();
  const dryRun = process.env.DRY_RUN === '1' || process.env.NODE_ENV !== 'production';

  const { data: due, error } = await supabase
    .from('drip_sequences')
    .select('id, organization_id, lead_id, step_number, template_key, due_at')
    .eq('status', 'pending')
    .lte('due_at', new Date().toISOString())
    .order('due_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  if (!due || due.length === 0) return { processed: 0 };

  let processed = 0;

  for (const item of due) {
    try {
      const { data: lead } = await supabase
        .from('leads')
        .select('id, full_name, phone, status, last_contacted_at')
        .eq('id', item.lead_id)
        .eq('organization_id', item.organization_id)
        .maybeSingle();

      if (!lead || !lead.phone) {
        await supabase.from('drip_sequences').update({ status: 'skipped' }).eq('id', item.id);
        continue;
      }

      const alreadyContacted = Boolean(lead.last_contacted_at) || (lead.status && lead.status !== 'New');
      if (alreadyContacted) {
        await supabase.from('drip_sequences').update({ status: 'skipped' }).eq('id', item.id);
        continue;
      }

      const body = buildDripMessage(item.template_key, lead.full_name ?? 'there');
      const provider = await sendMessage({
        to: lead.phone,
        body,
        channel: 'whatsapp',
        dryRun,
      });

      await supabase.from('messages').insert({
        organization_id: item.organization_id,
        lead_id: lead.id,
        sender_id: null,
        channel: 'whatsapp',
        body,
        provider_payload: { provider: 'twilio', providerResult: provider, drip_step: item.step_number },
      });

      await supabase.from('activities').insert({
        organization_id: item.organization_id,
        lead_id: lead.id,
        type: 'drip_message_sent',
        payload: { step_number: item.step_number, template_key: item.template_key, body },
      });

      await supabase
        .from('drip_sequences')
        .update({ status: 'sent', sent_at: new Date().toISOString(), provider_payload: provider })
        .eq('id', item.id);

      processed += 1;
    } catch (err) {
      await supabase
        .from('drip_sequences')
        .update({ status: 'failed', provider_payload: { error: err instanceof Error ? err.message : String(err) } })
        .eq('id', item.id);
    }
  }

  return { processed };
}
