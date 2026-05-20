'use client';

import { useActionState } from 'react';
import { createSocialPostAction } from '../../app/actions/social';
import { Button, Input, Select, Textarea } from '../ui';

const initialState = { message: '', error: '' };

export function SocialPostForm() {
  const [state, action, pending] = useActionState(createSocialPostAction, initialState);

  return (
    <form action={action} className="grid gap-3 md:grid-cols-2">
      <Input name="title" placeholder="Post title" required />
      <Select name="postType" defaultValue="Instagram Post">
        {['Instagram Reel', 'Instagram Post', 'Facebook Post', 'LinkedIn Post', 'Story'].map((item) => (
          <option key={item}>{item}</option>
        ))}
      </Select>
      <Textarea name="caption" placeholder="Write caption" className="md:col-span-2" required />
      <Select name="status" defaultValue="draft">
        {['idea', 'draft', 'scheduled', 'published'].map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </Select>
      <Input name="scheduledAt" type="datetime-local" />
      <Textarea name="notes" placeholder="Notes" className="md:col-span-2" />

      {state?.error ? <p className="md:col-span-2 text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="md:col-span-2 text-sm text-emerald-300">{state.message}</p> : null}

      <div className="md:col-span-2">
        <Button type="submit" disabled={pending}>{pending ? 'Saving...' : 'Save post'}</Button>
      </div>
    </form>
  );
}
