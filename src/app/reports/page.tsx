import { Card } from '@/components/ui';
import { ReportsPanel } from '@/components/reports/reports-panel';
import { getSessionUser } from '@/lib/auth';
import { getReportsData } from '@/lib/report-data';

export default async function ReportsPage() {
  const user = await getSessionUser();
  const reportData = await getReportsData(user?.organizationId ?? null);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Insights</p>
        <h1 className="text-3xl font-semibold text-white">Reports</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Review pipeline health, source mix, and conversion performance from one place.</p>
      </header>

      <Card className="grid gap-4 md:grid-cols-4">
        <Metric label="New leads" value={reportData.metrics.newLeadsToday} />
        <Metric label="Follow-ups due" value={reportData.metrics.followUpsDueToday} />
        <Metric label="Hot leads" value={reportData.metrics.hotLeads} />
        <Metric label="Inventory" value={reportData.metrics.availableInventory} />
      </Card>

      <ReportsPanel
        sources={reportData.sources}
        statuses={reportData.statuses}
        won={reportData.won}
        lost={reportData.lost}
        leaderboard={reportData.leaderboard}
      />
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
    </div>
  );
}
