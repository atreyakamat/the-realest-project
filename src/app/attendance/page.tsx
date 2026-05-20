import { AttendanceForm } from '@/components/attendance/attendance-form';
import { Card, Badge } from '@/components/ui';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function AttendancePage() {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  const { data: attendance } = await supabase
    .from('attendance')
    .select('id, status, check_in_time, check_out_time, notes, created_at')
    .eq('organization_id', user?.organizationId ?? 'demo-org')
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Field ops</p>
        <h1 className="text-3xl font-semibold text-white">Attendance</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Capture check-ins and check-outs with GPS and selfie proof from the field.</p>
      </header>

      <AttendanceForm />

      <div className="grid gap-3">
        {(attendance ?? []).map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-white">{new Date(entry.created_at).toLocaleString()}</h3>
              <p className="text-sm text-slate-400">{entry.notes ?? 'No notes recorded'}</p>
            </div>
            <Badge>{entry.status}</Badge>
          </Card>
        ))}
      </div>
    </div>
  );
}
