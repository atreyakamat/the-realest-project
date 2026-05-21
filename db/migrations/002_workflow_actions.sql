-- Create workflow_actions table to persist recommended actions and executions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS workflow_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id uuid REFERENCES leads(id) ON DELETE SET NULL,
  action_id text NOT NULL,
  action_payload jsonb,
  executed_by text,
  dry_run boolean DEFAULT true,
  status text DEFAULT 'pending',
  result jsonb,
  created_at timestamptz DEFAULT now(),
  executed_at timestamptz
);
