# Twilio Real-Call Testing & Deployment Guide

## Overview
This guide explains how to test the Twilio "Bridge Call" functionality with real phone calls and ensure the recording callbacks are correctly handled by the application.

## Prerequisites
1. **Twilio Account**: You need an active Twilio account with a purchased phone number.
2. **OpenAI Account**: Required for call transcription (Whisper) and analysis (GPT-4).
3. **Supabase**: A Supabase project for database storage (calls, activities, tasks, AI insights).
4. **Public URL**: Twilio must be able to reach your application via HTTPS.
   - **Local Development**: Use `ngrok` or similar to tunnel your local server.
   - **Production**: A deployed URL (e.g., Vercel, Railway).

## Environment Configuration
Ensure the following environment variables are set in your `.env.local` (for local testing) or in your production environment:

| Variable | Description | Example |
| :--- | :--- | :--- |
| `TWILIO_ACCOUNT_SID` | Your Twilio Account SID | `AC...` |
| `TWILIO_AUTH_TOKEN` | Your Twilio Auth Token | `...` |
| `TWILIO_PHONE_NUMBER` | Your Twilio Phone Number (E.164 format) | `+1234567890` |
| `OPENAI_API_KEY` | Your OpenAI API Key | `sk-...` |
| `NEXT_PUBLIC_APP_URL` | The public URL of your app (used for callbacks) | `https://your-ngrok-subdomain.ngrok-free.app` |
| `DRY_RUN` | Set to `0` to enable real calls | `0` |
| `SUPABASE_URL` | Your Supabase project URL | `https://xyz.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Service Role Key (for background processing) | `...` |

## Local Testing with ngrok
1. Start your local development server:
   ```bash
   npm run dev
   ```
2. Start ngrok on port 3000:
   ```bash
   ngrok http 3000
   ```
3. Copy the ngrok URL (e.g., `https://abcd-123-456.ngrok-free.app`).
4. Update `NEXT_PUBLIC_APP_URL` in your `.env.local` with this URL.
5. Restart your dev server if needed.

## Triggering a Real Call
1. Navigate to a Lead details page in the application.
2. Ensure the **Agent Phone** and **Lead Phone** are valid numbers you can answer.
3. Click the **"Call"** button.
4. The application will trigger `initiateCall` which calls `bridgeCall` in `src/services/callService.ts`.
5. Twilio will call the **Agent Phone** first.
6. Once the Agent answers, Twilio will call the **Lead Phone**.
7. Both parties will be bridged into a conference.

## Verifying Recording & AI Analysis
1. Once the call ends, Twilio will wait for the recording to be processed.
2. Twilio will POST to `${NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/recording`.
3. The application will:
   - Download and transcribe the recording using **OpenAI Whisper**.
   - Analyze the transcript using **GPT-4o-mini**.
   - Update the `calls` table in Supabase.
   - Insert AI insights (summary, sentiment, follow-up tasks) into `call_ai_insights`.
   - Create automated tasks and activities for the lead based on the conversation.

## Troubleshooting
- **Webhook Failures**: Check the Twilio Console (Monitor > Logs > Error Logs) for callback errors.
- **Recording not found**: It can take a few seconds for Twilio recordings to be available after a call ends.
- **AI Analysis Errors**: Check the application logs for OpenAI API errors or JSON parsing issues.

## Automated Testing Script
You can simulate a Twilio callback using the provided test script:
```bash
node scripts/test-twilio-recording.mjs \
  --base-url https://your-ngrok-subdomain.ngrok-free.app \
  --org-id <YOUR_ORG_ID> \
  --lead-id <YOUR_LEAD_ID> \
  --recording-url <URL_TO_AUDIO_FILE>
```
