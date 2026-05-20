-- EstateFlow security hardening and consistency migration.

-- Add missing updated_at columns for operational tables.
ALTER TABLE lead_sources ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE property_images ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE property_documents ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE lead_property_shares ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE activities ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE calls ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE messages ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE followups ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE attendance ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Keep updated_at fresh automatically.
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  table_name text;
BEGIN
  FOREACH table_name IN ARRAY ARRAY[
    'organizations',
    'profiles',
    'team_members',
    'lead_sources',
    'leads',
    'properties',
    'property_images',
    'property_documents',
    'lead_property_shares',
    'activities',
    'calls',
    'messages',
    'followups',
    'attendance',
    'social_posts',
    'tasks',
    'integration_settings',
    'notifications'
  ]
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trg_touch_%I_updated_at ON %I', table_name, table_name);
    EXECUTE format('CREATE TRIGGER trg_touch_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION touch_updated_at()', table_name, table_name);
  END LOOP;
END;
$$;

-- Resolve organization via authenticated profile.
CREATE OR REPLACE FUNCTION current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT organization_id FROM profiles WHERE id = auth.uid();
$$;

-- Enable RLS on all organization-scoped tables.
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_property_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE integration_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Replace policies idempotently.
DROP POLICY IF EXISTS org_isolation_organizations ON organizations;
CREATE POLICY org_isolation_organizations ON organizations FOR ALL USING (id = current_org_id()) WITH CHECK (id = current_org_id());

DROP POLICY IF EXISTS org_isolation_profiles ON profiles;
CREATE POLICY org_isolation_profiles ON profiles FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_team_members ON team_members;
CREATE POLICY org_isolation_team_members ON team_members FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_lead_sources ON lead_sources;
CREATE POLICY org_isolation_lead_sources ON lead_sources FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_leads ON leads;
CREATE POLICY org_isolation_leads ON leads FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_properties ON properties;
CREATE POLICY org_isolation_properties ON properties FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_property_images ON property_images;
CREATE POLICY org_isolation_property_images ON property_images FOR ALL USING (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_images.property_id AND p.organization_id = current_org_id())
) WITH CHECK (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_images.property_id AND p.organization_id = current_org_id())
);

DROP POLICY IF EXISTS org_isolation_property_documents ON property_documents;
CREATE POLICY org_isolation_property_documents ON property_documents FOR ALL USING (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_documents.property_id AND p.organization_id = current_org_id())
) WITH CHECK (
  EXISTS (SELECT 1 FROM properties p WHERE p.id = property_documents.property_id AND p.organization_id = current_org_id())
);

DROP POLICY IF EXISTS org_isolation_lead_property_shares ON lead_property_shares;
CREATE POLICY org_isolation_lead_property_shares ON lead_property_shares FOR ALL USING (
  EXISTS (SELECT 1 FROM leads l WHERE l.id = lead_property_shares.lead_id AND l.organization_id = current_org_id())
) WITH CHECK (
  EXISTS (SELECT 1 FROM leads l WHERE l.id = lead_property_shares.lead_id AND l.organization_id = current_org_id())
);

DROP POLICY IF EXISTS org_isolation_activities ON activities;
CREATE POLICY org_isolation_activities ON activities FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_calls ON calls;
CREATE POLICY org_isolation_calls ON calls FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_messages ON messages;
CREATE POLICY org_isolation_messages ON messages FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_followups ON followups;
CREATE POLICY org_isolation_followups ON followups FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_attendance ON attendance;
CREATE POLICY org_isolation_attendance ON attendance FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_social_posts ON social_posts;
CREATE POLICY org_isolation_social_posts ON social_posts FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_tasks ON tasks;
CREATE POLICY org_isolation_tasks ON tasks FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_integration_settings ON integration_settings;
CREATE POLICY org_isolation_integration_settings ON integration_settings FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());

DROP POLICY IF EXISTS org_isolation_notifications ON notifications;
CREATE POLICY org_isolation_notifications ON notifications FOR ALL USING (organization_id = current_org_id()) WITH CHECK (organization_id = current_org_id());
