import { NextResponse } from 'next/server';
import { runDueDripCampaigns } from '@/services/dripCampaignService';

export async function POST() {
  try {
    const result = await runDueDripCampaigns(60);
    return NextResponse.json({ ok: true, processed: result.processed });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to execute drip campaigns' },
      { status: 500 },
    );
  }
}
