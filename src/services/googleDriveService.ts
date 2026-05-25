'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { google } from 'googleapis';
import { Readable } from 'stream';

async function getGoogleAuth(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('integration_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', ['google_access_token', 'google_refresh_token']);

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

  return oauth2Client;
}

export async function uploadFileToDrive(organizationId: string, file: { name: string; type: string; buffer: Buffer }) {
  const auth = await getGoogleAuth(organizationId);

  if (!auth) {
    console.log('[DRY-RUN] Google Drive upload skipped (no OAuth):', file.name);
    return { ok: false, skipped: true };
  }

  const drive = google.drive({ version: 'v3', auth });

  try {
    const response = await drive.files.create({
      requestBody: {
        name: file.name,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: Readable.from(file.buffer),
      },
      fields: 'id, webViewLink, webContentLink',
    });

    // Make file public/readable by link for sharing
    await drive.permissions.create({
      fileId: response.data.id!,
      requestBody: {
        role: 'reader',
        type: 'anyone',
      },
    });

    return { 
      ok: true, 
      fileId: response.data.id, 
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink 
    };
  } catch (error) {
    console.error('Google Drive API Error:', error);
    return { ok: false, error };
  }
}
