import { NextResponse } from 'next/server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';
import type { LeadRecord } from '@/lib/estateflow-types';
import { computeLeaderboard } from '@/lib/leaderboard';
import { sendEmail } from '@/services/emailService';

export async function POST() {
  try {
    const supabase = createSupabaseAdminClient();
    const dryRun = process.env.DRY_RUN === '1' || process.env.NODE_ENV !== 'production';

    const { data: orgs } = await supabase.from('organizations').select('id, name').limit(50);
    if (!orgs || orgs.length === 0) {
      return NextResponse.json({ ok: true, processed: 0 });
    }

    let processed = 0;

    for (const org of orgs) {
      const [{ data: leads }, { data: calls }, { data: teamRows }, { data: profileRows }] = await Promise.all([
        supabase
          .from('leads')
          .select('*')
          .eq('organization_id', org.id),
        supabase.from('calls').select('lead_id, agent_id, started_at').eq('organization_id', org.id),
        supabase.from('team_members').select('id, profile_id').eq('organization_id', org.id).eq('is_active', true),
        supabase.from('profiles').select('id, full_name, email, role').eq('organization_id', org.id),
      ]);

      const profileById = new Map((profileRows ?? []).map((profile) => [profile.id, profile]));
      const team = (teamRows ?? []).map((member) => ({
        id: member.id,
        name: member.profile_id ? profileById.get(member.profile_id)?.full_name ?? 'Agent' : 'Agent',
      }));

      const leaderboard = computeLeaderboard({
        leads: (leads ?? []) as LeadRecord[],
        calls: (calls ?? []) as Array<{ lead_id: string | null; agent_id: string | null; started_at: string | null }>,
        team,
      });

      if (leaderboard.length === 0) continue;

      const winner = leaderboard[0];
      const recipients = (profileRows ?? [])
        .filter((profile) => Boolean(profile.email))
        .map((profile) => profile.email as string);

      if (recipients.length === 0) continue;

      const html = `
        <h2>Weekly Wins: ${org.name}</h2>
        <p><strong>Top closer:</strong> ${winner.agentName}</p>
        <p>Fastest response: ${winner.fastestResponseMinutes ?? 'N/A'} minutes</p>
        <p>Site visits: ${winner.siteVisits}</p>
        <p>Won deal value: ₹${(winner.wonDealValue / 100000).toFixed(1)}L</p>
      `;

      await sendEmail({
        to: recipients,
        subject: `EstateFlow Weekly Wins - ${winner.agentName}`,
        html,
        text: `Top closer this week: ${winner.agentName}`,
        dryRun,
      });

      processed += 1;
    }

    return NextResponse.json({ ok: true, processed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to run weekly wins cron' },
      { status: 500 },
    );
  }
}
