-- AI call insights, drip campaigns, property geodata, and web push support.

ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision;

CREATE TABLE IF NOT EXISTS call_ai_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  call_id uuid REFERENCES calls(id) ON DELETE SET NULL,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  call_sid text,
  transcript text,
  summary text,
  sentiment text,
  follow_up_tasks jsonb,
  raw_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS drip_sequences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  step_number integer NOT NULL,
  template_key text NOT NULL,
  channel text NOT NULL DEFAULT 'whatsapp',
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  provider_payload jsonb,
  sent_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  user_agent text,
  last_seen_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_properties_geo ON properties (organization_id, latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_call_ai_insights_lookup ON call_ai_insights (organization_id, lead_id, call_sid);
CREATE INDEX IF NOT EXISTS idx_drip_sequences_due ON drip_sequences (organization_id, status, due_at);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_org_user ON push_subscriptions (organization_id, user_id);

ALTER TABLE call_ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE drip_sequences ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS org_isolation_call_ai_insights ON call_ai_insights;
CREATE POLICY org_isolation_call_ai_insights ON call_ai_insights
FOR ALL
USING (organization_id = current_org_id())
WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_drip_sequences ON drip_sequences;
CREATE POLICY org_isolation_drip_sequences ON drip_sequences
FOR ALL
USING (organization_id = current_org_id())
WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_push_subscriptions ON push_subscriptions;
CREATE POLICY org_isolation_push_subscriptions ON push_subscriptions
FOR ALL
USING (organization_id = current_org_id())
WITH CHECK (organization_id = current_org_id());

DROP TRIGGER IF EXISTS trg_touch_call_ai_insights_updated_at ON call_ai_insights;
CREATE TRIGGER trg_touch_call_ai_insights_updated_at
BEFORE UPDATE ON call_ai_insights
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_drip_sequences_updated_at ON drip_sequences;
CREATE TRIGGER trg_touch_drip_sequences_updated_at
BEFORE UPDATE ON drip_sequences
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

DROP TRIGGER IF EXISTS trg_touch_push_subscriptions_updated_at ON push_subscriptions;
CREATE TRIGGER trg_touch_push_subscriptions_updated_at
BEFORE UPDATE ON push_subscriptions
FOR EACH ROW EXECUTE FUNCTION touch_updated_at();
