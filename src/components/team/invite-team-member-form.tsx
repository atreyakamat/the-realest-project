'use client';

import { useActionState } from 'react';
import { inviteTeamMemberAction } from '../../app/actions/auth';
import { Button, Input, Select } from '../ui';

const initialState = { message: '', error: '' };

export function InviteTeamMemberForm() {
  const [state, action, pending] = useActionState(inviteTeamMemberAction, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-3">
      <Input name="fullName" placeholder="Full name" required />
      <Input name="email" type="email" placeholder="Email" required />
      <Select name="role" defaultValue="Sales Agent">
        {['Admin', 'Business Owner', 'Sales Manager', 'Sales Agent', 'Field Executive', 'Social Media Manager'].map((role) => (
          <option key={role}>{role}</option>
        ))}
      </Select>

      {state?.error ? <p className="md:col-span-3 text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="md:col-span-3 text-sm text-emerald-300">{state.message}</p> : null}

      <div className="md:col-span-3">
        <Button type="submit" disabled={pending}>{pending ? 'Sending invite...' : 'Send invite'}</Button>
      </div>
    </form>
  );
}
