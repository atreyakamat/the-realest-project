"use client";

import React, { useState } from 'react';

type Props = {
  leadId: string;
  actionId: string;
  children?: React.ReactNode;
};

export default function TakeActionButton({ leadId, actionId, children }: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleClick() {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, actionId, dryRun: true }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Request failed');
      setSuccess('Action recorded (dry-run)');
    } catch (err: any) {
      setError(err.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading}
        className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm"
      >
        {loading ? 'Recording...' : children ?? 'Take recommended action'}
      </button>
      {success ? <p className="mt-2 text-xs text-emerald-300">{success}</p> : null}
      {error ? <p className="mt-2 text-xs text-red-400">{error}</p> : null}
    </div>
  );
}
