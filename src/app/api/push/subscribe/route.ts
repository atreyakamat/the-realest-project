import { NextResponse } from 'next/server';
import { requireSessionUser } from '@/lib/auth';
import { upsertPushSubscription } from '@/services/pushService';

type PushSubscriptionPayload = {
  endpoint?: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

export async function POST(req: Request) {
  try {
    const user = await requireSessionUser();
    if (!user.organizationId) {
      return NextResponse.json({ error: 'Missing organization context' }, { status: 400 });
    }

    const body = (await req.json()) as PushSubscriptionPayload;

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    await upsertPushSubscription({
      organizationId: user.organizationId,
      userId: user.id,
      endpoint: body.endpoint,
      p256dh: body.keys.p256dh,
      auth: body.keys.auth,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to save push subscription' },
      { status: 500 },
    );
  }
}
