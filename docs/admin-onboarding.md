# EstateFlow CRM: Onboarding Guide for New Organizations

Welcome to **EstateFlow CRM**, the mobile-first powerhouse for real estate teams. This guide will walk you through setting up your organization from scratch.

## 1. Initial Setup (The Onboarding Wizard)
When you first sign up as an Admin, you will be greeted by the Onboarding Wizard. Follow these steps:

### Step 1: Organization Info
- **Org Name**: Your real estate agency name (e.g., "Grand Haven Realty").
- **Industry**: Real Estate (Default).

### Step 2: Admin Profile
- Enter your full name and phone number. This number will be used for system notifications.

### Step 3: Invite Your Team
Add your sales agents and managers early:
- **Sales Managers**: Can view all leads and assign them.
- **Sales Agents**: Can call leads and manage their own pipeline.
- **Field Executives**: Can mark attendance and site visits.
- **Social Media Managers**: Can plan and schedule content.

### Step 4: Connecting the Engine (API Keys)
To make the "Killer Features" work, you need your keys:
- **Twilio**: Required for the Instant Call Bridge and WhatsApp follow-ups.
- **Resend**: Required for sending property brochures via email.
- **OpenAI**: Optional, used for AI call transcription and sentiment analysis.

### Step 5: Configure Lead Sources
Select where your leads come from (MagicBricks, 36 Acre, Facebook Ads, etc.). This ensures the CRM properly categorizes incoming inquiries.

---

## 2. Managing Integrations
Once onboarding is complete, you can always update your secrets:
1. Navigate to **More** → **Integrations**.
2. Click **Manage Secrets in Settings**.
3. Update your Twilio, OpenAI, or Resend keys as your team grows.

## 3. Connecting External Leads (Webhooks)
To automate lead intake from Facebook or your Website:
1. Copy your Webhook URL: `https://your-crm-link.com/api/webhooks/leads`.
2. Use this in Zapier, Make.com, or directly in your lead form backend.
3. Every new lead will automatically trigger a **Round-Robin Assignment** and an **Instant Call Bridge** to the next available agent.

---

## 4. Pro-Tips for Success
- **Stay Logged In**: Enable Push Notifications to get instant alerts the second a new lead hits the system.
- **Use the Map**: Use the Property Inventory map to find homes near a lead's preferred location and share them in one click.
- **Check Attendance**: Ensure field executives "Check-in" on site visits to capture GPS coordinates for verification.
