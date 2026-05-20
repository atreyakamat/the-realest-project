'use client';

import * as React from 'react';
import { Button, Input, Select } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';

interface Step1Props {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
}

export function OnboardingStep1OrgInfo({ data, onComplete }: Step1Props) {
  const [formData, setFormData] = React.useState({
    orgName: data.orgName,
    orgIndustry: data.orgIndustry,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.orgName.trim()) {
      onComplete({
        orgName: formData.orgName,
        orgIndustry: formData.orgIndustry,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-white">Welcome to EstateFlow CRM</h2>
        <p className="text-sm text-slate-400">Let&apos;s set up your organization in a few simple steps.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Organization Name *</span>
          <Input
            name="orgName"
            value={formData.orgName}
            onChange={handleChange}
            placeholder="e.g., Sunny Properties Ltd"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Real Estate Focus</span>
          <Select name="orgIndustry" value={formData.orgIndustry} onChange={handleChange}>
            <option value="">Select your focus</option>
            <option value="residential">Residential Properties</option>
            <option value="commercial">Commercial Properties</option>
            <option value="mixed">Mixed Residential & Commercial</option>
            <option value="luxury">Luxury Properties</option>
            <option value="rental">Rental Management</option>
          </Select>
        </label>
      </div>

      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-emerald-300">Pro tip:</span> You can always update these details in your admin settings later.
        </p>
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
