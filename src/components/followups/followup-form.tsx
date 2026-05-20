'use client';

import { useActionState } from 'react';
import type { LeadRecord } from '../../lib/estateflow-types';
import { createFollowupAction } from '../../app/actions/followups';
import { Button, Input, Select, Textarea } from '../ui';

const initialState = { message: '', error: '' };

export function FollowupForm({ leads }: { leads: LeadRecord[] }) {
  const [state, action, pending] = useActionState(createFollowupAction, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Select name="leadId" defaultValue={leads[0]?.id ?? ''}>
        {leads.map((lead) => (
          <option key={lead.id} value={lead.id}>
            {lead.full_name} · {lead.status}
          </option>
        ))}
      </Select>
      <Input name="dueAt" type="datetime-local" />
      <Textarea name="note" placeholder="Template or custom note" className="md:col-span-2" />

      {state?.error ? <p className="md:col-span-2 text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="md:col-span-2 text-sm text-emerald-300">{state.message}</p> : null}

      <div className="md:col-span-2 flex gap-3">
        <Button type="submit" disabled={pending}>{pending ? 'Scheduling...' : 'Schedule follow-up'}</Button>
        <Button type="button" className="bg-white/10 text-white shadow-none hover:bg-white/15">Use template</Button>
      </div>
    </form>
  );
}
