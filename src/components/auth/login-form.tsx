'use client';

import { useActionState } from 'react';
import { signInWithOtpAction } from '../../app/actions/auth';
import { Button, Input } from '../ui';

const initialState = { message: '', error: '' };

export function LoginForm() {
  const [state, action, pending] = useActionState(signInWithOtpAction, initialState);

  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-slate-200" htmlFor="email">
          Work email
        </label>
        <Input id="email" name="email" type="email" placeholder="admin@estateflow.com" required />
      </div>

      <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-slate-300">
        We use a secure magic link login. In local dry-run mode you will still see the auth flow and dashboard shell.
      </p>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <Button className="w-full" type="submit" disabled={pending}>
        {pending ? 'Sending link...' : 'Send sign-in link'}
      </Button>
    </form>
  );
}
