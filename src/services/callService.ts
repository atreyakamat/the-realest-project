import twilio from 'twilio';

type BridgeCallOptions = {
  organizationId: string;
  agentPhone: string;
  leadPhone: string;
  leadId?: string;
  agentId?: string;
  dryRun?: boolean;
};

export async function bridgeCall({
  organizationId,
  agentPhone,
  leadPhone,
  leadId,
  dryRun,
}: BridgeCallOptions) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (dryRun || !accountSid || !authToken || !twilioPhone) {
    console.log('[DRY-RUN] Bridging call:', { agentPhone, leadPhone, leadId });
    const started = new Date();
    return {
      call_sid: `DRY-${Date.now()}`,
      conference_sid: `CONF-${Date.now()}`,
      status: 'completed',
      duration: 45,
      recording_url: null,
      started_at: started.toISOString(),
      ended_at: new Date(started.getTime() + 45000).toISOString(),
      outcome: 'connected (dry-run)',
    };
  }

  const client = twilio(accountSid, authToken);
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  const recordingCallback = `${appUrl}/api/webhooks/twilio/recording?organizationId=${encodeURIComponent(
    organizationId,
  )}&leadId=${encodeURIComponent(leadId ?? '')}`;

  try {
    const conferenceName = `conf_${leadId}_${Date.now()}`;
    
    const call = await client.calls.create({
      to: agentPhone,
      from: twilioPhone,
      twiml: `<Response>
                <Say>New EstateFlow lead from your CRM. Connecting you now.</Say>
                <Dial>
                  <Conference
                    record="record-from-start"
                    recordingStatusCallback="${recordingCallback}"
                    recordingStatusCallbackMethod="POST"
                  >${conferenceName}</Conference>
                </Dial>
              </Response>`
    });

    await client.calls.create({
      to: leadPhone,
      from: twilioPhone,
      twiml: `<Response>
                <Dial>
                  <Conference
                    record="record-from-start"
                    recordingStatusCallback="${recordingCallback}"
                    recordingStatusCallbackMethod="POST"
                  >${conferenceName}</Conference>
                </Dial>
              </Response>`
    });

    return {
      call_sid: call.sid,
      conference_sid: conferenceName,
      status: 'in-progress',
      duration: null,
      recording_url: null,
      started_at: new Date().toISOString(),
      ended_at: null,
      outcome: 'bridging'
    };
  } catch (error) {
    console.error('Twilio Error:', error);
    throw error;
  }
}
