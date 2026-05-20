# Product Requirements Document

## Product Name
EstateFlow CRM

## Summary
EstateFlow CRM is a mobile-first real estate CRM for managing leads, instant call bridging, property sharing, follow-ups, attendance, social planning, and reporting from one cloud app.

## Primary Users
- Admin / Business Owner
- Sales Manager
- Sales Agent
- Field Executive
- Social Media Manager

## Core Goals
- Capture leads from webhooks and manual entry.
- Auto-assign leads and bridge calls immediately.
- Let agents share properties and follow up in one tap.
- Track attendance for field teams.
- Provide reports and operational visibility for management.

## Functional Requirements
- Auth, roles, and organization-scoped access.
- Dashboard with lead, call, inventory, attendance, and activity metrics.
- Lead CRUD, filtering, detail page, and timeline.
- Property CRUD, gallery, and public share links.
- Follow-up scheduling, messaging, and completion tracking.
- Attendance check-in/out with geolocation and optional selfie upload.
- Social media planning with content calendar.
- Admin settings for integrations and secrets.
- Reports for lead sources, status, won/lost, attendance, and sharing.

## Non-Functional Requirements
- Mobile-first UX with large tap targets and bottom navigation.
- Cloud-ready deployment on Vercel and Supabase.
- Secure secret handling and row-level isolation.
- Dry-run support for local development.
