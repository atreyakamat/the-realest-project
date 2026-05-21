import { Card, Badge } from '../ui';
import type { LeaderboardRow } from '@/lib/leaderboard';

export function ReportsPanel({
  sources,
  statuses,
  won,
  lost,
  leaderboard,
}: {
  sources: Record<string, number>;
  statuses: Record<string, number>;
  won: number;
  lost: number;
  leaderboard: LeaderboardRow[];
}) {
  const topCloser = leaderboard[0] ?? null;

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <Badge>Leads by source</Badge>
        <div className="mt-4 space-y-3">
          {Object.entries(sources).map(([source, count]) => (
            <div key={source} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <span className="text-sm text-slate-200">{source}</span>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Badge>Leads by status</Badge>
        <div className="mt-4 space-y-3">
          {Object.entries(statuses).map(([status, count]) => (
            <div key={status} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
              <span className="text-sm text-slate-200">{status}</span>
              <span className="text-sm font-semibold text-white">{count}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <Badge>Won / lost</Badge>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
            <p className="text-sm text-emerald-100">Won</p>
            <p className="mt-1 text-3xl font-semibold text-white">{won}</p>
          </div>
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4">
            <p className="text-sm text-rose-100">Lost</p>
            <p className="mt-1 text-3xl font-semibold text-white">{lost}</p>
          </div>
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between gap-3">
          <Badge>Top closer leaderboard</Badge>
          {topCloser ? <span className="text-xs text-emerald-300">Weekly leader: {topCloser.agentName}</span> : null}
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-200">
            <thead className="text-xs uppercase tracking-[0.18em] text-slate-400">
              <tr>
                <th className="px-3 py-2">Agent</th>
                <th className="px-3 py-2">Fastest response</th>
                <th className="px-3 py-2">Site visits</th>
                <th className="px-3 py-2">Won value</th>
                <th className="px-3 py-2">Score</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((row, index) => (
                <tr key={row.agentId} className="border-t border-white/10">
                  <td className="px-3 py-3 font-medium text-white">
                    #{index + 1} {row.agentName}
                  </td>
                  <td className="px-3 py-3">{row.fastestResponseMinutes === null ? 'N/A' : `${row.fastestResponseMinutes} min`}</td>
                  <td className="px-3 py-3">{row.siteVisits}</td>
                  <td className="px-3 py-3">₹{(row.wonDealValue / 100000).toFixed(1)}L</td>
                  <td className="px-3 py-3 font-semibold text-emerald-300">{row.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {leaderboard.length === 0 ? <p className="px-3 py-4 text-sm text-slate-400">No active team members or performance records yet.</p> : null}
        </div>
      </Card>
    </div>
  );
}
