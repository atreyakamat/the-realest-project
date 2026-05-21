import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import { transcribeAndAnalyzeCall } from '@/services/aiService';

export async function processCallRecording(args: {
  organizationId: string;
  callSid: string;
  recordingUrl: string;
  recordingDuration?: number | null;
}) {
  const supabase = createSupabaseAdminClient();
  const { organizationId, callSid, recordingUrl, recordingDuration = null } = args;

  const { data: call } = await supabase
    .from('calls')
    .select('id, lead_id, organization_id, call_sid')
    .eq('organization_id', organizationId)
    .eq('call_sid', callSid)
    .maybeSingle();

  const insight = await transcribeAndAnalyzeCall(recordingUrl);

  if (call?.id) {
    await supabase
      .from('calls')
      .update({
        recording_url: recordingUrl,
        duration: recordingDuration,
        status: 'completed',
        outcome: `sentiment:${insight.sentiment}`,
        ended_at: new Date().toISOString(),
      })
      .eq('id', call.id);
  }

  const leadId = call?.lead_id ?? null;

  await supabase.from('call_ai_insights').insert({
    organization_id: organizationId,
    call_id: call?.id ?? null,
    lead_id: leadId,
    call_sid: callSid,
    transcript: insight.transcript,
    summary: insight.summary,
    sentiment: insight.sentiment,
    follow_up_tasks: insight.followUpTasks,
    raw_analysis: insight.raw,
  });

  if (leadId) {
    await supabase.from('activities').insert({
      organization_id: organizationId,
      lead_id: leadId,
      type: 'meeting_summary',
      payload: {
        call_sid: callSid,
        sentiment: insight.sentiment,
        summary: insight.summary,
        follow_up_tasks: insight.followUpTasks,
      },
    });

    if (insight.followUpTasks.length > 0) {
      await supabase.from('tasks').insert(
        insight.followUpTasks.map((task) => ({
          organization_id: organizationId,
          title: `Follow-up: ${task}`,
          payload: { lead_id: leadId, source: 'call_ai', call_sid: callSid },
          status: 'open',
        })),
      );
    }
  }

  return {
    leadId,
    sentiment: insight.sentiment,
    summary: insight.summary,
    tasksCreated: insight.followUpTasks.length,
  };
}
