-- Initial schema for EstateFlow CRM
-- Run this on Supabase/Postgres to create required tables.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- organizations
CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  metadata jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- users / profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email text UNIQUE,
  full_name text,
  phone text,
  role text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- team_members (agents / staff)
CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL,
  is_active boolean DEFAULT true,
  last_assigned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- lead_sources
CREATE TABLE lead_sources (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- leads
CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  email text,
  source text,
  property_type text,
  budget_min numeric,
  budget_max numeric,
  preferred_location text,
  notes text,
  status text DEFAULT 'New',
  temperature text,
  assigned_agent_id uuid REFERENCES team_members(id),
  next_followup timestamptz,
  created_at timestamptz DEFAULT now(),
  last_contacted_at timestamptz,
  updated_at timestamptz DEFAULT now()
);

-- properties
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text NOT NULL,
  location text,
  address text,
  property_type text,
  price numeric,
  size text,
  bedrooms integer,
  bathrooms integer,
  floor text,
  furnishing text,
  availability_status text DEFAULT 'Available',
  description text,
  amenities jsonb,
  owner_info jsonb,
  tags text[],
  units_available integer DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- property_images
CREATE TABLE property_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  url text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- property_documents
CREATE TABLE property_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  url text,
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- lead_property_shares
CREATE TABLE lead_property_shares (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  shared_by uuid REFERENCES profiles(id),
  channel text,
  message text,
  share_link text,
  created_at timestamptz DEFAULT now()
);

-- activities (timeline)
CREATE TABLE activities (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id) ON DELETE CASCADE,
  actor_id uuid REFERENCES profiles(id),
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- calls
CREATE TABLE calls (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  agent_id uuid REFERENCES team_members(id),
  call_sid text,
  conference_sid text,
  status text,
  duration integer,
  recording_url text,
  started_at timestamptz,
  ended_at timestamptz,
  outcome text,
  created_at timestamptz DEFAULT now()
);

-- messages (sms/whatsapp)
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  sender_id uuid REFERENCES profiles(id),
  channel text,
  body text,
  provider_payload jsonb,
  created_at timestamptz DEFAULT now()
);

-- followups
CREATE TABLE followups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  created_by uuid REFERENCES profiles(id),
  due_at timestamptz,
  note text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- attendance
CREATE TABLE attendance (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  check_in_time timestamptz,
  check_out_time timestamptz,
  check_in_latitude double precision,
  check_in_longitude double precision,
  check_out_latitude double precision,
  check_out_longitude double precision,
  selfie_url text,
  status text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- social_posts
CREATE TABLE social_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text,
  caption text,
  media jsonb,
  post_type text,
  status text DEFAULT 'idea',
  scheduled_at timestamptz,
  assigned_to uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- tasks / notifications / integration_settings
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  title text,
  payload jsonb,
  status text DEFAULT 'open',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE integration_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text,
  is_secret boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id),
  type text,
  payload jsonb,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Basic indexes
CREATE INDEX ON leads (organization_id, status);
CREATE INDEX ON properties (organization_id, availability_status);
CREATE INDEX ON calls (organization_id, lead_id);

-- Row Level Security templates (enable and customize in Supabase dashboard)
-- For production, enable RLS and add policies so users only access their org data.
-- Example (run in Supabase SQL editor and customize):
-- ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Org member access" ON leads FOR ALL USING (organization_id = current_setting('estateflow.organization_id')::uuid);
