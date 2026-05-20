# EstateFlow CRM

EstateFlow CRM is a production-ready, mobile-first real estate CRM for lead intake, instant call bridging, property sharing, follow-ups, attendance, social planning, and reporting.

## Quick Start

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and add Supabase, Twilio, and Resend values.
3. Run the schema in `db/migrations/001_init.sql`, then load sample data with `npm run db:seed`.
4. Start the app with `npm run dev`.

## Documentation

The project docs live in `docs/reference.md` and point to the product, design, tech stack, and deployment guides.

## Core Modules

- Lead management with webhook intake and timeline history.
- Twilio voice bridge automation with dry-run support.
- Property inventory, galleries, and one-click sharing.
- Follow-ups, attendance, social planning, and reports.
- Supabase Auth, roles, and organization-scoped data access.

## Environment

Use `.env.example` as the source of truth for runtime variables. Secrets should live in environment variables or Supabase secret storage, not in client-side code.

## Helpful Commands

- `npm run dev` to run the app locally.
- `npm run build` to verify the production build.
- `npm run db:seed` to apply the schema and seed data with a local Postgres connection.
