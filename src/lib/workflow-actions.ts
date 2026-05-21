import { createSupabaseAdminClient } from '@/lib/supabase-admin';

type RecordArgs = {
  leadId: string;
  actionId: string;
  actionPayload?: unknown;
  dryRun?: boolean;
  executedBy?: string | null;
};

export async function recordWorkflowAction({ leadId, actionId, actionPayload = null, dryRun = true, executedBy = null }: RecordArgs) {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from('workflow_actions')
    .insert({
      lead_id: leadId,
      action_id: actionId,
      action_payload: actionPayload,
      dry_run: dryRun,
      executed_by: executedBy,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
