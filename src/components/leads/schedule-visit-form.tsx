'use client';

import { useActionState } from 'react';
import { scheduleSiteVisitAction } from '../../app/actions/leads';
import { Button, Input, Textarea } from '../ui';

const initialState = { message: '', error: '' };

export function ScheduleVisitForm({ leadId, onComplete }: { leadId: string; onComplete?: () => void }) {
  const [state, action, pending] = useActionState(scheduleSiteVisitAction, initialState);

  if (state?.message && !state?.error) {
    if (onComplete) onComplete();
  }

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="leadId" value={leadId} />
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Visit Date & Time</label>
        <Input name="visitDate" type="datetime-local" required />
      </div>
      <div>
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Visit Notes</label>
        <Textarea name="notes" placeholder="Meeting point, specific requirements, etc." />
      </div>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Scheduling...' : 'Schedule Site Visit'}
      </Button>
    </form>
  );
}
