import { Card, Badge } from '@/components/ui';
import { FollowupForm } from '@/components/followups/followup-form';
import { FollowupSender } from '@/components/followups/followup-sender';
import { getSessionUser } from '@/lib/auth';
import { getLeads } from '@/lib/data';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { updateFollowupStatusAction } from '../actions/followups';

export default async function FollowupsPage() {
  const user = await getSessionUser();
  const leads = await getLeads(user?.organizationId ?? null);
  const supabase = await createSupabaseServerClient();
  const { data: followups } = await supabase
    .from('followups')
    .select('id, lead_id, due_at, note, status, created_at, leads(full_name, phone)')
    .eq('organization_id', user?.organizationId ?? 'demo-org')
    .order('due_at', { ascending: true });

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Operations</p>
        <h1 className="text-3xl font-semibold text-white">Follow-ups</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Schedule next steps, keep your pipeline moving, and log reminders against each lead.</p>
      </header>

      <Card>
        <FollowupForm leads={leads} />
      </Card>

      <Card>
        <div className="mb-4 space-y-1">
          <h2 className="text-lg font-semibold text-white">One-click follow-up</h2>
          <p className="text-sm text-slate-400">Pick a lead, channel, and template, then send and log it instantly.</p>
        </div>
        <FollowupSender leads={leads} />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {(followups ?? []).map((item) => (
          <Card key={item.id} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-white">{(item as { leads?: { full_name?: string } }).leads?.full_name ?? 'Lead'}</h3>
                <p className="text-sm text-slate-400">Due {new Date(item.due_at).toLocaleString()}</p>
              </div>
              <Badge>{item.status}</Badge>
            </div>
            <p className="text-sm text-slate-300">{item.note}</p>
            <form action={updateFollowupStatusAction} className="flex gap-2">
              <input type="hidden" name="followupId" value={item.id} />
              <button name="status" value="open" className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">Open</button>
              <button name="status" value="completed" className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-2 text-sm text-emerald-200">Complete</button>
              <button name="status" value="snoozed" className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-2 text-sm text-amber-100">Snooze</button>
            </form>
          </Card>
        ))}
      </div>
    </div>
  );
}
