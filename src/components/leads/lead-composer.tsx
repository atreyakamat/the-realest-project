'use client';

import { useActionState } from 'react';
import { createLeadAction } from '../../app/actions/leads';
import { Button, Input, Select, Textarea } from '../ui';

const initialState = { message: '', error: '' };

export function LeadComposer() {
  const [state, action, pending] = useActionState(createLeadAction, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Input name="fullName" placeholder="Full name" required />
      <Input name="phone" placeholder="Phone number" required />
      <Input name="email" type="email" placeholder="Email" />
      <Select name="source" defaultValue="Manual">
        {['36 Acre', 'MagicBricks', 'Housing', 'Facebook', 'Instagram', 'Website', 'Referral', 'Manual', 'Other'].map((source) => (
          <option key={source}>{source}</option>
        ))}
      </Select>
      <Select name="propertyType" defaultValue="Apartment">
        {['Apartment', 'Villa', 'Plot', 'Commercial', 'Rental'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Input name="preferredLocation" placeholder="Preferred location" />
      <Input name="budgetMin" type="number" placeholder="Budget min" />
      <Input name="budgetMax" type="number" placeholder="Budget max" />
      <Textarea name="notes" placeholder="Notes" className="md:col-span-2" />

      {state?.error ? <p className="md:col-span-2 text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="md:col-span-2 text-sm text-emerald-300">{state.message}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving...' : 'Create lead'}
        </Button>
      </div>
    </form>
  );
}
