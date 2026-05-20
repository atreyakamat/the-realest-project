'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';

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
