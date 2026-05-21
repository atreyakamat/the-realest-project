# Workflow Automation

This document explains how workflow recommendations are persisted and how to enable automated execution.

What was added

- DB migration: `db/migrations/002_workflow_actions.sql` — a table to persist recommended workflow actions and their execution status.
- API endpoint: `POST /api/workflow/execute` — records an action in the DB. By default it performs a dry-run (does not send messages).
- Client helper: `src/components/workflow/take-action-button.tsx` — a small client component to record a recommended action from the Lead view.
- Server helper: `src/lib/workflow-actions.ts` — helper to insert records into the workflow_actions table.

Dry-run by default

For safety, the API and client record actions in `dry_run: true` by default. This means no external messages or calls are performed unless you wire a separate executor.

How to enable live channels

To enable live sends (SMS/WhatsApp/Voice via Twilio, or Email via Resend), implement a background worker or an edge function that polls `workflow_actions` for records with `status = 'pending'` and `dry_run = false`.

Recommended environment variables

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- RESEND_API_KEY

How to run scheduled execution

Create a cron job or GitHub Actions workflow that calls `/api/cron/run-workflow` (or implement a Supabase scheduled function) to pick up pending actions and execute them. The project now includes a small executor service that will process pending, non-dry-run actions and attempt execution using configured channels (Twilio / Resend / Email). The executor will:

- Fetch pending workflow_actions (status = 'pending' and dry_run = false)
- Execute supported actions (call_now, send_matches, book_visit, manager_review, nurture)
- Mark actions as `executed` or `failed` with result metadata (stored in `workflow_actions.result`)

Run the executor by POSTing to `/api/cron/run-workflow`.

Environment variables required for live execution

- TWILIO_ACCOUNT_SID
- TWILIO_AUTH_TOKEN
- TWILIO_PHONE_NUMBER
- RESEND_API_KEY (if using Resend email)
- MANAGER_EMAIL (for manager_review notifications)

Security

Protect the execution endpoint with authentication and only allow authorized service accounts to flip `dry_run` to `false`.

Note: In absence of these credentials, the executor will fail-safe and record an error in the action result. Always test in a staging environment first.

