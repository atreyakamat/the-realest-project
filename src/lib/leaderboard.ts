import type { LeadRecord } from '@/lib/estateflow-types';

type TeamMember = {
  id: string;
  name: string;
};

type CallRow = {
  lead_id: string | null;
  agent_id: string | null;
  started_at: string | null;
};

export type LeaderboardRow = {
  agentId: string;
  agentName: string;
  fastestResponseMinutes: number | null;
  siteVisits: number;
  wonDealValue: number;
  score: number;
};

export function computeLeaderboard(args: { leads: LeadRecord[]; calls: CallRow[]; team: TeamMember[] }) {
  const firstResponseByLead = new Map<string, { agentId: string; startedAt: Date }>();

  for (const call of args.calls) {
    if (!call.lead_id || !call.agent_id || !call.started_at) continue;

    const startedAt = new Date(call.started_at);
    const existing = firstResponseByLead.get(call.lead_id);

    if (!existing || startedAt < existing.startedAt) {
      firstResponseByLead.set(call.lead_id, { agentId: call.agent_id, startedAt });
    }
  }

  const responseTimesByAgent = new Map<string, number[]>();

  for (const lead of args.leads) {
    const first = firstResponseByLead.get(lead.id);
    if (!first || !lead.created_at) continue;

    const createdAt = new Date(lead.created_at);
    const diffMs = first.startedAt.getTime() - createdAt.getTime();
    const diffMinutes = Math.max(0, Math.round(diffMs / 60000));

    const list = responseTimesByAgent.get(first.agentId) ?? [];
    list.push(diffMinutes);
    responseTimesByAgent.set(first.agentId, list);
  }

  const siteVisitsByAgent = new Map<string, number>();
  const wonValueByAgent = new Map<string, number>();

  for (const lead of args.leads) {
    if (!lead.assigned_agent_id) continue;

    if (lead.status === 'Site Visit Scheduled') {
      siteVisitsByAgent.set(lead.assigned_agent_id, (siteVisitsByAgent.get(lead.assigned_agent_id) ?? 0) + 1);
    }

    if (lead.status === 'Won') {
      wonValueByAgent.set(lead.assigned_agent_id, (wonValueByAgent.get(lead.assigned_agent_id) ?? 0) + (lead.budget_max ?? 0));
    }
  }

  const rows: LeaderboardRow[] = args.team.map((member) => {
    const responseList = responseTimesByAgent.get(member.id) ?? [];
    const fastestResponseMinutes =
      responseList.length > 0 ? Math.round(responseList.reduce((sum, value) => sum + value, 0) / responseList.length) : null;

    const siteVisits = siteVisitsByAgent.get(member.id) ?? 0;
    const wonDealValue = wonValueByAgent.get(member.id) ?? 0;

    const responseScore = fastestResponseMinutes === null ? 0 : Math.max(0, 100 - fastestResponseMinutes);
    const visitScore = siteVisits * 8;
    const valueScore = Math.round(wonDealValue / 100000);

    return {
      agentId: member.id,
      agentName: member.name,
      fastestResponseMinutes,
      siteVisits,
      wonDealValue,
      score: responseScore + visitScore + valueScore,
    };
  });

  return rows.sort((a, b) => b.score - a.score);
}
