import { Badge, Card } from '@/components/ui';
import type { LeadRecord, PropertyRecord } from '@/lib/estateflow-types';
import { getLeadWorkflowInsight } from '@/lib/workflow';
import Link from 'next/link';
import { ArrowRight, Target, Zap } from 'lucide-react';

type Props = {
  lead: LeadRecord;
  properties: PropertyRecord[];
};

export function LeadWorkflowPanel({ lead, properties }: Props) {
  const insight = getLeadWorkflowInsight(lead, properties);

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <Zap className="h-5 w-5 text-emerald-400" />
        <h3 className="font-bold">Optimized workflow</h3>
      </div>

      <Card className="space-y-4 border-emerald-400/10 bg-emerald-400/5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge className="border-none bg-emerald-400/20 text-emerald-300">{insight.priority} priority</Badge>
          <Badge className="border-none bg-white/10 text-slate-200">{insight.nextAction.label}</Badge>
        </div>

        <div className="space-y-1">
          <p className="text-sm text-slate-300">{insight.nextAction.description}</p>
          <p className="text-xs text-slate-400">{insight.reason}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <Target className="h-4 w-4 text-emerald-400" />
            Best matches
          </div>

          {insight.propertyMatches.length > 0 ? (
            <div className="mt-3 space-y-3">
              {insight.propertyMatches.map(({ property, score, reasons }) => (
                <Link
                  key={property.id}
                  href={`/properties/${property.id}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-3 transition hover:bg-white/10"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white">{property.title}</p>
                      <p className="text-xs text-slate-400">
                        {property.location ?? 'Location unavailable'} • {property.property_type ?? 'Property'} • ₹
                        {property.price?.toLocaleString() ?? 'N/A'}
                      </p>
                    </div>
                    <Badge className="border-none bg-emerald-400/15 text-emerald-300">{score}/100</Badge>
                  </div>
                  {reasons.length > 0 ? <p className="mt-2 text-xs text-slate-400">{reasons[0]}</p> : null}
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-400">No strong inventory match yet. Save the lead and revisit after updating properties.</p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/leads/new"
            className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950"
          >
            Create new lead
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </Card>
    </section>
  );
}
