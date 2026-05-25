# Admin Onboarding & Deployment Checklist

This document collects the operational steps required to enable and validate the new features:
- AI Call Transcription & Sentiment Analysis
- Automated WhatsApp Drip Campaigns
- Interactive Map-Based Inventory
- PWA + Web Push Notifications
- "Top Closer" Leaderboard & Weekly Wins digest

Follow the checklist below in order. Most steps require admin credentials (Supabase, Twilio, OpenAI, Resend).

## 1) Required Accounts & Secrets
- Supabase project (Postgres) with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- Twilio account with `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` and WhatsApp sandbox number if using WhatsApp.
- OpenAI account and `OPENAI_API_KEY` for transcription and summarization.
- Resend account and `RESEND_API_KEY` for transactional emails.
- VAPID keypair for Web Push:
  - Generate with: `npx web-push generate-vapid-keys --json`
  - Set `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, and `VAPID_SUBJECT`.
- Optional: `MANAGER_EMAIL`, `DEFAULT_ORGANIZATION_ID`.

Store secrets in your deployment environment (Vercel / Netlify / server env) or Supabase Secrets.

## 2) Apply DB Migration
The new schema is in `db/migrations/003_ai_drip_pwa_leaderboard.sql`.

You can also run the helper script in this repo:

```bash
npm run db:migrate:003 -- --tool psql --database-url "postgres://user:password@db.host:5432/dbname"
```

Option A — Using `psql` directly (recommended if you have a connection string):

```bash
# Example: export PGPASSWORD and run psql
export DATABASE_URL="postgres://user:password@db.host:5432/dbname"
psql "$DATABASE_URL" -f db/migrations/003_ai_drip_pwa_leaderboard.sql
```

Option B — Using `supabase` CLI (if you're using Supabase projects):

```bash
# login and set project
supabase login
supabase projects list
# set remote DB or use psql on the project's connection string
psql "$(supabase db connection-string)" -f db/migrations/003_ai_drip_pwa_leaderboard.sql
```

Notes:
- The migration adds tables: `drip_sequences`, `push_subscriptions`, `call_ai_insights` and related RLS policies/triggers.
- Ensure the `SUPABASE_SERVICE_ROLE_KEY` is available to server code when running migrations or server-side jobs that need admin privileges.

## 3) Environment Variables (minimum)
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY` (client) and `SUPABASE_SERVICE_ROLE_KEY` (server)
- `OPENAI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER` (E.164) and `TWILIO_WHATSAPP_NUMBER` (if using WhatsApp)
- `RESEND_API_KEY`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_SUBJECT` (e.g., mailto:ops@example.com)
- `MANAGER_EMAIL` (for weekly wins digests)

## 4) Twilio: Webhook & Recording Setup
- Step 1: Open the Twilio Console and copy your **Account SID** and **Auth Token** into the app settings or environment variables.
- Step 2: Buy or select a Twilio phone number that supports voice and WhatsApp (if you plan to use WhatsApp messaging).
- Step 3: Go to **Phone Numbers > Manage > Active numbers** and open the number you want the CRM to use.
- Step 4: In the **Voice configuration** section, set the webhook for incoming calls to your app's call bridge endpoint if you use direct number handling.
- Step 5: Ensure outbound bridge calls use the app's recording callback URL, which is wired in code as:

```
https://YOUR_DOMAIN/api/webhooks/twilio/recording?organizationId=<ORG_ID>
```

- Step 6: If you are testing locally, expose the app with `ngrok` or a similar tunnel and replace `YOUR_DOMAIN` with that public URL.
- Step 7: Make a test outbound call. After it ends, Twilio should POST the recording payload to the recording webhook above.
- Step 8: For WhatsApp, open **Messaging > Try it out > WhatsApp sandbox** in Twilio, join the sandbox from your test phone, and set the sandbox webhook to the app route that handles inbound messaging if needed.

For local testing, expose your dev server with `ngrok`:

```bash
ngrok http 3000
# then use https://<ngrok-id>.ngrok.io as YOUR_DOMAIN
```

- If you want to test the callback flow without placing a real phone call, use the harness script below after creating a matching call row in the database.

## 5) PWA & Web Push
- Ensure `NEXT_PUBLIC_VAPID_PUBLIC_KEY` is set on the client build so the service worker can subscribe.
- Service worker is provided at `public/sw.js`; ensure it is registered by the client bootstrap (`src/components/realtime-bootstrap.tsx`).
- To test push locally:
  - Register a client with browser on the app, allow Notifications, then send a test push via the server using `src/services/pushService.ts` (server endpoint `POST /api/push/subscribe` stores subscriptions).
  - Use `node` or the server code to call `sendPushToOrganization` with a small payload.

## 6) Cron / Scheduled Jobs
- Drip campaign executor: `POST /api/cron/drip-campaigns` (call regularly, e.g., every 15 minutes).
- Weekly digest: `POST /api/cron/weekly-wins` (schedule weekly, e.g., Monday 08:00).

Example crontab (server-side):

```
# run drip every 15 minutes
*/15 * * * * curl -X POST https://YOUR_DOMAIN/api/cron/drip-campaigns
# run weekly digest Monday 08:00
0 8 * * 1 curl -X POST https://YOUR_DOMAIN/api/cron/weekly-wins
```

## 7) Integration & End-to-End Test Steps

1) Start app locally (or deploy)

```bash
npm run dev
# or build+start
npm run build && npm run start
```

2) Create a lead (simulates external webhook):

```bash
curl -X POST http://localhost:3000/api/webhooks/leads \
  -H 'Content-Type: application/json' \
  -d '{
    "full_name": "Test Lead",
    "phone": "+919876543210",
    "email": "test@example.com",
    "source": "website",
    "organization_id": "<ORG_ID>"
  }'
```

3) Trigger drip executor manually:

```bash
curl -X POST http://localhost:3000/api/cron/drip-campaigns
```

4) Simulate Twilio recording callback (if you cannot do an actual phone call):

```bash
curl -X POST http://localhost:3000/api/webhooks/twilio/recording?organizationId=<ORG_ID> \
  -d 'CallSid=CAxxxxxxxx&RecordingUrl=https://example.com/recording.mp3&RecordingDuration=62' \
  -H 'Content-Type: application/x-www-form-urlencoded'
```

You can also run the bundled harness, which seeds a call row first and then verifies the `call_ai_insights` insert:

```bash
npm run test:twilio-recording -- \
  --base-url http://localhost:3000 \
  --org-id <ORG_ID> \
  --lead-id <LEAD_ID> \
  --call-sid CAxxxxxxxx \
  --recording-url https://example.com/recording.mp3
```

The server will process the recording, call OpenAI (if `OPENAI_API_KEY` is set), persist `call_ai_insights`, and create a Meeting Summary activity on the lead timeline.

## 8) Troubleshooting
- If transcription does not appear, check logs for OpenAI key, request failures, or if the recording URL is public and accessible.
- If push subscriptions are not saved, ensure service worker registration succeeded and that `NEXT_PUBLIC_VAPID_PUBLIC_KEY` matches the server's `VAPID_PRIVATE_KEY`.
- If WhatsApp messages are not sent, verify Twilio WhatsApp sandbox configuration and that the recipient number is opted-in to the sandbox.

## 9) Post-Deployment Checklist for Admins
- Run DB migration and confirm tables exist.
- Set all environment variables and restart server/deploy.
- Configure Twilio webhooks with the public domain.
- Generate and set VAPID keys for push.
- Verify email sending by using Resend API with a test email.

## 10) Docker Desktop Runbook

If Docker Desktop is already installed, you can run the app as a containerized service.

Build the image:

```bash
docker build -t the-realest-project .
```

Run with Docker Compose (recommended):

```bash
docker compose up --build
```

Or run the container directly:

```bash
docker run --rm -p 3000:3000 --env-file .env.local the-realest-project
```

The compose file expects `.env.local` at the repo root. Put your Supabase, Twilio, OpenAI, Resend, and VAPID values there before starting the container.

## 11) Contact & Notes
If you want, I can:
- Produce a runnable script to apply the migration using `psql` or the Supabase CLI.
- Create a small test harness to simulate Twilio webhooks and validate DB inserts automatically.

Current repo helpers:
- `scripts/apply-migration-003.mjs`
- `scripts/test-twilio-recording.mjs`

---

Saved to `docs/admin-onboarding.md` in this repository.
