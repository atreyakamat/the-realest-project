import Link from 'next/link';
import { Badge, Card } from '@/components/ui';

const integrations = [
  { name: 'Supabase', status: 'Connected', detail: 'Auth, database, storage, and realtime' },
  { name: 'Twilio', status: 'Ready', detail: 'Voice bridge and WhatsApp/SMS dispatch' },
  { name: 'Resend', status: 'Ready', detail: 'Magic links and transaction emails' },
  { name: 'OpenAI', status: 'Optional', detail: 'Lead enrichment and content suggestions' },
];

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Connections</p>
        <h1 className="text-3xl font-semibold text-white">Integrations</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">
          Track service readiness and jump to the settings page when you need to update secrets.
        </p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {integrations.map((integration) => (
          <Card key={integration.name} className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold text-white">{integration.name}</h3>
              <Badge>{integration.status}</Badge>
            </div>
            <p className="text-sm text-slate-300">{integration.detail}</p>
          </Card>
        ))}
      </div>

      <Link href="/settings" className="inline-flex rounded-2xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950">
        Manage secrets in Settings
      </Link>
    </div>
  );
}
