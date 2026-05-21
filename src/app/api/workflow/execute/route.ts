import { NextResponse } from 'next/server';
import { recordWorkflowAction } from '@/lib/workflow-actions';

type RequestBody = {
  leadId: string;
  actionId: string;
  actionPayload?: unknown | null;
  dryRun?: boolean;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;
    const { leadId, actionId, actionPayload = null, dryRun = true } = body;

    if (!leadId || !actionId) {
      return NextResponse.json({ error: 'leadId and actionId are required' }, { status: 400 });
    }

    const record = await recordWorkflowAction({ leadId, actionId, actionPayload, dryRun });

    return NextResponse.json({ ok: true, record });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
