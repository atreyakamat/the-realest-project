'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';

type SettingSeed = {
  key: string;
  value: string;
  isSecret: boolean;
};

export async function saveSettingsAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const supabase = await createSupabaseServerClient();

  const settings: SettingSeed[] = [
    { key: 'assignment_mode', value: String(formData.get('assignment_mode') ?? 'round_robin'), isSecret: false },
    { key: 'lead_webhook_secret', value: String(formData.get('lead_webhook_secret') ?? ''), isSecret: true },
    { key: 'twilio_account_sid', value: String(formData.get('twilio_account_sid') ?? ''), isSecret: true },
    { key: 'twilio_auth_token', value: String(formData.get('twilio_auth_token') ?? ''), isSecret: true },
    { key: 'twilio_phone_number', value: String(formData.get('twilio_phone_number') ?? ''), isSecret: true },
    { key: 'whatsapp_sender_number', value: String(formData.get('whatsapp_sender_number') ?? ''), isSecret: true },
    { key: 'resend_api_key', value: String(formData.get('resend_api_key') ?? ''), isSecret: true },
    { key: 'smtp_host', value: String(formData.get('smtp_host') ?? ''), isSecret: true },
    { key: 'smtp_port', value: String(formData.get('smtp_port') ?? ''), isSecret: true },
    { key: 'smtp_user', value: String(formData.get('smtp_user') ?? ''), isSecret: true },
    { key: 'smtp_password', value: String(formData.get('smtp_password') ?? ''), isSecret: true },
    { key: 'openai_api_key', value: String(formData.get('openai_api_key') ?? ''), isSecret: true },
  ];

  const filtered = settings.filter((item) => item.value.trim().length > 0);

  for (const setting of filtered) {
    const { error } = await supabase.from('integration_settings').upsert(
      {
        organization_id: user.organizationId,
        key: setting.key,
        value: setting.value,
        is_secret: setting.isSecret,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'organization_id,key' },
    );

    if (error) {
      return { message: '', error: error.message };
    }
  }

  revalidatePath('/settings');
  revalidatePath('/integrations');

  return { message: 'Settings saved.', error: '' };
}
