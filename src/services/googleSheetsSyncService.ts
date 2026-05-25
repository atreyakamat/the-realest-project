'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

type GoogleSheetsLeadSync = {
  organizationId: string;
  leadId: string;
  leadName: string;
  phone: string;
  email?: string | null;
  source?: string | null;
  status?: string | null;
  temperature?: string | null;
  preferredLocation?: string | null;
  budgetMin?: number | null;
  budgetMax?: number | null;
  notes?: string | null;
};

async function resolveWebhookUrl(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('integration_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', ['google_sheets_webhook_url', 'zapier_webhook_url', 'make_webhook_url'])
    .order('updated_at', { ascending: false });

  const settings = Object.fromEntries((data ?? []).map((item) => [item.key, item.value]));
  return settings.google_sheets_webhook_url || settings.zapier_webhook_url || settings.make_webhook_url || process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';
}

export async function syncLeadToGoogleSheets(payload: GoogleSheetsLeadSync) {
  const webhookUrl = await resolveWebhookUrl(payload.organizationId);

  if (!webhookUrl || webhookUrl.includes('your_')) {
    console.log('[DRY-RUN] Google Sheets sync skipped:', payload.leadId);
    return { ok: false, skipped: true };
  }

  const response = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      event: 'lead.created',
      source: 'EstateFlow CRM',
      timestamp: new Date().toISOString(),
      payload,
    }),
  });

  if (!response.ok) {
    throw new Error(`Google Sheets sync failed with ${response.status}`);
  }

  return { ok: true };
}