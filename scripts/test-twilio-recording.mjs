import { createClient } from '@supabase/supabase-js';

function parseArgs(argv) {
  const args = new Map();
  for (let i = 0; i < argv.length; i += 1) {
    const current = argv[i];
    if (!current.startsWith('--')) continue;
    const next = argv[i + 1];
    if (next && !next.startsWith('--')) {
      args.set(current.slice(2), next);
      i += 1;
    } else {
      args.set(current.slice(2), 'true');
    }
  }
  return args;
}

function required(name, value) {
  if (!value) {
    throw new Error(`Missing required value: ${name}`);
  }
  return value;
}

function printUsage() {
  console.log(`Usage:
  node scripts/test-twilio-recording.mjs --base-url http://localhost:3000 \\
    --org-id <orgId> --lead-id <leadId> --call-sid <callSid> --recording-url <url>

Optional:
  --recording-duration 62
  --verify-db true
  --create-call-row true

Environment:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Notes:
  - The script POSTs a Twilio-style recording callback to /api/webhooks/twilio/recording.
  - If SUPABASE credentials are provided and --verify-db is true, it checks call_ai_insights for the inserted row.
  - If --create-call-row is true, it seeds a matching call record first so the webhook can resolve organization/lead context.`);
}

const args = parseArgs(process.argv.slice(2));
if (args.has('help') || args.has('h')) {
  printUsage();
  process.exit(0);
}

const baseUrl = (args.get('base-url') ?? process.env.TEST_BASE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
const organizationId = required('org-id', args.get('org-id') ?? process.env.TEST_ORGANIZATION_ID ?? '');
const leadId = required('lead-id', args.get('lead-id') ?? process.env.TEST_LEAD_ID ?? '');
const callSid = args.get('call-sid') ?? process.env.TEST_CALL_SID ?? `CA${Date.now()}`;
const recordingUrl = required('recording-url', args.get('recording-url') ?? process.env.TEST_RECORDING_URL ?? '');
const recordingDuration = args.get('recording-duration') ?? process.env.TEST_RECORDING_DURATION ?? '62';
const verifyDb = (args.get('verify-db') ?? process.env.TEST_VERIFY_DB ?? 'true').toLowerCase() !== 'false';
const createCallRow = (args.get('create-call-row') ?? process.env.TEST_CREATE_CALL_ROW ?? 'true').toLowerCase() !== 'false';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const supabase = supabaseUrl && supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

if (createCallRow) {
  if (!supabase) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when --create-call-row is true');
  }

  const { error: deleteError } = await supabase.from('calls').delete().eq('call_sid', callSid);
  if (deleteError) throw deleteError;

  const { error: insertError } = await supabase.from('calls').insert({
    organization_id: organizationId,
    lead_id: leadId,
    call_sid: callSid,
    status: 'in-progress',
    started_at: new Date().toISOString(),
    outcome: 'test-seed',
  });
  if (insertError) throw insertError;
}

const formData = new URLSearchParams({
  CallSid: callSid,
  RecordingUrl: recordingUrl,
  RecordingStatus: 'completed',
  RecordingDuration: recordingDuration,
  OrganizationId: organizationId,
});

const response = await fetch(`${baseUrl}/api/webhooks/twilio/recording?organizationId=${encodeURIComponent(organizationId)}`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: formData.toString(),
});

const payload = await response.json().catch(() => ({}));
console.log(JSON.stringify({ status: response.status, payload }, null, 2));

if (!response.ok) {
  process.exit(1);
}

if (verifyDb) {
  if (!supabase) {
    throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required when --verify-db is true');
  }

  const { data, error } = await supabase
    .from('call_ai_insights')
    .select('id, call_sid, organization_id, sentiment, summary, follow_up_tasks, created_at')
    .eq('call_sid', callSid)
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  if (!data || data.length === 0) {
    throw new Error(`No call_ai_insights row found for callSid ${callSid}`);
  }

  console.log('Verified call_ai_insights insert:', JSON.stringify(data[0], null, 2));
}
