# Deployment Guide

## Local Development
1. Copy `.env.example` to `.env.local`.
2. Fill in Supabase, Twilio, and Resend values.
3. Run `npm install`.
4. Run `npm run dev`.

## Supabase Setup
1. Create a Supabase project.
2. Apply `db/migrations/001_init.sql`.
3. Load sample data with `npm run db:seed` or the Supabase SQL editor.
4. Confirm auth, storage, and row-level security settings.

## Vercel Setup
1. Import the repository into Vercel.
2. Add the environment variables from `.env.example`.
3. Set production URLs for `NEXT_PUBLIC_APP_URL` and webhook destinations.
4. Deploy the app and validate login plus webhook flows.

## Twilio Setup
1. Configure the Voice number and WhatsApp/SMS sender.
2. Add account SID and auth token to environment variables.
3. Keep `DRY_RUN=1` for local development until ready to place real calls.

## Webhook Testing
Example curl:
```bash
curl -X POST http://localhost:3000/api/webhooks/leads \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Rahul Sharma",
    "phone": "+919999999999",
    "email": "rahul@example.com",
    "source": "36 Acre",
    "propertyType": "Apartment",
    "budgetMin": 7500000,
    "budgetMax": 12000000,
    "preferredLocation": "Gurgaon",
    "notes": "Looking for 3BHK near Golf Course Road"
  }'
```

## Verification Checklist
- Sign in as admin.
- Create or invite a team member.
- Post a webhook lead and confirm assignment.
- Confirm the call bridge runs in dry-run mode locally.
- Check that reports and attendance load without errors.
