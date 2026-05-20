import { Card, Badge } from '../ui';

export function ReportsPanel({ sources, statuses, won, lost }: { sources: Record<string, number>; statuses: Record<string, number>; won: number; lost: number }) {
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
    </div>
  );
}
