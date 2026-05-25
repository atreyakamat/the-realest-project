'use server';

import { createSupabaseServerClient } from '@/lib/supabase-server';

type WhatsAppMessageOptions = {
  organizationId: string;
  to: string;
  templateName?: string;
  languageCode?: string;
  components?: any[];
  text?: string;
};

async function getWhatsAppSettings(organizationId: string) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('integration_settings')
    .select('key, value')
    .eq('organization_id', organizationId)
    .in('key', ['whatsapp_phone_number_id', 'whatsapp_access_token']);

  return Object.fromEntries((data ?? []).map((item) => [item.key, item.value]));
}

export async function sendWhatsAppCloudApiMessage(options: WhatsAppMessageOptions) {
  const settings = await getWhatsAppSettings(options.organizationId);
  const phoneNumberId = settings.whatsapp_phone_number_id || process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = settings.whatsapp_access_token || process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken || accessToken.includes('your_')) {
    console.log('[DRY-RUN] WhatsApp Cloud API message skipped:', options.to, options.text || options.templateName);
    return { ok: false, skipped: true };
  }

  const url = `https://graph.facebook.com/v21.0/${phoneNumberId}/messages`;
  
  const body: any = {
    messaging_product: 'whatsapp',
    to: options.to.replace(/\D/g, ''), // Ensure only digits
  };

  if (options.templateName) {
    body.type = 'template';
    body.template = {
      name: options.templateName,
      language: { code: options.languageCode || 'en_US' },
      components: options.components,
    };
  } else {
    body.type = 'text';
    body.text = { body: options.text };
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('WhatsApp Cloud API Error:', result);
      return { ok: false, error: result };
    }

    return { ok: true, messageId: result.messages?.[0]?.id };
  } catch (error) {
    console.error('WhatsApp Cloud API Fetch Error:', error);
    return { ok: false, error };
  }
}
