import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

const integrationGroups = [
  {
    title: 'Lead capture',
    items: [
      { name: '36 Acre', status: 'Ready', detail: 'Map incoming lead forms into the CRM with the webhook endpoint.' },
      { name: 'MagicBricks', status: 'Ready', detail: 'Route property enquiries into the lead intake workflow.' },
      { name: 'Housing.com', status: 'Ready', detail: 'Accept residential and commercial enquiries from portal forms.' },
      { name: 'Facebook Lead Ads', status: 'Ready', detail: 'Send Meta lead form submissions into the assigned agent queue.' },
      { name: 'Instagram Ads', status: 'Ready', detail: 'Capture Instagram lead-form traffic and normalize it as CRM leads.' },
      { name: 'Website Forms', status: 'Ready', detail: 'Connect your site contact forms, Typeform, or custom embeds.' },
    ],
  },
  {
    title: 'Communication',
    items: [
      { name: 'Twilio Voice', status: 'Connected', detail: 'Bridge agent-to-lead calls and log outcomes automatically.' },
      { name: 'Twilio WhatsApp / SMS', status: 'Connected', detail: 'Send follow-ups, property shares, and reminders.' },
      { name: 'Resend / SMTP', status: 'Ready', detail: 'Use for magic links, follow-up emails, and owner updates.' },
      { name: 'WhatsApp Cloud API', status: 'Planned', detail: 'Alternative messaging connector when you prefer Meta native APIs.' },
      { name: 'Google Business Profile', status: 'Planned', detail: 'Useful for local enquiry tracking and branded contact funnels.' },
    ],
  },
  {
    title: 'Operations and automation',
    items: [
      { name: 'Google Calendar', status: 'Planned', detail: 'Sync site visits, team meetings, and follow-up reminders.' },
      { name: 'Google Sheets', status: 'Ready', detail: 'Push lead lists into a webhook-backed Sheets workflow or Apps Script endpoint.' },
      { name: 'Google Drive', status: 'Planned', detail: 'Store brochures, plans, and shareable documents.' },
      { name: 'Slack', status: 'Planned', detail: 'Post alerts for new leads, missed calls, and follow-ups.' },
      { name: 'Zapier / Make', status: 'Ready', detail: 'Connect this CRM to downstream sales, marketing, or reporting tools.' },
      { name: 'OpenAI', status: 'Optional', detail: 'Draft captions, summaries, and lead follow-up suggestions.' },
    ],
  },
  {
    title: 'Core platform',
    items: [
      { name: 'Supabase Auth', status: 'Connected', detail: 'Handles sign-in, org-scoped sessions, and role access.' },
      { name: 'Supabase Database', status: 'Connected', detail: 'Stores leads, properties, calls, follow-ups, and settings.' },
      { name: 'Supabase Storage', status: 'Ready', detail: 'Use for property photos, brochures, and documents.' },
      { name: 'Supabase Realtime', status: 'Ready', detail: 'Broadcast notifications and live updates to the app shell.' },
    ],
  },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Connections</p>
        <h1 className="text-3xl font-semibold text-white">Integrations</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          Track which real-estate tools are ready, which are planned, and which secrets belong in the admin settings page.
        </p>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        {integrationGroups.map((group) => (
          <Card key={group.title} className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-white">{group.title}</h2>
              <Badge>{group.items.length} apps</Badge>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {group.items.map((integration) => (
                <div key={integration.name} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-semibold text-white">{integration.name}</h3>
                    <Badge>{integration.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{integration.detail}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/settings" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
          Manage secrets in Settings
        </Link>
        <Link href="/onboarding" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
          Review onboarding workflow
        </Link>
        <Link href="/onboarding/checklist" className="inline-flex rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white">
          Printable setup checklist
        </Link>
      </div>
    </div>
  );
}
