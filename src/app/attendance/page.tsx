import { AttendanceCheckIn } from "@/components/attendance/AttendanceCheckIn";
import { Card, Badge } from "@/components/ui";
import { Clock, MapPin, Calendar } from "lucide-react";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function AttendancePage() {
  const supabase = await createSupabaseServerClient();
  
  // Try to get real attendance from DB
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  const displayHistory = attendance && attendance.length > 0 
    ? attendance.map(a => ({
        id: a.id,
        date: new Date(a.created_at).toLocaleDateString(),
        in: a.check_in_time ? new Date(a.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        out: a.check_out_time ? new Date(a.check_out_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--',
        status: a.status || 'Present',
        location: a.check_in_latitude ? 'GPS' : 'Office'
      }))
    : [
        { id: '1', date: '20 May 2026', in: '09:15 AM', out: '06:30 PM', status: 'Present', location: 'Office' },
        { id: '2', date: '19 May 2026', in: '09:05 AM', out: '06:15 PM', status: 'Present', location: 'Field' },
        { id: '3', date: '18 May 2026', in: '09:30 AM', out: '06:45 PM', status: 'Late', location: 'Office' },
      ];

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="text-sm text-slate-400">Track your daily clock-in/out with GPS validation.</p>
      </header>

      <AttendanceCheckIn />

      <section className="space-y-4">
        <h3 className="font-bold text-white">Recent History</h3>
        <div className="space-y-3">
          {displayHistory.map((record) => (
            <Card key={record.id} className="p-4 bg-white/5 border-none">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-emerald-400" />
                  <span className="text-sm font-semibold text-white">{record.date}</span>
                </div>
                <Badge className={`h-5 px-1.5 text-[9px] ${
                  record.status === 'Present' ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
                }`}>
                  {record.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    In: {record.in}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Out: {record.out}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {record.location}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
