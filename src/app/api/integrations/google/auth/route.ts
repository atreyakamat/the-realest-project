import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { requireSessionUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await requireSessionUser();
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/google/callback`
    );

    const scopes = [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/drive.file'
    ];

    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
      state: user.organizationId, // Pass orgId in state
    });

    return NextResponse.redirect(url);
  } catch (error) {
    console.error('Google OAuth Initiation Error:', error);
    return NextResponse.json({ error: 'Auth initiation failed' }, { status: 500 });
  }
}
