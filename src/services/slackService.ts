import { createSupabaseServerClient } from '@/lib/supabase-server';

type SlackMessageOptions = {
  organizationId: string;
  text: string;
  blocks?: Array<Record<string, unknown>>;
};

async function getSlackWebhookUrl(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('integration_settings')
    .select('value')
    .eq('organization_id', organizationId)
    .eq('key', 'slack_webhook_url')
    .maybeSingle();

  return data?.value || process.env.SLACK_WEBHOOK_URL || '';
}

export async function sendSlackNotification({ organizationId, text, blocks }: SlackMessageOptions) {
  const webhookUrl = await getSlackWebhookUrl(organizationId);

  if (!webhookUrl || webhookUrl.includes('your_slack')) {
    console.log('[DRY-RUN] Slack notification skipped:', text);
    return { ok: false, skipped: true };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        blocks,
      }),
    });

    if (!response.ok) {
      console.error('Slack API error:', response.statusText);
      return { ok: false, error: response.statusText };
    }

    return { ok: true };
  } catch (error) {
    console.error('Slack fetch error:', error);
    return { ok: false, error };
  }
}

export async function notifyNewLeadAssigned(organizationId: string, lead: { full_name: string; id: string; source?: string }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const leadUrl = `${appUrl}/leads/${lead.id}`;

  return sendSlackNotification({
    organizationId,
    text: `🚨 New Lead Assigned: ${lead.full_name}`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*🚨 New Lead Assigned*\n*Name:* ${lead.full_name}\n*Source:* ${lead.source || 'Unknown'}`,
        },
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'View Lead',
            },
            url: leadUrl,
            style: 'primary',
          },
        ],
      },
    ],
  });
}
