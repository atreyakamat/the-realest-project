import { NextResponse } from 'next/server';
import { recordWorkflowAction } from '@/lib/workflow-actions';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { leadId, actionId, actionPayload = null, dryRun = true } = body as any;

    if (!leadId || !actionId) {
      return NextResponse.json({ error: 'leadId and actionId are required' }, { status: 400 });
    }

    const record = await recordWorkflowAction({ leadId, actionId, actionPayload, dryRun });

    // NOTE: Execution of external channels (Twilio/Resend) is not performed here by default.
    // This endpoint persists the requested action and returns the DB record.

    return NextResponse.json({ ok: true, record });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? String(err) }, { status: 500 });
  }
}
