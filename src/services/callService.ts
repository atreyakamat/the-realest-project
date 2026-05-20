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
  agentId,
  dryRun,
}: BridgeCallOptions) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

  if (dryRun || !accountSid || !authToken || !twilioPhone) {
    console.log('[DRY-RUN] Bridging call:', { agentPhone, leadPhone, leadId, agentId });
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

  try {
    // 1. Call the Agent first
    // In a real production app, 'url' would point to a webhook that returns TwiML
    // to ask the agent to press a key and then dial the lead.
    // For this implementation, we'll initiate the call with a TwiML response.
    
    const conferenceName = `conf_${leadId}_${Date.now()}`;
    
    const call = await client.calls.create({
      to: agentPhone,
      from: twilioPhone,
      twiml: `<Response>
                <Say>New EstateFlow lead from your CRM. Connecting you now.</Say>
                <Dial>
                  <Conference>${conferenceName}</Conference>
                </Dial>
              </Response>`
    });

    // 2. Call the Lead and put them in the same conference
    await client.calls.create({
      to: leadPhone,
      from: twilioPhone,
      twiml: `<Response>
                <Dial>
                  <Conference>${conferenceName}</Conference>
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
