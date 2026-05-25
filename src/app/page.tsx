import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import { Activity, Calendar, Flame, MapPin, Phone, Plus, Search, UserCheck, Users, Warehouse, Download } from 'lucide-react';
import { Card, Badge } from '@/components/ui';
import { PerformanceChart } from '@/components/dashboard/performance-chart';
import { getDashboardMetrics, getLeads, getProperties } from '@/lib/data';
import { getWorkflowQueue } from '@/lib/workflow';
import { ExportButton } from '@/components/export-button';

export default async function DashboardPage() {
  const orgId = null;
  const stats = await getDashboardMetrics(orgId);
  const [leads, properties] = await Promise.all([getLeads(orgId), getProperties(orgId)]);
  const queue = getWorkflowQueue(leads, properties, 3);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">EstateFlow</h1>
          <p className="text-sm text-slate-400">Welcome back, Sales Manager</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
            <ExportButton dataType="leads" />
            <ExportButton dataType="calls" />
            <ExportButton dataType="attendance" />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400">
              <Search className="h-5 w-5" />
            </button>
            <Link href="/leads/new" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="New Leads" value={stats.newLeadsToday} icon={Users} color="text-blue-400" bg="bg-blue-400/10" />
        <StatCard label="Calls Made" value={stats.callsToday} icon={Phone} color="text-emerald-400" bg="bg-emerald-400/10" />
        <StatCard label="Follow-ups" value={stats.followUpsDueToday} icon={Calendar} color="text-orange-400" bg="bg-orange-400/10" />
        <StatCard label="Hot Leads" value={stats.hotLeads} icon={Flame} color="text-red-400" bg="bg-red-400/10" />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Priority workflow</h2>
          <Badge className="bg-emerald-400/10 text-emerald-300">{queue.length} active</Badge>
        </div>
        <div className="grid gap-3">
          {queue.map(({ lead, priorityScore, nextAction, propertyMatches }) => {
            const bestMatch = propertyMatches[0];

            return (
              <Card key={lead.id} className="space-y-3 border-white/5 bg-white/5 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{lead.full_name}</p>
                    <p className="text-xs text-slate-400">
                      {lead.status ?? 'New'} • {lead.temperature ?? 'Warm'}
                    </p>
                  </div>
                  <Badge className="border-none bg-emerald-400/15 text-emerald-300">{priorityScore}/100</Badge>
                </div>

                <p className="text-sm text-slate-300">{nextAction.label}</p>
                <p className="text-xs text-slate-400">{nextAction.description}</p>

                {bestMatch ? (
                  <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Best match</p>
                    <p className="mt-1 text-sm font-semibold text-white">{bestMatch.property.title}</p>
                    <p className="text-xs text-slate-400">
                      {bestMatch.property.location ?? 'Location unavailable'} • ₹
                      {bestMatch.property.price?.toLocaleString() ?? 'N/A'}
                    </p>
                  </div>
                ) : null}
              </Card>
            );
          })}
        </div>
      </section>

      <PerformanceChart />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-400/10 text-purple-400">
            <MapPin className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Site Visits</p>
            <p className="text-lg font-bold">{stats.siteVisitsScheduled}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-400/10 text-indigo-400">
            <Warehouse className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Inventory</p>
            <p className="text-lg font-bold">{stats.availableInventory}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-pink-400/10 text-pink-400">
            <UserCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Present</p>
            <p className="text-lg font-bold">{stats.attendancePresent}</p>
          </div>
        </Card>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Recent Activity</h2>
          <button className="text-xs font-semibold text-emerald-400">View All</button>
        </div>
        <div className="space-y-3">
          {stats.recentActivity.slice(0, 5).map((activity) => (
            <div key={activity.id} className="flex gap-4 rounded-[1.5rem] bg-white/5 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-slate-400">
                <Activity className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{formatActivityMessage(activity.payload, activity.type)}</p>
                <p className="text-[11px] text-slate-500">{new Date(activity.created_at).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: string;
  bg: string;
}

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${bg} ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
    </Card>
  );
}

function formatActivityMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === 'object' && 'message' in payload && typeof (payload as { message?: unknown }).message === 'string') {
    return (payload as { message: string }).message;
  }

  return fallback;
}
