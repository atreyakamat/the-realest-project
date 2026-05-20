# EstateFlow CRM

Production-ready mobile-first Real Estate CRM built with Next.js 15, Supabase, and Twilio.

## Features

- **Lead Management:** Mobile-first lead tracking with source attribution and status management.
- **Instant Call Bridge:** Automated agent-to-lead call bridging using Twilio Voice.
- **One-Click Actions:** Send WhatsApp follow-ups and property details in one click.
- **Property Inventory:** Complete inventory management with recommended properties for leads.
- **Attendance System:** GPS-based check-in/out for field staff.
- **Content Calendar:** Simple social media planning for marketing teams.
- **Performance Reports:** Dashboard and reporting modules for business owners.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide Icons.
- **Backend:** Next.js API Routes & Server Actions.
- **Database:** Supabase (Postgres) with Row Level Security.
- **Communications:** Twilio (Voice/WhatsApp/SMS), Resend (Email).

## Getting Started

### 1. Prerequisites
- Node.js 20+
- Supabase Account
- Twilio Account (SID, Auth Token, Phone Number)
- Resend Account (API Key)

### 2. Environment Setup
Create a `.env` file based on `.env.example`:
```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
RESEND_API_KEY=...
DRY_RUN=1 # Enable for local testing without real calls/SMS
```

### 3. Database Setup
Run the SQL migrations in `db/migrations/001_init.sql` using the Supabase SQL Editor.
Run the seed data in `db/seeds/seed.sql`.

### 4. Installation
```bash
npm install
npm run dev
```

## Architecture

- `src/app`: Next.js pages and API routes.
- `src/components`: UI components (Mobile-first).
- `src/lib`: Supabase client, data fetching, and utilities.
- `src/services`: External API adapters (Twilio, Resend).
- `src/app/actions.ts`: Server actions for side-effects (Calls, Attendance).

## Webhook Intake
External platforms can send leads to:
`POST /api/webhooks/leads`
Payload:
```json
{
  "fullName": "John Doe",
  "phone": "+919999999999",
  "source": "Facebook Ads",
  "propertyType": "Villa"
}
```

## License
MIT
