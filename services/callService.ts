import Twilio from 'twilio';
import supabaseServer from '../lib/supabaseServer';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

const twilioClient = (accountSid && authToken) ? Twilio(accountSid, authToken) : null;

export type BridgeCallOptions = {
  organizationId: string;
  agentPhone: string;
  leadPhone: string;
  leadId?: string;
  agentId?: string;
  dryRun?: boolean;
};

export async function bridgeCall(opts: BridgeCallOptions) {
  const { organizationId, agentPhone, leadPhone, leadId, agentId, dryRun } = opts;

  if (dryRun || !twilioClient) {
    // Simulate a call flow and return mock data
    const now = new Date();
    const call = {
      call_sid: `DRY-${Date.now()}`,
      conference_sid: `CONF-DRY-${Date.now()}`,
      status: 'completed',
      duration: 30,
      recording_url: null,
      started_at: now.toISOString(),
      ended_at: new Date(now.getTime() + 30000).toISOString(),
      outcome: 'connected (dry-run)'
    };

    return call;
  }

  // Production flow using Twilio: call agent, then call lead and bridge into conference.
  // NOTE: This is a simplified implementation — full production code should handle webhooks for answered, completed, recordings, etc.
  if (!twilioClient) throw new Error('Twilio client not configured');

  // Create a conference
  const conference = await twilioClient.conferences.create({
    friendlyName: `estateflow-${Date.now()}`
  });

  // Call agent and add to conference
  const agentCall = await twilioClient.calls.create({
    to: agentPhone,
    from: twilioNumber,
    url: 'http://demo.twilio.com/docs/voice.xml' // TODO: replace with TwiML to play confirmation then dial lead into conference
  });

  // Call lead and add to conference
  const leadCall = await twilioClient.calls.create({
    to: leadPhone,
    from: twilioNumber,
    url: 'http://demo.twilio.com/docs/voice.xml'
  });

  return {
    call_sid: leadCall.sid,
    conference_sid: conference.sid,
    status: 'initiated',
    duration: null,
    recording_url: null,
    started_at: new Date().toISOString(),
    ended_at: null,
    outcome: null
  };
}

export default { bridgeCall };
