import { LeadComposer } from '@/components/leads/lead-composer';
import { Card } from '@/components/ui';

export default function NewLeadPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Leads</p>
        <h1 className="text-3xl font-semibold text-white">Create lead</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Capture a new lead and assign the right next step immediately.</p>
      </header>

      <Card>
        <LeadComposer />
      </Card>
    </div>
  );
}
