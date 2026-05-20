import { getLeads } from "@/lib/data";
import { Card, Badge } from "@/components/ui";
import { 
  Clock, 
  User, 
  Phone,
  MessageSquare
} from "lucide-react";
import Link from "next/link";

interface FollowupItem {
  id: string;
  name: string;
  due: string | null;
  status: string;
  phone: string;
}

export default async function FollowupsPage() {
  const leads = await getLeads(null);
  const followups: FollowupItem[] = leads
    .filter(l => l.next_followup)
    .map(l => ({
      id: l.id,
      name: l.full_name || 'Unknown',
      due: l.next_followup,
      status: l.status || 'New',
      phone: l.phone || ''
    }))
    .sort((a, b) => new Date(a.due!).getTime() - new Date(b.due!).getTime());

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Follow-ups</h1>
        <p className="text-sm text-slate-400">Don&apos;t miss a connection today</p>
      </header>

      <section className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Today</h3>
          <div className="space-y-3">
            {followups.map((item) => (
              <Card key={item.id} className="p-4 bg-white/5 border-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-slate-400">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                        <Clock className="h-3 w-3" />
                        {new Date(item.due!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                  <Badge className="h-5 px-1.5 text-[9px] bg-white/5 border-none">{item.status}</Badge>
                </div>
                
                <div className="flex gap-2">
                  <Link href={`/leads/${item.id}`} className="flex-1">
                    <button className="w-full flex h-10 items-center justify-center rounded-xl bg-white/5 text-xs font-bold text-slate-300 hover:bg-white/10">
                      View Profile
                    </button>
                  </Link>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400 text-slate-950">
                    <Phone className="h-4 w-4" />
                  </button>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-500 text-white">
                    <MessageSquare className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
