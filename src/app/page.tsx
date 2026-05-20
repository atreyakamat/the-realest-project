import { getDashboardMetrics } from "@/lib/data";
import { Card } from "@/components/ui";
import { 
  Users, 
  Phone, 
  Calendar, 
  Flame, 
  MapPin, 
  Warehouse, 
  UserCheck, 
  Activity,
  Plus,
  Search
} from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const orgId = null; // In real app, get from auth session
  const stats = await getDashboardMetrics(orgId);

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">EstateFlow</h1>
          <p className="text-sm text-slate-400">Welcome back, Sales Manager</p>
        </div>
        <div className="flex gap-2">
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400">
            <Search className="h-5 w-5" />
          </button>
          <Link href="/leads/new" className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-400 text-slate-950">
            <Plus className="h-5 w-5" />
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4">
        <StatCard 
          label="New Leads" 
          value={stats.newLeadsToday} 
          icon={Users} 
          color="text-blue-400" 
          bg="bg-blue-400/10"
        />
        <StatCard 
          label="Calls Made" 
          value={stats.callsToday} 
          icon={Phone} 
          color="text-emerald-400" 
          bg="bg-emerald-400/10"
        />
        <StatCard 
          label="Follow-ups" 
          value={stats.followUpsDueToday} 
          icon={Calendar} 
          color="text-orange-400" 
          bg="bg-orange-400/10"
        />
        <StatCard 
          label="Hot Leads" 
          value={stats.hotLeads} 
          icon={Flame} 
          color="text-red-400" 
          bg="bg-red-400/10"
        />
      </div>

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

function StatCard({ label, value, icon: Icon, color, bg }: any) {
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
