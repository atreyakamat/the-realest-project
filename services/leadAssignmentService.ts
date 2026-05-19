import supabaseServer from '../lib/supabaseServer';

type AssignResult = { agentId: string | null };

export async function assignLeadRoundRobin(organizationId: string) : Promise<AssignResult> {
  // Find active sales agents ordered by last_assigned_at ASC (least recently assigned first)
  const { data: agents, error } = await supabaseServer
    .from('team_members')
    .select('id,profile_id,last_assigned_at')
    .eq('organization_id', organizationId)
    .eq('role', 'Sales Agent')
    .eq('is_active', true)
    .order('last_assigned_at', { ascending: true, nullsFirst: true })
    .limit(1);

  if (error) {
    console.error('assignLeadRoundRobin error', error);
    return { agentId: null };
  }

  if (!agents || agents.length === 0) return { agentId: null };

  const agent = agents[0] as any;

  // update last_assigned_at
  await supabaseServer
    .from('team_members')
    .update({ last_assigned_at: new Date().toISOString() })
    .eq('id', agent.id);

  return { agentId: agent.id };
}

export default { assignLeadRoundRobin };
