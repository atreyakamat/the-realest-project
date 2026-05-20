import { createSupabaseServerClient } from '../lib/supabase-server';

type AssignResult = { agentId: string | null };

export async function assignLeadRoundRobin(organizationId: string): Promise<AssignResult> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('team_members')
    .select('id,profile_id,last_assigned_at')
    .eq('organization_id', organizationId)
    .eq('role', 'Sales Agent')
    .eq('is_active', true)
    .order('last_assigned_at', { ascending: true, nullsFirst: true })
    .limit(1);

  if (error || !data || data.length === 0) {
    return { agentId: null };
  }

  const agent = data[0];
  await supabase.from('team_members').update({ last_assigned_at: new Date().toISOString() }).eq('id', agent.id);

  return { agentId: agent.id };
}
