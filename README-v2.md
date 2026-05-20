# EstateFlow CRM

EstateFlow CRM is a production-ready, mobile-first real estate CRM for lead intake, instant call bridging, property sharing, follow-ups, attendance, social planning, and reporting.

## Quick Start

1. **Install dependencies**: `npm install`
2. **Copy environment variables**: `cp .env.example .env.local` and add Supabase, Twilio, and Resend values
3. **Setup database**: 
   - Run `db/migrations/001_init.sql` in Supabase SQL editor
   - Run `db/migrations/002_security_hardening.sql` to enable Row Level Security
   - Load sample data: `npm run db:seed`
4. **Start the app**: `npm run dev`
5. **Access app**: Open http://localhost:3000

## Core Features

### 🚀 Lead Management
- Manual lead creation and webhook intake from 36 Acre, MagicBricks, Housing, Facebook Ads, etc.
- Automatic round-robin assignment to sales agents
- Complete lead timeline (calls, messages, notes, property shares, follow-ups)
- Recommended properties based on budget/location/type
- Lead export as CSV

### ☎️ Instant Call Bridging
- New leads automatically call the assigned agent
- Agent confirmation triggers lead call
- Both calls bridged into Twilio conference
- Call logs with duration, recording URL, and outcome
- Multi-candidate retry if assigned agent unavailable
- Dry-run mode for local development

### 📸 Property Management
- Full inventory with images, specs, and documents
- One-click property sharing to leads via WhatsApp/SMS/Email
- Public share links accessible without login
- Property gallery with multiple images
- Filter by location, price, type, status

### ✅ Follow-ups
- One-click follow-up creation with predefined templates
- Schedule WhatsApp, SMS, Email, or Call Reminders
- Template variable substitution ({{leadName}}, {{propertyTitle}}, etc.)
- Recurring follow-ups (One-time, Daily, Weekly, Monthly)
- Follow-up status tracking (Open, Completed, Snoozed)

### 📍 Attendance Tracking
- GPS check-in/out with high accuracy
- Optional selfie upload for field executives
- Daily attendance history with duration
- Admin dashboard showing team check-in status
- Attendance export as CSV

### 📱 Social Media Planning
- Content calendar for Instagram, Facebook, LinkedIn
- Post drafting, scheduling, and publishing
- Status tracking (Idea, Draft, Scheduled, Published)
- Ready for future integration with social platforms

### 📊 Dashboard & Reports
- Real-time metrics (new leads, calls, follow-ups, hot leads, inventory, team attendance)
- Leads by source, status, and conversion rates
- Agent performance analytics
- Won/lost leads tracking
- Attendance summary
- Export reports as CSV

### 🛡️ Security & Organization Scoping
- Supabase Auth with magic links
- Row Level Security policies for organization isolation
- Role-based access control (Admin, Sales Manager, Sales Agent, Field Executive, Social Media Manager)
- Team member invitations
- All data scoped by organization

### 📤 Data Export
- Export leads as CSV (filtered by date, status, source)
- Export properties as CSV (filtered by type, status)
- Export attendance records as CSV
- Dashboard export with metrics

### 🎯 Onboarding for New Users
- Step-by-step setup wizard for new organizations
- Organization creation and configuration
- Team member invitation
- API key configuration (Twilio, Resend, OpenAI)
- Lead source selection
- Review and completion

## Documentation

- **[Product Requirements](docs/prd.md)**: Complete feature specifications
- **[Design System](docs/design.md)**: UI/UX principles and components
- **[Tech Stack](docs/tech-stack.md)**: Technology inventory with versions
- **[Deployment Guide](docs/deployment.md)**: Supabase, Twilio, Vercel setup
- **[Testing Checklist](TESTING_CHECKLIST.md)**: Comprehensive testing guide
- **[Reference](docs/reference.md)**: Index of all documentation

## Architecture

**Frontend**: Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn/ui
**Backend**: Next.js Server Actions & API Routes
**Database**: Supabase Postgres with Row Level Security
**Authentication**: Supabase Auth with magic links
**Voice**: Twilio Voice API
**Messaging**: Twilio SMS/WhatsApp
**Email**: Resend or SMTP
**Storage**: Supabase Storage for property images/documents
**Hosting**: Vercel

## Service Architecture

All external integrations are abstracted into service adapters:
- `callService`: Twilio voice bridging
- `messageService`: SMS/WhatsApp messaging
- `emailService`: Email delivery
- `leadAssignmentService`: Round-robin assignment
- `propertyShareService`: Property sharing and activity logging
- `attendanceService`: Check-in/out GPS tracking
- `socialPostService`: Social media content management
- `aiService`: AI message drafting (placeholder)

All services support dry-run mode for local development without actual API calls.

## Environment Variables

Create `.env.local` with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Twilio (optional for dry-run mode)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token

# Resend (optional for email)
RESEND_API_KEY=your_resend_key

# Development
DRY_RUN=true  # Set to true for local development without real API calls
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Helpful Commands

```bash
# Development
npm run dev          # Start development server at http://localhost:3000

# Build & Deploy
npm run build        # Create production build
npm start           # Start production server
npm run lint        # Run ESLint

# Database
npm run db:seed     # Load seed data (requires local Postgres or connect to Supabase)
```

## Webhook Integration

**Endpoint**: `POST /api/webhooks/leads`

Accept leads from external platforms:

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

## Testing

Comprehensive testing checklist available in [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) covering:
- Authentication & authorization
- Lead management end-to-end
- Call bridge automation
- Property sharing
- Follow-up system
- Attendance tracking
- Social media scheduling
- Reports and exports
- Mobile responsiveness
- Data security & organization scoping

## Deployment

See [docs/deployment.md](docs/deployment.md) for detailed Supabase, Twilio, and Vercel setup instructions.

## Support & License

This platform is ready for commercial sale and deployment. All core features are implemented with production-grade architecture and security.

**Version**: 1.0.0 (Production Ready)
**Last Updated**: May 2026
