'use client';

import { useMemo, useState } from 'react';
import { useActionState } from 'react';
import type { LeadRecord } from '../../lib/estateflow-types';
import type { PropertyRecord } from '../../lib/estateflow-types';
import { sharePropertyWithLeadAction } from '../../app/actions/leads';
import { Button, Select, Textarea, Input } from '../ui';

const initialState = { message: '', error: '' };
const channels = ['WhatsApp', 'SMS', 'Email'] as const;

export function SharePropertyCard({ properties, leads }: { properties: PropertyRecord[]; leads: LeadRecord[] }) {
  const [state, action, pending] = useActionState(sharePropertyWithLeadAction, initialState);
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? '');
  const [channel, setChannel] = useState<(typeof channels)[number]>('WhatsApp');
  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');

  const property = useMemo(() => properties.find((item) => item.id === propertyId) ?? properties[0], [properties, propertyId]);

  const shareLink = property ? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/share/properties/${property.id}` : '';
  const message = property
    ? `Hi, sharing details of ${property.title} in ${property.location}. Price: ₹${property.price?.toLocaleString() ?? '-'} . Photos and details: ${shareLink}`
    : '';

  const contactLink =
    channel === 'WhatsApp'
      ? `https://wa.me/?text=${encodeURIComponent(message)}`
      : channel === 'SMS'
        ? `sms:?body=${encodeURIComponent(message)}`
        : `mailto:?subject=${encodeURIComponent(property?.title ?? 'Property details')}&body=${encodeURIComponent(message)}`;

  return (
    <form action={action} className="space-y-3">
      <Select value={leadId} onChange={(event) => setLeadId(event.target.value)}>
        {leads.map((lead) => <option key={lead.id} value={lead.id}>{lead.full_name}</option>)}
      </Select>
      <input type="hidden" name="leadId" value={leadId} />
      <input type="hidden" name="propertyId" value={property?.id ?? ''} />
      <Select value={propertyId} onChange={(event) => setPropertyId(event.target.value)}>
        {properties.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
      </Select>
      <Select name="channel" value={channel} onChange={(event) => setChannel(event.target.value as (typeof channels)[number])}>
        {channels.map((item) => <option key={item}>{item}</option>)}
      </Select>
      <Textarea readOnly value={message} />
      <div className="flex gap-3">
        <a className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-400 px-4 text-sm font-semibold text-slate-950" href={contactLink} target="_blank" rel="noreferrer">
          Share now
        </a>
        <Button type="submit" disabled={pending} className="flex-1 bg-white/10 text-white shadow-none hover:bg-white/15">
          {pending ? 'Logging...' : 'Log share'}
        </Button>
      </div>

      {state?.error ? <p className="text-sm text-rose-300">{state.error}</p> : null}
      {state?.message ? <p className="text-sm text-emerald-300">{state.message}</p> : null}
    </form>
  );
}
