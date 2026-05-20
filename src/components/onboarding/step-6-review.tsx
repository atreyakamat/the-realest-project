'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { OnboardingData } from './onboarding-wizard';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface Step6Props {
  data: OnboardingData;
  onSubmit: (formData: FormData) => Promise<void>;
  pending: boolean;
}

export function OnboardingStep6Review({ data, onSubmit, pending }: Step6Props) {
  const [showForm, setShowForm] = React.useState(false);

  const handleFormSubmit = async (formData: FormData) => {
    await onSubmit(formData);
  };

  return (
    <form
      action={(formData) => handleFormSubmit(formData)}
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        handleFormSubmit(formData);
      }}
    >
      <div>
        <h2 className="mb-1 text-2xl font-semibold text-white">Review & Complete Setup</h2>
        <p className="text-sm text-slate-400">Verify your setup details before finalizing.</p>
      </div>

      <div className="space-y-3">
        {/* Organization */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Organization</p>
              <p className="mt-1 text-xs text-slate-400">{data.orgName}</p>
              {data.orgIndustry && <p className="text-xs text-slate-500">{data.orgIndustry}</p>}
            </div>
          </div>
        </div>

        {/* Admin */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Admin Account</p>
              <p className="mt-1 text-xs text-slate-400">{data.adminFullName}</p>
              {data.adminPhone && <p className="text-xs text-slate-500">{data.adminPhone}</p>}
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Team Members</p>
              <p className="mt-1 text-xs text-slate-400">
                {data.teamMembers.length === 0
                  ? 'You can add team members later'
                  : `${data.teamMembers.length} member${data.teamMembers.length > 1 ? 's' : ''} to invite`}
              </p>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-1 h-5 w-5 flex-shrink-0 text-amber-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Integrations</p>
              <p className="mt-1 text-xs text-slate-400">
                {Object.values(data.apiKeys).filter((v) => v).length === 0
                  ? 'Skipped - configure later in Settings'
                  : `${Object.values(data.apiKeys).filter((v) => v).length} key(s) configured`}
              </p>
            </div>
          </div>
        </div>

        {/* Lead Sources */}
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Lead Sources</p>
              <p className="mt-1 text-xs text-slate-400">
                {data.leadSources.length === 0
                  ? 'No sources selected - you can add them later'
                  : `${data.leadSources.length} source${data.leadSources.length > 1 ? 's' : ''} selected`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/5 p-4">
        <p className="text-sm text-slate-300">
          <span className="font-semibold text-emerald-300">You're all set!</span> Your EstateFlow CRM is ready. You can customize everything later from the admin dashboard.
        </p>
      </div>

      <Button type="submit" className="w-full py-3 px-4 text-base" disabled={pending}>
        {pending ? 'Completing Setup...' : 'Complete Setup & Go to Dashboard'}
      </Button>
    </form>
  );
}
