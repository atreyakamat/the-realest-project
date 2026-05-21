import { NextResponse } from 'next/server';
import { runWorkflowExecutor } from '@/services/workflow-executor';

// Cron endpoint that triggers the workflow executor to process pending actions.
export async function POST() {
  try {
    const result = await runWorkflowExecutor(50);
    return NextResponse.json({ ok: true, processed: result.processed });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
