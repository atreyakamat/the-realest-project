import { Card, Badge } from '@/components/ui';
import { SettingsForm } from '@/components/settings/settings-form';
import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export default async function SettingsPage() {
  const user = await getSessionUser();
  const supabase = await createSupabaseServerClient();
  const { data: settings } = await supabase
    .from('integration_settings')
    .select('key, value, is_secret, updated_at')
    .eq('organization_id', user?.organizationId ?? 'demo-org');

  const initialValues = Object.fromEntries((settings ?? []).map((setting) => [setting.key, setting.value]));

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Admin</p>
        <h1 className="text-3xl font-semibold text-white">Settings</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Configure assignment rules, secret values, and the integrations your team depends on.</p>
      </header>

      <Card>
        <SettingsForm initialValues={initialValues as Record<string, string>} />
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {(settings ?? []).map((setting) => (
          <Card key={setting.key} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-white">{setting.key}</h3>
              <Badge>{setting.is_secret ? 'Secret' : 'Public'}</Badge>
            </div>
            <p className="text-sm text-slate-300">{setting.is_secret ? 'Stored securely in the CRM vault.' : setting.value}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
