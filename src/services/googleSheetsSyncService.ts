'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { google } from 'googleapis';

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

async function getGoogleAuth(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('integration_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', ['google_access_token', 'google_refresh_token', 'google_spreadsheet_id']);

  const settings = Object.fromEntries((data ?? []).map((item) => [item.key, item.value]));

  if (!settings.google_access_token && !settings.google_refresh_token) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
  );

  oauth2Client.setCredentials({
    access_token: settings.google_access_token,
    refresh_token: settings.google_refresh_token,
  });

  return { auth: oauth2Client, spreadsheetId: settings.google_spreadsheet_id };
}

export async function syncLeadToGoogleSheets(payload: GoogleSheetsLeadSync) {
  const googleAuth = await getGoogleAuth(payload.organizationId);

  // If OAuth is configured, use the direct API
  if (googleAuth && googleAuth.spreadsheetId) {
    const sheets = google.sheets({ version: 'v4', auth: googleAuth.auth });
    
    try {
      await sheets.spreadsheets.values.append({
        spreadsheetId: googleAuth.spreadsheetId,
        range: 'Sheet1!A:K',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [
            [
              payload.leadId,
              payload.leadName,
              payload.phone,
              payload.email || '',
              payload.source || '',
              payload.status || '',
              payload.temperature || '',
              payload.preferredLocation || '',
              payload.budgetMin || '',
              payload.budgetMax || '',
              payload.notes || '',
              new Date().toISOString(),
            ],
          ],
        },
      });
      return { ok: true, method: 'oauth' };
    } catch (error) {
      console.error('Google Sheets API Error:', error);
      // Fallback to webhook if direct API fails? No, let's keep them separate or logic a fallback.
    }
  }

  // Fallback to legacy Webhook method
  const supabase = await createSupabaseServerClient();
  const { data: webhookSettings } = await supabase
    .from('integration_settings')
    .select('value')
    .eq('organization_id', payload.organizationId)
    .eq('key', 'google_sheets_webhook_url')
    .maybeSingle();

  const webhookUrl = webhookSettings?.value || process.env.GOOGLE_SHEETS_WEBHOOK_URL || '';

  if (!webhookUrl || webhookUrl.includes('your_')) {
    console.log('[DRY-RUN] Google Sheets sync skipped (no OAuth or Webhook):', payload.leadId);
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

  return { ok: true, method: 'webhook' };
}
