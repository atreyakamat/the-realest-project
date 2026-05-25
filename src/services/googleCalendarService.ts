'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';
import { google } from 'googleapis';

type CalendarEventOptions = {
  organizationId: string;
  summary: string;
  description: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
};

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

export async function createCalendarEvent(options: CalendarEventOptions) {
  const auth = await getGoogleAuth(options.organizationId);

  if (!auth) {
    console.log('[DRY-RUN] Google Calendar sync skipped (no OAuth):', options.summary);
    return { ok: false, skipped: true };
  }

  const calendar = google.calendar({ version: 'v3', auth });

  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: options.summary,
        description: options.description,
        start: {
          dateTime: options.startTime,
        },
        end: {
          dateTime: options.endTime,
        },
        attendees: options.attendees?.map(email => ({ email })),
        reminders: {
          useDefault: true,
        },
      },
    });

    return { ok: true, eventId: event.data.id };
  } catch (error) {
    console.error('Google Calendar API Error:', error);
    return { ok: false, error };
  }
}
