import { NextResponse } from 'next/server';
import { processCallRecording } from '@/services/callInsightsService';

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const form = await req.formData();
    const callSid = String(form.get('CallSid') ?? '');
    const recordingUrlRaw = String(form.get('RecordingUrl') ?? '');
    const recordingStatus = String(form.get('RecordingStatus') ?? '');
    const recordingDurationRaw = String(form.get('RecordingDuration') ?? '0');
    const organizationId = String(
      url.searchParams.get('organizationId') ?? form.get('OrganizationId') ?? process.env.DEFAULT_ORGANIZATION_ID ?? '',
    );

    if (!callSid || !recordingUrlRaw || !organizationId) {
      return NextResponse.json({ error: 'Missing callSid, recordingUrl, or organizationId' }, { status: 400 });
    }

    if (recordingStatus && recordingStatus !== 'completed') {
      return NextResponse.json({ ok: true, skipped: `recording_status_${recordingStatus}` });
    }

    const recordingDuration = Number.parseInt(recordingDurationRaw, 10);
    const recordingUrl = recordingUrlRaw.endsWith('.mp3') ? recordingUrlRaw : `${recordingUrlRaw}.mp3`;

    const result = await processCallRecording({
      organizationId,
      callSid,
      recordingUrl,
      recordingDuration: Number.isFinite(recordingDuration) ? recordingDuration : null,
    });

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to process recording' },
      { status: 500 },
    );
  }
}
