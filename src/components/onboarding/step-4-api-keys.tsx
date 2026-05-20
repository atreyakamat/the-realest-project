'use client';

import * as React from 'react';
import { Button, Input } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';
import { AlertCircle } from 'lucide-react';

interface Step4Props {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
}

export function OnboardingStep4ApiKeys({ data, onComplete }: Step4Props) {
  const [keys, setKeys] = React.useState(data.apiKeys);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ apiKeys: keys });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-white">Configure API Keys</h2>
        <p className="text-sm text-slate-400">These keys enable call bridging, SMS/WhatsApp, and email features.</p>
      </div>

      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/5 p-4">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-300" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Getting API Keys</p>
            <ul className="mt-2 list-inside space-y-1 text-xs text-slate-300">
              <li>• Twilio: Sign up at twilio.com</li>
              <li>• Resend: Sign up at resend.com for email</li>
              <li>• OpenAI: Get from platform.openai.com</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Twilio Account SID</span>
            <Input
              name="twilio_account_sid"
              value={keys.twilio_account_sid}
              onChange={handleChange}
              placeholder="AC..."
              type="password"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Twilio Auth Token</span>
            <Input
              name="twilio_auth_token"
              value={keys.twilio_auth_token}
              onChange={handleChange}
              placeholder="Your auth token"
              type="password"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Twilio Phone Number</span>
            <Input
              name="twilio_phone_number"
              value={keys.twilio_phone_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">WhatsApp Sender Number</span>
            <Input
              name="whatsapp_sender_number"
              value={keys.whatsapp_sender_number}
              onChange={handleChange}
              placeholder="+1 (555) 000-0000"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">Resend API Key</span>
            <Input
              name="resend_api_key"
              value={keys.resend_api_key}
              onChange={handleChange}
              placeholder="re_..."
              type="password"
            />
          </label>
        </div>

        <div>
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-200">OpenAI API Key</span>
            <Input
              name="openai_api_key"
              value={keys.openai_api_key}
              onChange={handleChange}
              placeholder="sk-..."
              type="password"
            />
          </label>
        </div>
      </div>

      <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-blue-300">Skip for now:</span> You can add these keys later in Admin Settings. The app will work in demo mode without them.
        </p>
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
