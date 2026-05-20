'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';
import { sendMessage } from '../../services/messageService';
import { sendEmail } from '../../services/emailService';

const followupSchema = z.object({
  leadId: z.string().min(1),
  note: z.string().min(2),
  dueAt: z.string().min(1),
});

export async function createFollowupAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const parsed = followupSchema.safeParse({
    leadId: formData.get('leadId'),
    note: formData.get('note'),
    dueAt: formData.get('dueAt'),
  });

  if (!parsed.success) {
    return { message: '', error: 'Please choose a lead, note, and due date.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('followups').insert({
    organization_id: user.organizationId,
    lead_id: parsed.data.leadId,
    created_by: user.id,
    due_at: parsed.data.dueAt,
    note: parsed.data.note,
    status: 'pending',
  });

  if (error) {
    return { message: '', error: error.message };
  }

  await supabase.from('notifications').insert({
    organization_id: user.organizationId,
    user_id: user.id,
    type: 'followup_due',
    payload: { lead_id: parsed.data.leadId, due_at: parsed.data.dueAt },
  });

  revalidatePath('/followups');
  revalidatePath('/dashboard');

  return { message: 'Follow-up scheduled.', error: '' };
}

export async function updateFollowupStatusAction(formData: FormData): Promise<void> {
  const user = await requireSessionUser();
  const followupId = String(formData.get('followupId') ?? '');
  const status = String(formData.get('status') ?? 'pending');
  const supabase = await createSupabaseServerClient();

  if (!followupId) return;

  await supabase
    .from('followups')
    .update({ status, updated_at: new Date().toISOString() } as never)
    .eq('id', followupId)
    .eq('organization_id', user.organizationId);

  revalidatePath('/followups');
}

const sendSchema = z.object({
  leadId: z.string().min(1),
  channel: z.enum(['whatsapp', 'sms', 'email']),
  template: z.enum(['review', 'call', 'new_options']),
});

function buildTemplateMessage(template: z.infer<typeof sendSchema>['template'], leadName: string, preferredLocation: string | null) {
  if (template === 'call') {
    return `Hi ${leadName}, are you available for a quick call today to discuss properties in ${preferredLocation ?? 'your preferred area'}?`;
  }

  if (template === 'new_options') {
    return `Hi ${leadName}, we have a few new options matching your budget. Should I share them?`;
  }

  return `Hi ${leadName}, just checking if you had a chance to review the property details I shared.`;
}

export async function sendFollowupMessageAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const parsed = sendSchema.safeParse({
    leadId: formData.get('leadId'),
    channel: formData.get('channel'),
    template: formData.get('template'),
  });

  if (!parsed.success) {
    return { message: '', error: 'Please choose a lead, channel, and template.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: lead } = await supabase
    .from('leads')
    .select('id, full_name, phone, email, preferred_location')
    .eq('id', parsed.data.leadId)
    .eq('organization_id', user.organizationId)
    .single();

  if (!lead) {
    return { message: '', error: 'Lead not found.' };
  }

  const body = buildTemplateMessage(parsed.data.template, lead.full_name, lead.preferred_location);
  const dryRun = process.env.DRY_RUN === '1' || process.env.NODE_ENV !== 'production';
  let providerPayload: Record<string, unknown> = {};

  try {
    if (parsed.data.channel === 'email') {
      if (!lead.email) {
        return { message: '', error: 'This lead does not have an email address.' };
      }

      const result = await sendEmail({
        to: lead.email,
        subject: `EstateFlow follow-up for ${lead.full_name}`,
        text: body,
        dryRun,
      });

      providerPayload = { provider: 'resend', result };
    } else {
      const result = await sendMessage({
        to: lead.phone,
        body,
        channel: parsed.data.channel,
        dryRun,
      });

      providerPayload = { provider: 'twilio', result };
    }

    await supabase.from('messages').insert({
      organization_id: user.organizationId,
      lead_id: lead.id,
      sender_id: user.id,
      channel: parsed.data.channel,
      body,
      provider_payload: providerPayload,
    });

    await supabase.from('activities').insert({
      organization_id: user.organizationId,
      lead_id: lead.id,
      actor_id: user.id,
      type: 'followup_sent',
      payload: { channel: parsed.data.channel, template: parsed.data.template, body },
    });

    revalidatePath('/followups');
    revalidatePath(`/leads/${lead.id}`);

    return { message: 'Follow-up sent and logged.', error: '' };
  } catch (error) {
    return { message: '', error: error instanceof Error ? error.message : 'Unable to send follow-up.' };
  }
}
