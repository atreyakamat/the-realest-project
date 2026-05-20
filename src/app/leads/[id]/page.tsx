import { getLeadById, getLeadTimeline, getProperties } from "@/lib/data";
import { Card, Badge } from "@/components/ui";
import { 
  ChevronLeft, 
  Building2, 
  History,
  Lightbulb,
  User,
  ArrowRight,
  Phone,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { LeadQuickActions } from "@/components/leads/LeadQuickActions";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await getLeadById(null, id);
  const timeline = await getLeadTimeline(id, null);
  const properties = await getProperties(null);

  if (!lead) return <div>Lead not found</div>;

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-4">
        <Link href="/leads" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-slate-400">
          <ChevronLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-bold">Lead Details</h1>
      </header>

      <Card className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-emerald-400 text-slate-950">
            <User className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{lead.full_name}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Badge className="bg-emerald-400/10 text-emerald-400 border-none px-1.5 py-0">{lead.status}</Badge>
              <span>•</span>
              <span>{lead.source}</span>
            </div>
          </div>
        </div>

        <LeadQuickActions leadId={lead.id} phone={lead.phone || ''} name={lead.full_name || ''} />
      </Card>

      <div className="grid grid-cols-1 gap-4">
        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold">
            <Building2 className="h-5 w-5 text-emerald-400" />
            Requirement
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <InfoCard label="Type" value={lead.property_type || 'N/A'} />
            <InfoCard label="Location" value={lead.preferred_location || 'N/A'} />
            <InfoCard label="Budget" value={`₹${((lead.budget_min || 0)/100000).toFixed(1)}L - ${((lead.budget_max || 0)/100000).toFixed(1)}L`} />
            <InfoCard label="Follow-up" value={lead.next_followup ? new Date(lead.next_followup).toLocaleDateString() : 'Not set'} />
          </div>
          {lead.notes && (
            <Card className="bg-white/5 border-none">
              <p className="text-sm text-slate-300 italic">&ldquo;{lead.notes}&rdquo;</p>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold">
            <Lightbulb className="h-5 w-5 text-emerald-400" />
            Recommended Properties
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {properties.slice(0, 3).map((prop) => (
              <Link key={prop.id} href={`/properties/${prop.id}`} className="min-w-[240px] shrink-0">
                <Card className="p-0 overflow-hidden bg-white/5 border-white/5">
                  <div className="aspect-video bg-slate-800 flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-slate-700" />
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold truncate text-sm">{prop.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{prop.location} • ₹{((prop.price || 0)/100000).toFixed(1)}L</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <h3 className="flex items-center gap-2 font-bold">
            <History className="h-5 w-5 text-emerald-400" />
            Timeline
          </h3>
          <div className="relative space-y-6 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-white/10">
            {timeline.map((event) => (
              <div key={event.id} className="relative flex gap-4 pl-10">
                <div className="absolute left-0 top-1.5 flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 ring-4 ring-slate-950">
                  <Badge className="p-0 border-none bg-emerald-400/20 text-emerald-400">
                    <ActivityIcon type={event.type} />
                  </Badge>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{event.type.replace(/_/g, ' ')}</p>
                  <p className="text-xs text-slate-400">
                    {typeof event.payload === 'object' && event.payload !== null && 'message' in event.payload 
                      ? (event.payload as { message: string }).message 
                      : JSON.stringify(event.payload)}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-500">{new Date(event.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

interface InfoCardProps {
  label: string;
  value: string;
}

function InfoCard({ label, value }: InfoCardProps) {
  return (
    <Card className="bg-white/5 border-none p-3">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
      <p className="text-sm font-semibold truncate">{value}</p>
    </Card>
  );
}

function ActivityIcon({ type }: { type: string }) {
  if (type.includes('call')) return <Phone className="h-3 w-3" />;
  if (type.includes('message')) return <MessageSquare className="h-3 w-3" />;
  return <ArrowRight className="h-3 w-3" />;
}
