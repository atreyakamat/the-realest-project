import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

const highlights = [
  { title: 'Browser-first dashboard', detail: 'A clean desktop view for owners, managers, and ops teams who want a full CRM in the browser.' },
  { title: 'Lead operations', detail: 'Manage calls, follow-ups, shares, and lead status from one web workspace.' },
  { title: 'Inventory and reports', detail: 'View properties, export data, and monitor performance from any modern browser.' },
  { title: 'Guided setup', detail: 'Use the onboarding checklist to launch new organizations without needing a technical admin.' },
];

export default function WebVersionPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-8 shadow-2xl shadow-black/20">
        <Badge className="bg-white/10 text-slate-200">Web version</Badge>
        <h1 className="mt-4 text-4xl font-semibold text-white">EstateFlow CRM in the browser</h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
          This is the polished web version of EstateFlow CRM for teams that want a desktop-friendly workspace with the same lead, property, follow-up, and reporting flows.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/login" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
            Sign in
          </Link>
          <Link href="/onboarding" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
            Start onboarding
          </Link>
          <Link href="/onboarding/checklist" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
            Open checklist
          </Link>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {highlights.map((item) => (
          <Card key={item.title} className="space-y-3">
            <h2 className="text-lg font-semibold text-white">{item.title}</h2>
            <p className="text-sm leading-6 text-slate-300">{item.detail}</p>
          </Card>
        ))}
      </div>

      <Card className="space-y-4">
        <h2 className="text-xl font-semibold text-white">What the web version includes</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {['Dashboard metrics', 'Lead management', 'Property inventory', 'Follow-up actions', 'Attendance tracking', 'Integrations and settings'].map((item) => (
            <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4 text-sm text-slate-300">
              {item}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}