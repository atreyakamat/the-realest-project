'use client';

import { useActionState } from 'react';
import { saveSettingsAction } from '../../app/actions/settings';
import { Button, Input, Select } from '../ui';

const initialState = { message: '', error: '' };

export function SettingsForm({ initialValues }: { initialValues: Record<string, string> }) {
  const [state, action, pending] = useActionState(saveSettingsAction, initialState);

  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-3 md:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Assignment mode
          <Select name="assignment_mode" defaultValue={initialValues.assignment_mode ?? 'round_robin'} className="mt-2">
            <option value="round_robin">Round Robin</option>
            <option value="manual">Manual</option>
            <option value="least_busy">Least Busy Agent</option>
          </Select>
        </label>
        <label className="block text-sm text-slate-300">
          Lead webhook secret
          <Input name="lead_webhook_secret" defaultValue={initialValues.lead_webhook_secret ?? ''} className="mt-2" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <Input name="twilio_account_sid" placeholder="Twilio Account SID" defaultValue={initialValues.twilio_account_sid ?? ''} />
        <Input name="twilio_auth_token" placeholder="Twilio Auth Token" defaultValue={initialValues.twilio_auth_token ?? ''} />
        <Input name="twilio_phone_number" placeholder="Twilio phone number" defaultValue={initialValues.twilio_phone_number ?? ''} />
        <Input name="whatsapp_sender_number" placeholder="WhatsApp sender number" defaultValue={initialValues.whatsapp_sender_number ?? ''} />
        <Input name="resend_api_key" placeholder="Resend API key" defaultValue={initialValues.resend_api_key ?? ''} />
        <Input name="google_calendar_client_id" placeholder="Google Calendar client ID" defaultValue={initialValues.google_calendar_client_id ?? ''} />
        <Input name="google_calendar_client_secret" placeholder="Google Calendar client secret" defaultValue={initialValues.google_calendar_client_secret ?? ''} />
        <Input name="google_sheets_spreadsheet_id" placeholder="Google Sheets spreadsheet ID" defaultValue={initialValues.google_sheets_spreadsheet_id ?? ''} />
        <Input name="google_sheets_webhook_url" placeholder="Google Sheets webhook URL" defaultValue={initialValues.google_sheets_webhook_url ?? ''} />
        <Input name="google_drive_folder_id" placeholder="Google Drive folder ID" defaultValue={initialValues.google_drive_folder_id ?? ''} />
        <Input name="meta_lead_ads_app_id" placeholder="Meta Lead Ads app ID" defaultValue={initialValues.meta_lead_ads_app_id ?? ''} />
        <Input name="meta_lead_ads_app_secret" placeholder="Meta Lead Ads app secret" defaultValue={initialValues.meta_lead_ads_app_secret ?? ''} />
        <Input name="meta_lead_ads_access_token" placeholder="Meta Lead Ads access token" defaultValue={initialValues.meta_lead_ads_access_token ?? ''} />
        <Input name="slack_webhook_url" placeholder="Slack webhook URL" defaultValue={initialValues.slack_webhook_url ?? ''} />
        <Input name="zapier_webhook_url" placeholder="Zapier webhook URL" defaultValue={initialValues.zapier_webhook_url ?? ''} />
        <Input name="make_webhook_url" placeholder="Make webhook URL" defaultValue={initialValues.make_webhook_url ?? ''} />
        <Input name="openai_api_key" placeholder="OpenAI-compatible API key" defaultValue={initialValues.openai_api_key ?? ''} />
        <Input name="smtp_host" placeholder="SMTP host" defaultValue={initialValues.smtp_host ?? ''} />
        <Input name="smtp_port" placeholder="SMTP port" defaultValue={initialValues.smtp_port ?? ''} />
        <Input name="smtp_user" placeholder="SMTP user" defaultValue={initialValues.smtp_user ?? ''} />
        <Input name="smtp_password" placeholder="SMTP password" defaultValue={initialValues.smtp_password ?? ''} />
      </div>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save settings'}</Button>
    </form>
  );
}
