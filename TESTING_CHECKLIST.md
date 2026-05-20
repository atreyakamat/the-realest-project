# EstateFlow CRM - Comprehensive Testing Checklist

This document provides a complete testing checklist to validate all functionality of the EstateFlow CRM platform before deployment.

## 1. Authentication & Authorization

### Login Flow
- [ ] User can navigate to `/login`
- [ ] User can enter email and receive magic link
- [ ] Magic link redirects to `/auth/callback`
- [ ] New user without organization is redirected to `/onboarding`
- [ ] Existing user is redirected to dashboard `/`
- [ ] User can sign out using the navigation menu

### Role-Based Access Control
- [ ] Admin can access all pages (Dashboard, Leads, Properties, Follow-ups, Reports, Settings, etc.)
- [ ] Sales Manager can access Leads, Properties, Follow-ups, Reports
- [ ] Sales Agent can access assigned Leads, Properties, Follow-ups
- [ ] Field Executive can access Attendance, Lead detail page
- [ ] Social Media Manager can access Social module
- [ ] Unauthenticated users are redirected to login

## 2. Onboarding Flow

### Organization Setup
- [ ] New user sees 6-step onboarding wizard
- [ ] Step 1: Can enter organization name and industry
- [ ] Step 2: Can enter admin full name and phone
- [ ] Step 3: Can add team members with roles (Sales Manager, Sales Agent, Field Executive, Social Media Manager)
- [ ] Step 3: Can remove team members from the list
- [ ] Step 4: Can enter/skip API keys (Twilio, Resend, OpenAI)
- [ ] Step 5: Can select lead sources from available options
- [ ] Step 6: Can review all settings before completion
- [ ] On completion, organization is created in database
- [ ] Admin profile is updated with organization_id
- [ ] Integration settings are saved
- [ ] Team members receive invitations (if configured)
- [ ] User is redirected to dashboard after completion

## 3. Dashboard

### Display
- [ ] Dashboard shows welcome message with user name
- [ ] New Leads card shows count for today
- [ ] Calls Made card shows count for today
- [ ] Follow-ups Due card shows count for today
- [ ] Hot Leads card shows count
- [ ] Inventory card shows available properties
- [ ] Team Attendance card shows check-in count
- [ ] Recent Activity feed shows last 10 activities
- [ ] All data is organization-scoped

### Quick Actions
- [ ] User can click "+" button to create new lead
- [ ] User can click "Search" button (functional or shows search UI)
- [ ] Dashboard is mobile-responsive

### Export
- [ ] Dashboard has export button
- [ ] Export button downloads data in CSV format
- [ ] Exported CSV contains proper headers and data

## 4. Lead Management

### Lead Listing
- [ ] All leads for organization are displayed
- [ ] Leads can be filtered by status (New, Contacted, Interested, Site Visit Scheduled, Negotiation, Won, Lost, Not Responding)
- [ ] Leads can be filtered by source (36 Acre, MagicBricks, Housing, Facebook, Instagram, Website, Referral, Manual, Other)
- [ ] Leads can be filtered by temperature (Cold, Warm, Hot)
- [ ] Leads can be filtered by agent
- [ ] Search by name/phone works
- [ ] Leads are paginated or have infinite scroll
- [ ] Each lead card shows name, phone, status, temperature, and assigned agent

### Lead Creation
- [ ] User can navigate to `/leads/new`
- [ ] User can create a lead with:
  - [ ] Full name
  - [ ] Phone number
  - [ ] Email
  - [ ] Source
  - [ ] Property type
  - [ ] Budget range
  - [ ] Preferred location
  - [ ] Notes
- [ ] Lead is saved to database with organization_id
- [ ] Created lead appears in leads list
- [ ] Validation errors are displayed for required fields

### Lead Detail Page
- [ ] User can click on a lead to view details
- [ ] Lead detail shows all fields (name, phone, email, source, status, temperature, notes)
- [ ] Lead detail shows timeline of all activities:
  - [ ] Call logs with duration and outcome
  - [ ] Messages sent (SMS/WhatsApp/Email)
  - [ ] Notes added
  - [ ] Property shares
  - [ ] Follow-ups created/completed
- [ ] Timeline is reverse-chronological (newest first)
- [ ] User can mark lead as hot (change temperature)
- [ ] User can change lead status (dropdown)
- [ ] User can reassign lead to different agent (dropdown)
- [ ] User can add notes to lead

### Quick Actions
- [ ] User can click "Call" to trigger call bridge
- [ ] User can click "Message" to send WhatsApp/SMS
- [ ] User can click "Share Property" to send property link
- [ ] User can click "Assign" to change agent

### Lead Export
- [ ] User can export leads as CSV
- [ ] Export includes all lead fields
- [ ] Export can be filtered by date range, status, or source
- [ ] Downloaded file has proper filename with date

## 5. Webhook Lead Intake

### Webhook Configuration
- [ ] Admin can configure webhook in settings
- [ ] Webhook URL is `/api/webhooks/leads`
- [ ] Webhook accepts POST requests with lead data
- [ ] Webhook validates incoming data with Zod schema

### Lead Creation via Webhook
- [ ] External system can send lead via webhook
- [ ] Lead is created in database with all fields:
  ```json
  {
    "fullName": "Test Lead",
    "phone": "+911234567890",
    "email": "test@example.com",
    "source": "36 Acre",
    "propertyType": "Apartment",
    "budgetMin": 5000000,
    "budgetMax": 10000000,
    "preferredLocation": "Mumbai",
    "notes": "Test lead from webhook"
  }
  ```
- [ ] Lead is assigned to agent using round-robin logic
- [ ] Lead is created with "New" status
- [ ] Activity log is created for webhook intake

### Call Bridge Automation
- [ ] After webhook lead creation, system attempts to call assigned agent
- [ ] Agent receives call with message: "New real estate lead from [source]. Press any key to connect."
- [ ] When agent presses key, lead is called
- [ ] Both calls are bridged into Twilio conference
- [ ] Call is logged in database with:
  - [ ] call_sid
  - [ ] conference_sid
  - [ ] status
  - [ ] started_at
  - [ ] ended_at (if available)
  - [ ] duration
  - [ ] recording_url (if available)
  - [ ] outcome

### Fallback Logic
- [ ] If assigned agent doesn't answer, system tries next available agent
- [ ] If all agents unavailable, lead is marked as "Call Pending"
- [ ] Sales manager is notified of pending call
- [ ] Follow-up task is created

### Dry-Run Mode
- [ ] In local development with DRY_RUN=true, no actual Twilio calls are placed
- [ ] Webhook still creates lead in database
- [ ] Call logs are created with simulated data
- [ ] Proper logging shows dry-run messages

## 6. Property Management

### Property Listing
- [ ] All properties for organization are displayed
- [ ] Properties can be filtered by status (Available, Hold, Sold, Rented)
- [ ] Properties can be filtered by type (Apartment, Villa, Plot, Commercial, Rental)
- [ ] Properties can be filtered by location
- [ ] Properties can be filtered by price range
- [ ] Search by title/location works
- [ ] Each property card shows:
  - [ ] Title
  - [ ] Location
  - [ ] Price
  - [ ] Bedrooms/Bathrooms
  - [ ] Status badge
  - [ ] First property image (if available)

### Property Creation
- [ ] User can navigate to `/properties/new`
- [ ] User can create a property with:
  - [ ] Title
  - [ ] Location
  - [ ] Address
  - [ ] Property type
  - [ ] Price
  - [ ] Size
  - [ ] Bedrooms
  - [ ] Bathrooms
  - [ ] Floor
  - [ ] Furnishing status
  - [ ] Availability status
  - [ ] Description
  - [ ] Amenities
  - [ ] Owner info
  - [ ] Tags
  - [ ] Units available
  - [ ] Property images (upload multiple)
- [ ] Property images are displayed in gallery
- [ ] Property is saved with organization_id
- [ ] Images are stored in Supabase Storage

### Property Detail Page
- [ ] User can click on property to view details
- [ ] Property detail shows all fields
- [ ] Property gallery shows all uploaded images
- [ ] User can view full-size images
- [ ] User can see property documents (if available)
- [ ] User can see matched leads (leads with matching budget/location/type)
- [ ] User can share property with lead (one-click)

### Property Export
- [ ] User can export properties as CSV
- [ ] Export includes all property fields
- [ ] Exported file has proper filename with date

## 7. Property Sharing

### Share with Lead
- [ ] User can select "Share Property" on lead detail
- [ ] Share dialog appears with property list
- [ ] User can select a property to share
- [ ] User can select communication channel (WhatsApp, SMS, Email)
- [ ] On submit:
  - [ ] Activity log is created with "property_share" type
  - [ ] lead_property_shares entry is created in database
  - [ ] Message is sent to lead with property details and share link
  - [ ] Share link is public and accessible without login
  - [ ] Success message is shown to user

### Public Share Link
- [ ] Public share link is accessible at `/share/properties/[id]`
- [ ] Link displays full property details (without login required)
- [ ] Link shows property gallery
- [ ] Link shows all property information (price, specs, amenities, owner info)
- [ ] Link includes CTA button to contact agent
- [ ] Link is mobile-responsive

## 8. Follow-ups

### Follow-up Creation
- [ ] User can create a follow-up from lead detail page
- [ ] Follow-up form shows:
  - [ ] Follow-up type (WhatsApp, SMS, Call Reminder, Email)
  - [ ] Predefined template options
  - [ ] Custom message field
  - [ ] Scheduled datetime picker
  - [ ] Recurrence options (One-time, Daily, Weekly, Monthly)
- [ ] Follow-up is saved to database
- [ ] Activity log is created

### Follow-up Templates
- [ ] Default templates are available:
  - [ ] "Hi {{leadName}}, just checking if you had a chance to review the property details I shared."
  - [ ] "Hi {{leadName}}, are you available for a quick call today to discuss properties in {{preferredLocation}}?"
  - [ ] "Hi {{leadName}}, we have a few new options matching your budget. Should I share them?"
- [ ] User can select template
- [ ] Template variables are replaced with actual lead data
- [ ] User can customize template before sending

### Follow-up Sending
- [ ] User can send follow-up immediately from follow-up page
- [ ] Follow-up form shows option to send now or schedule
- [ ] On send, message is delivered via selected channel (WhatsApp/SMS/Email)
- [ ] Message is logged in activities
- [ ] Follow-up is marked as "Completed" if sent immediately
- [ ] Follow-up shows "Scheduled" status if scheduled for future

### Follow-up Management
- [ ] Follow-ups due today are highlighted
- [ ] User can mark follow-up as completed
- [ ] User can snooze follow-up to later date/time
- [ ] User can reschedule follow-up
- [ ] Completed follow-ups show completion timestamp
- [ ] Snoozed follow-ups reappear when time comes

### Follow-up Export
- [ ] User can export follow-ups as CSV
- [ ] Export shows lead name, follow-up type, message, date, status

## 9. Attendance Tracking

### Check-In/Check-Out
- [ ] User can navigate to `/attendance`
- [ ] Attendance page shows:
  - [ ] Check-in button (if not checked in)
  - [ ] Check-out button (if checked in)
  - [ ] Attendance history with check-in/out times
  - [ ] Current status indicator
- [ ] On check-in:
  - [ ] GPS location is captured (lat/lng)
  - [ ] Optional selfie can be uploaded
  - [ ] Notes can be added
  - [ ] Timestamp is recorded
  - [ ] Attendance record is created in database
- [ ] On check-out:
  - [ ] GPS location is captured
  - [ ] Check-out timestamp is recorded
  - [ ] Attendance record is updated
  - [ ] Duration is calculated

### Attendance History
- [ ] Attendance page shows list of today's and past check-ins/outs
- [ ] Each record shows:
  - [ ] Employee name
  - [ ] Check-in time
  - [ ] Check-out time (if available)
  - [ ] Duration
  - [ ] Status (On-site, Left)
  - [ ] Notes
- [ ] Records can be filtered by date
- [ ] Records can be filtered by user

### Admin Attendance Dashboard
- [ ] Admin can view attendance for all team members
- [ ] Can see who is currently checked in
- [ ] Can see daily/weekly attendance summary
- [ ] Can download attendance report as CSV

## 10. Social Media Module

### Post Creation
- [ ] User can navigate to `/social`
- [ ] Social page shows:
  - [ ] Post creation form
  - [ ] Calendar view of posts
  - [ ] Draft/Scheduled/Published counters
  - [ ] Post list with status indicators
- [ ] User can create post with:
  - [ ] Title
  - [ ] Caption
  - [ ] Post type (Instagram Reel, Instagram Post, Facebook Post, LinkedIn Post, Story)
  - [ ] Status (Idea, Draft, Scheduled, Published)
  - [ ] Scheduled datetime (if applicable)
  - [ ] Media upload (image/video)
  - [ ] Tags/hashtags
- [ ] Post is saved to database
- [ ] Activity log is created

### Post Management
- [ ] User can view all posts with status filters
- [ ] User can edit draft/scheduled posts
- [ ] User can mark post as published
- [ ] User can delete posts
- [ ] Scheduled posts can be edited until publish time
- [ ] Published posts show publish timestamp

### Post Scheduling
- [ ] User can schedule post for future date/time
- [ ] Post shows "Scheduled" status until publish time
- [ ] On scheduled time, post status changes to "Published" (or webhook sent if integrated)
- [ ] User receives notification when scheduled post is published

### Analytics (Future)
- [ ] Social page has placeholder for post analytics
- [ ] UI shows where analytics will be displayed

## 11. Reports

### Dashboard Metrics
- [ ] Reports page shows:
  - [ ] New leads today
  - [ ] Follow-ups due
  - [ ] Hot leads count
  - [ ] Available inventory count

### Lead Source Breakdown
- [ ] Shows lead count by source (36 Acre, MagicBricks, Housing, Facebook, etc.)
- [ ] Shows conversion rate by source
- [ ] Shows average budget by source
- [ ] Data is organization-scoped

### Lead Status Breakdown
- [ ] Shows count of leads by status (New, Contacted, Interested, Won, Lost, etc.)
- [ ] Shows conversion funnel (New → Contacted → Interested → Won)

### Agent Performance
- [ ] Shows calls made per agent (today/week/month)
- [ ] Shows leads assigned per agent
- [ ] Shows conversion rate per agent
- [ ] Shows average call duration per agent

### Won/Lost Leads
- [ ] Shows count of won leads (today/week/month)
- [ ] Shows count of lost leads
- [ ] Shows win rate
- [ ] Shows average deal value for won leads

### Attendance Summary
- [ ] Shows check-in rate by date
- [ ] Shows list of who's checked in today
- [ ] Shows late arrivals

### Export Reports
- [ ] User can export report data as CSV
- [ ] User can export report as PDF (prints formatted report)

## 12. Settings & Integrations

### Integration Configuration
- [ ] User can navigate to `/settings`
- [ ] Settings page shows integration settings form with fields for:
  - [ ] Assignment mode (Round Robin, Manual, Least Busy Agent)
  - [ ] Lead webhook secret
  - [ ] Twilio Account SID
  - [ ] Twilio Auth Token
  - [ ] Twilio phone number
  - [ ] WhatsApp sender number
  - [ ] Resend API key
  - [ ] SMTP settings (host, port, user, password)
  - [ ] OpenAI API key
- [ ] User can save settings
- [ ] Settings are stored in integration_settings table
- [ ] Secrets are marked as "Secret" in the UI

### Integration Status
- [ ] Settings page shows configured integrations
- [ ] Each integration shows if it's configured or not
- [ ] Secrets are masked in UI (never displayed in plaintext)

## 13. Team Management

### Team Member List
- [ ] Admin can navigate to `/team`
- [ ] Team page shows all team members for organization
- [ ] Each member shows:
  - [ ] Name
  - [ ] Email
  - [ ] Role
  - [ ] Status (Active/Inactive)
  - [ ] Last assigned (for sales agents)

### Invite Team Members
- [ ] Admin can invite new team members from team page or onboarding
- [ ] Invite form shows:
  - [ ] Email address
  - [ ] Full name
  - [ ] Role dropdown (Sales Manager, Sales Agent, Field Executive, Social Media Manager)
- [ ] On invite, Supabase sends invitation email to new member
- [ ] Invited member receives email with login link
- [ ] New member can accept invite and set up profile

## 14. Mobile Responsiveness

### Navigation
- [ ] Bottom navigation bar is visible on mobile
- [ ] Navigation items are easily tappable (large tap targets)
- [ ] Mobile nav shows: Dashboard, Leads, Properties, Follow-ups, More

### Lead List
- [ ] Lead cards stack properly on mobile
- [ ] Lead list is scrollable
- [ ] Filters are accessible (may be in collapsed menu)
- [ ] Lead detail page is readable on mobile

### Forms
- [ ] All forms are mobile-friendly
- [ ] Input fields are large enough for touch
- [ ] Buttons are properly sized for mobile
- [ ] Keyboard is properly managed (doesn't cover inputs)

### Tables/Lists
- [ ] Tables reflow to single column on mobile
- [ ] Data is readable and accessible on mobile screens

## 15. Data Security & Organization Scoping

### Row Level Security
- [ ] Users can only see data from their organization
- [ ] Admin user from org A cannot see org B's data
- [ ] Leads from org A are not visible to users in org B
- [ ] Properties from org A are not visible to org B
- [ ] RLS policies are enforced at database level

### API Security
- [ ] API routes check user organization before returning data
- [ ] Unauthorized users receive 401 errors
- [ ] Cross-organization data access is prevented

## 16. Build & Deployment

### Production Build
- [ ] `npm run build` completes successfully
- [ ] No TypeScript errors
- [ ] All 21 routes compile
- [ ] Build time is reasonable (~25 seconds)

### Database Migrations
- [ ] Migration 001_init.sql creates all required tables
- [ ] Migration 002_security_hardening.sql adds RLS policies
- [ ] Migrations can be run without conflicts
- [ ] All tables have org_scoped access control

### Environment Variables
- [ ] `.env.local` contains all required variables:
  - [ ] NEXT_PUBLIC_SUPABASE_URL
  - [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY
  - [ ] SUPABASE_SERVICE_ROLE_KEY
  - [ ] TWILIO_ACCOUNT_SID (optional for dry-run)
  - [ ] TWILIO_AUTH_TOKEN (optional for dry-run)
  - [ ] DRY_RUN=true (for local development)

## 17. End-to-End Workflows

### Complete Lead Workflow
- [ ] Lead comes in via webhook
- [ ] System assigns to agent
- [ ] System calls agent, then leads agent calls lead
- [ ] Agent sends property photos to lead
- [ ] Agent schedules follow-up
- [ ] Follow-up is sent on scheduled time
- [ ] Admin can see full activity timeline for lead
- [ ] Admin can export lead with full history

### Lead Conversion Workflow
- [ ] Sales agent views assigned leads
- [ ] Agent calls lead
- [ ] Agent sends property details
- [ ] Agent schedules site visit
- [ ] Field executive marks attendance at site
- [ ] Agent marks lead as won
- [ ] Lead appears in won/lost reports

## 18. Error Handling & Edge Cases

### Network Errors
- [ ] Form submission shows appropriate error message if network fails
- [ ] User can retry without re-entering data
- [ ] Toasts/notifications show errors clearly

### Validation Errors
- [ ] Invalid email shows validation error
- [ ] Invalid phone number shows error
- [ ] Empty required fields show error
- [ ] Error messages are clear and actionable

### Missing Data
- [ ] Pages handle empty states gracefully
- [ ] "No leads" shows helpful CTA to create one
- [ ] "No properties" shows helpful CTA to create one
- [ ] Missing images in gallery don't break layout

### Edge Cases
- [ ] Very long names don't break layout
- [ ] Very long notes are truncated appropriately
- [ ] Large lead lists load without hang
- [ ] Multiple team members assigned to same lead works
- [ ] Concurrent check-in/out from same user is handled

## 19. Performance

### Load Times
- [ ] Dashboard loads in < 2 seconds
- [ ] Lead list loads in < 1 second
- [ ] Properties list loads in < 1 second
- [ ] Reports generate in < 2 seconds

### Database Queries
- [ ] Queries use indexes appropriately
- [ ] Large datasets (1000+ leads) load efficiently
- [ ] No N+1 query problems

## 20. Accessibility

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order makes sense
- [ ] Focus indicators are visible

### Screen Readers
- [ ] Form labels are properly associated
- [ ] Links have descriptive text
- [ ] Images have alt text
- [ ] Color is not the only way to convey information

---

## Testing Sign-Off

- [ ] All test cases completed
- [ ] No critical issues remaining
- [ ] No high-priority issues remaining
- [ ] Platform is ready for commercial deployment

**Tested By**: _________________
**Date**: _________________
**Notes**: ________________________________________________________________

