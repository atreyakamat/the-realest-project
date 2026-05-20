'use client';

import { useMemo, useState } from 'react';
import { useActionState } from 'react';
import type { LeadRecord } from '../../lib/estateflow-types';
import { sendFollowupMessageAction } from '../../app/actions/followups';
import { Button, Select, Textarea } from '../ui';

const initialState = { message: '', error: '' };
const channels = [
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
] as const;
const templates = [
  { value: 'review', label: 'Review reminder' },
  { value: 'call', label: 'Quick call' },
  { value: 'new_options', label: 'New options' },
] as const;

export function FollowupSender({ leads }: { leads: LeadRecord[] }) {
  const [state, action, pending] = useActionState(sendFollowupMessageAction, initialState);
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [channel, setChannel] = useState<(typeof channels)[number]['value']>('whatsapp');
  const [template, setTemplate] = useState<(typeof templates)[number]['value']>('review');

  const lead = useMemo(() => leads.find((item) => item.id === leadId) ?? leads[0], [leadId, leads]);

  const messagePreview = useMemo(() => {
    if (!lead) return '';

    if (template === 'call') {
      return `Hi ${lead.full_name}, are you available for a quick call today to discuss properties in ${lead.preferred_location ?? 'your preferred area'}?`;
    }

    if (template === 'new_options') {
      return `Hi ${lead.full_name}, we have a few new options matching your budget. Should I share them?`;
    }

    return `Hi ${lead.full_name}, just checking if you had a chance to review the property details I shared.`;
  }, [lead, template]);

  return (
    <form action={action} className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <Select value={leadId} onChange={(event) => setLeadId(event.target.value)}>
          {leads.map((item) => (
            <option key={item.id} value={item.id}>
              {item.full_name}
            </option>
          ))}
        </Select>
        <Select value={channel} onChange={(event) => setChannel(event.target.value as (typeof channels)[number]['value'])}>
          {channels.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
        <Select value={template} onChange={(event) => setTemplate(event.target.value as (typeof templates)[number]['value'])}>
          {templates.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>

      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="channel" value={channel} />
      <input type="hidden" name="template" value={template} />

      <Textarea readOnly value={messagePreview} />

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? 'Sending...' : 'Send follow-up'}
        </Button>
        <Button type="button" className="flex-1 bg-white/10 text-white shadow-none hover:bg-white/15">
          Save as template
        </Button>
      </div>
    </form>
  );
}
