import twilio from 'twilio';
import { sendWhatsAppCloudApiMessage } from './whatsappCloudApiService';

type SendMessageOptions = {
  to: string;
  body: string;
  channel: 'sms' | 'whatsapp';
  organizationId?: string;
  dryRun?: boolean;
};

export async function sendMessage({ to, body, channel, organizationId, dryRun }: SendMessageOptions) {
  // If WhatsApp and organizationId is provided, try Cloud API first
  if (channel === 'whatsapp' && organizationId) {
    const cloudApiResult = await sendWhatsAppCloudApiMessage({
      organizationId,
      to,
      text: body,
    });

    if (cloudApiResult.ok) {
      return { sid: cloudApiResult.messageId, status: 'sent', provider: 'whatsapp_cloud_api' };
    }
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = channel === 'whatsapp' 
    ? process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886'
    : process.env.TWILIO_PHONE_NUMBER;

  if (dryRun || !accountSid || !authToken || !fromNumber) {
    console.log(`[DRY-RUN] Sending ${channel} message:`, { to, body });
    return { sid: `DRY-${Date.now()}`, status: 'sent' };
  }

  const client = twilio(accountSid, authToken);
  const formattedTo = channel === 'whatsapp' && !to.startsWith('whatsapp:') ? `whatsapp:${to}` : to;

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to: formattedTo,
    });
    return { sid: message.sid, status: message.status };
  } catch (error) {
    console.error(`Twilio ${channel} Error:`, error);
    throw error;
  }
}
