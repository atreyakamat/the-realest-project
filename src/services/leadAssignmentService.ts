import { createSupabaseServerClient } from '../lib/supabase-server';

type AssignResult = { agentId: string | null };

export type AgentCandidate = {
  teamMemberId: string;
  profileId: string | null;
  phone: string | null;
};

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

export async function getAvailableSalesAgentCandidates(organizationId: string): Promise<AgentCandidate[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from('team_members')
    .select('id, profile_id')
    .eq('organization_id', organizationId)
    .eq('role', 'Sales Agent')
    .eq('is_active', true)
    .order('last_assigned_at', { ascending: true, nullsFirst: true });

  if (error || !data) return [];

  const profileIds = data.map((item) => item.profile_id).filter(Boolean) as string[];
  const { data: profiles } = profileIds.length
    ? await supabase.from('profiles').select('id, phone').in('id', profileIds)
    : { data: [] as Array<{ id: string; phone: string | null }> };

  const phoneMap = new Map((profiles ?? []).map((profile) => [profile.id, profile.phone]));

  return data.map((member) => ({
    teamMemberId: member.id,
    profileId: member.profile_id,
    phone: member.profile_id ? phoneMap.get(member.profile_id) ?? null : null,
  }));
}

