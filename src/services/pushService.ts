import webpush from 'web-push';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

function configureWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:ops@estateflow.local';

  if (!publicKey || !privateKey) return false;

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return true;
}

export async function upsertPushSubscription(args: {
  organizationId: string;
  userId: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  userAgent?: string;
}) {
  const supabase = createSupabaseAdminClient();

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      organization_id: args.organizationId,
      user_id: args.userId,
      endpoint: args.endpoint,
      p256dh: args.p256dh,
      auth: args.auth,
      user_agent: args.userAgent ?? null,
      last_seen_at: new Date().toISOString(),
    },
    { onConflict: 'endpoint' },
  );

  if (error) throw error;
}

export async function sendPushToOrganization(organizationId: string, payload: Record<string, unknown>) {
  if (!configureWebPush()) {
    return { delivered: 0, skipped: true };
  }

  const supabase = createSupabaseAdminClient();
  const { data: rows } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('organization_id', organizationId);

  if (!rows || rows.length === 0) {
    return { delivered: 0, skipped: false };
  }

  let delivered = 0;

  for (const row of rows) {
    try {
      await webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: {
            p256dh: row.p256dh,
            auth: row.auth,
          },
        },
        JSON.stringify(payload),
      );
      delivered += 1;
    } catch {
      await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
    }
  }

  return { delivered, skipped: false };
}
