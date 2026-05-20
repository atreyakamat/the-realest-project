'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';
import { Check } from 'lucide-react';

interface Step5Props {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
}

const AVAILABLE_SOURCES = [
  { id: '36_acre', label: '36 Acre', color: 'emerald' },
  { id: 'magicbricks', label: 'MagicBricks', color: 'blue' },
  { id: 'housing', label: 'Housing.com', color: 'orange' },
  { id: 'facebook', label: 'Facebook Ads', color: 'blue' },
  { id: 'instagram', label: 'Instagram Ads', color: 'pink' },
  { id: 'website', label: 'Website Form', color: 'slate' },
  { id: 'whatsapp', label: 'WhatsApp', color: 'green' },
  { id: 'referral', label: 'Referral', color: 'purple' },
  { id: 'manual', label: 'Manual Entry', color: 'amber' },
];

export function OnboardingStep5LeadSources({ data, onComplete }: Step5Props) {
  const [selected, setSelected] = React.useState(data.leadSources);

  const toggleSource = (sourceId: string) => {
    if (selected.includes(sourceId)) {
      setSelected(selected.filter((s) => s !== sourceId));
    } else {
      setSelected([...selected, sourceId]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onComplete({ leadSources: selected });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-white">Lead Sources</h2>
        <p className="text-sm text-slate-400">Select the channels where your leads typically come from.</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {AVAILABLE_SOURCES.map((source) => (
          <button
            key={source.id}
            type="button"
            onClick={() => toggleSource(source.id)}
            className={`rounded-lg border-2 p-4 text-left transition-all ${
              selected.includes(source.id)
                ? 'border-emerald-400 bg-emerald-400/10'
                : 'border-white/10 bg-white/5 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{source.label}</span>
              {selected.includes(source.id) && (
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400">
                  <Check className="h-3 w-3 text-slate-950" />
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-blue-300">Tracking:</span> The CRM will automatically categorize leads by source, helping you measure which channels are most effective.
        </p>
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
