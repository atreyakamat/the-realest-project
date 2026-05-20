import { getLeads } from "@/lib/data";
import { Card, Badge, Input } from "@/components/ui";
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Flame,
  User
} from "lucide-react";
import Link from "next/link";

export default async function LeadsPage() {
  const leads = await getLeads(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Leads</h1>
          <Badge className="bg-emerald-400/10 text-emerald-400">{leads.length} Total</Badge>
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <Input placeholder="Search leads..." className="pl-10" />
          </div>
          <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-400">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="space-y-3">
        {leads.map((lead) => (
          <Link key={lead.id} href={`/leads/${lead.id}`}>
            <Card className="flex items-center gap-4 p-4 active:scale-[0.98] transition-transform">
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-slate-400">
                  <User className="h-6 w-6" />
                </div>
                {lead.temperature === 'Hot' && (
                  <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white ring-2 ring-slate-950">
                    <Flame className="h-3 w-3" />
                  </div>
                )}
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="truncate font-semibold">{lead.full_name}</h3>
                  <span className="text-[10px] text-slate-500">{new Date(lead.created_at).toLocaleDateString()}</span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <Badge className="h-5 px-1.5 text-[9px] lowercase bg-white/5 border-none">{lead.status}</Badge>
                  <p className="truncate text-xs text-slate-400">{lead.property_type} • {lead.preferred_location}</p>
                </div>
              </div>

              <ChevronRight className="h-5 w-5 text-slate-600" />
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex justify-center pb-8">
        <button className="text-sm font-medium text-slate-500">Load More Leads</button>
      </div>
    </div>
  );
}
