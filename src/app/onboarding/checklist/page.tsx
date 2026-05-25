import Link from 'next/link';
import { CheckCircle2, Printer, ArrowLeft } from 'lucide-react';

const checklistSections = [
  {
    title: 'Before onboarding',
    items: [
      'Decide the business name and organization owner.',
      'Collect admin email, phone, and team member details.',
      'Prepare Twilio, email, and optional AI keys.',
      'Choose the lead sources that apply to your business.',
    ],
  },
  {
    title: 'During onboarding',
    items: [
      'Enter company details and admin contact.',
      'Invite the sales manager, agents, field team, and social manager.',
      'Add the integration URLs or keys you already have.',
      'Select the lead sources you want to track first.',
    ],
  },
  {
    title: 'After launch',
    items: [
      'Create the first test lead from the CRM or webhook.',
      'Check that call bridge, messages, and notifications work in demo mode.',
      'Share one property with a test lead.',
      'Export one report and confirm the CSV downloads.',
    ],
  },
];

export default function OnboardingChecklistPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8 print:px-0 print:py-0">
      <style>{`@media print { .no-print { display: none !important; } body { background: white !important; color: black !important; } }`}</style>
      <div className="no-print mb-6 flex flex-wrap items-center justify-between gap-3">
        <Link href="/onboarding" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
          <ArrowLeft className="h-4 w-4" />
          Back to onboarding
        </Link>
        <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
          <Printer className="h-4 w-4" />
          Print checklist
        </button>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl shadow-black/20 print:border-black print:bg-white print:p-0">
        <div className="border-b border-white/10 pb-5 print:border-black">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400 print:text-slate-600">EstateFlow CRM</p>
          <h1 className="mt-2 text-3xl font-semibold text-white print:text-black">Onboarding checklist</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300 print:text-slate-700">
            Use this checklist when you set up a new organization so the CRM is ready for leads, calls, property sharing, follow-ups, and reporting.
          </p>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {checklistSections.map((section) => (
            <section key={section.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 print:border-black print:bg-white">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 print:text-black" />
                <h2 className="text-lg font-semibold text-white print:text-black">{section.title}</h2>
              </div>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300 print:text-slate-800">
                {section.items.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-300 print:bg-black" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/5 p-5 print:border-black print:bg-white">
          <p className="text-sm leading-6 text-slate-300 print:text-slate-800">
            Tip: if you do not have every integration key yet, complete onboarding with the essentials first. EstateFlow can still run in demo mode while your team finishes setup.
          </p>
        </div>
      </div>
    </div>
  );
}