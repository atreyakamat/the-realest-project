import { getDashboardMetrics, getLeads, getProperties } from './data';
import { createSupabaseServerClient } from './supabase-server';
import { computeLeaderboard } from './leaderboard';

export async function getReportsData(organizationId: string | null) {
  const [metrics, leads, properties] = await Promise.all([
    getDashboardMetrics(organizationId),
    getLeads(organizationId),
    getProperties(organizationId),
  ]);

  const sources = leads.reduce<Record<string, number>>((accumulator, lead) => {
    const source = lead.source ?? 'Manual';
    accumulator[source] = (accumulator[source] ?? 0) + 1;
    return accumulator;
  }, {});

  const statuses = leads.reduce<Record<string, number>>((accumulator, lead) => {
    const status = lead.status ?? 'New';
    accumulator[status] = (accumulator[status] ?? 0) + 1;
    return accumulator;
  }, {});

  const won = leads.filter((lead) => lead.status === 'Won').length;
  const lost = leads.filter((lead) => lead.status === 'Lost').length;

  let leaderboard: ReturnType<typeof computeLeaderboard> = [];

  if (organizationId) {
    const supabase = await createSupabaseServerClient();

    const [{ data: teamRows }, { data: profileRows }, { data: callRows }] = await Promise.all([
      supabase
        .from('team_members')
        .select('id, profile_id')
        .eq('organization_id', organizationId)
        .eq('is_active', true),
      supabase.from('profiles').select('id, full_name').eq('organization_id', organizationId),
      supabase.from('calls').select('lead_id, agent_id, started_at').eq('organization_id', organizationId),
    ]);

    const profileNameById = new Map((profileRows ?? []).map((profile) => [profile.id, profile.full_name ?? 'Agent']));

    const team = (teamRows ?? []).map((member) => ({
      id: member.id,
      name: member.profile_id ? profileNameById.get(member.profile_id) ?? 'Agent' : 'Agent',
    }));

    leaderboard = computeLeaderboard({
      leads,
      calls: (callRows ?? []) as Array<{ lead_id: string | null; agent_id: string | null; started_at: string | null }>,
      team,
    });
  }

  return {
    metrics,
    sources,
    statuses,
    won,
    lost,
    leaderboard,
    properties,
    leads,
  };
}
