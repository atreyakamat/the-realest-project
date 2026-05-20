import { Resend } from 'resend';

type SendEmailOptions = {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  dryRun?: boolean;
};

export async function sendEmail({ to, subject, text, html, dryRun }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API_KEY;

  if (dryRun || !apiKey) {
    console.log('[DRY-RUN] Sending email:', { to, subject });
    return { id: `DRY-${Date.now()}` };
  }

  const resend = new Resend(apiKey);

  try {
    const { data, error } = await resend.emails.send({
      from: 'EstateFlow CRM <onboarding@resend.dev>',
      to,
      subject,
      text: text || '',
      html: html || `<p>${text}</p>`,
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Resend Error:', error);
    throw error;
  }
}
