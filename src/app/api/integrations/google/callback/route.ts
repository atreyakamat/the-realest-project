import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get('code');
  const organizationId = url.searchParams.get('state');

  if (!code || !organizationId) {
    return NextResponse.json({ error: 'Missing code or organizationId' }, { status: 400 });
  }

  try {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    const { tokens } = await oauth2Client.getToken(code);
    const supabase = createSupabaseAdminClient();

    // Store tokens in integration_settings
    if (tokens.access_token) {
      await supabase.from('integration_settings').upsert({
        organization_id: organizationId,
        key: 'google_access_token',
        value: tokens.access_token,
        is_secret: true,
      });
    }

    if (tokens.refresh_token) {
      await supabase.from('integration_settings').upsert({
        organization_id: organizationId,
        key: 'google_refresh_token',
        value: tokens.refresh_token,
        is_secret: true,
      });
    }

    // Redirect back to integrations page
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?status=success`);
  } catch (error) {
    console.error('Google OAuth Callback Error:', error);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/integrations?status=error`);
  }
}
