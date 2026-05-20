'use client';

import * as React from 'react';
import { Button, Input } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';

interface Step2Props {
  data: OnboardingData;
  onComplete: (data: Partial<OnboardingData>) => void;
}

export function OnboardingStep2AdminInfo({ data, onComplete }: Step2Props) {
  const [formData, setFormData] = React.useState({
    adminFullName: data.adminFullName,
    adminPhone: data.adminPhone,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.adminFullName.trim()) {
      onComplete({
        adminFullName: formData.adminFullName,
        adminPhone: formData.adminPhone,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-white">Admin Account Information</h2>
        <p className="text-sm text-slate-400">This will be your primary admin profile for managing the CRM.</p>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Full Name *</span>
          <Input
            name="adminFullName"
            value={formData.adminFullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-200">Phone Number</span>
          <Input
            name="adminPhone"
            value={formData.adminPhone}
            onChange={handleChange}
            type="tel"
            placeholder="+1 (555) 000-0000"
          />
        </label>
      </div>

      <div className="rounded-2xl border border-blue-400/20 bg-blue-400/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-blue-300">Note:</span> You&apos;ll have full access to all team members, settings, and integrations.
        </p>
      </div>

      <Button type="submit" className="w-full">
        Continue
      </Button>
    </form>
  );
}
