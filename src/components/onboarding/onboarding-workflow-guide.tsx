'use client';

import Link from 'next/link';
import { CheckCircle2, PlugZap, ShieldCheck, UserRoundPlus } from 'lucide-react';

const steps = [
  {
    title: '1. Tell us about the business',
    description: 'Enter the company name, industry, and the main admin contact so the CRM knows who owns the workspace.',
  },
  {
    title: '2. Invite your team',
    description: 'Add sales managers, agents, field staff, and social media managers before you hand the CRM over.',
  },
  {
    title: '3. Add lead sources',
    description: 'Pick where leads come from: 36 Acre, MagicBricks, Housing.com, Facebook, Instagram, website forms, referrals, or manual entry.',
  },
  {
    title: '4. Connect tools',
    description: 'Add Twilio, email, AI, and webhook keys so calls, messages, and follow-ups can run automatically.',
  },
  {
    title: '5. Review and launch',
    description: 'Confirm the setup, then go to the dashboard with a ready-to-use CRM shell and demo data if needed.',
  },
];

const prepItems = [
  'Business name and admin email',
  'Sales team emails and phone numbers',
  'Twilio / WhatsApp / Resend API keys',
  'Webhook secret for lead sources',
  'Optional: Google, Slack, Zapier, or Make account details',
];

const backendEffects = [
  'Creates the organization record',
  'Updates the admin profile with organization access',
  'Stores API keys in integration settings',
  'Creates lead source rows for reporting and import rules',
  'Invites teammates to the workspace',
];

export function OnboardingWorkflowGuide() {
  return (
    <section className="mx-auto max-w-5xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[1.75rem] border border-white/10 bg-white/5 p-5 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-400/15 p-3 text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Onboarding workflow</p>
              <h2 className="text-xl font-semibold text-white">A simple setup path for a layman user</h2>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            {steps.map((step) => (
              <div key={step.title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="font-semibold text-white">{step.title}</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <UserRoundPlus className="h-5 w-5 text-sky-300" />
              <h3 className="text-base font-semibold text-white">What to keep ready</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {prepItems.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <PlugZap className="h-5 w-5 text-amber-300" />
              <h3 className="text-base font-semibold text-white">What happens in the backend</h3>
            </div>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              {backendEffects.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-amber-300" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-5 shadow-2xl shadow-black/20">
            <div className="flex items-center gap-3">
              <ShieldCheck className="h-5 w-5 text-emerald-300" />
              <h3 className="text-base font-semibold text-white">Recommended launch order</h3>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              Start with login, organization setup, lead sources, and Twilio. Then add email, Google tools, and automation platforms once the core team is comfortable.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link href="/onboarding/checklist" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Open printable checklist
              </Link>
              <Link href="/integrations" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950">
                Review integrations
              </Link>
              <Link href="/web" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white">
                Open web version
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}