'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';

const leadSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal('')),
  source: z.string().optional(),
  propertyType: z.string().optional(),
  budgetMin: z.coerce.number().optional(),
  budgetMax: z.coerce.number().optional(),
  preferredLocation: z.string().optional(),
  notes: z.string().optional(),
});

export async function createLeadAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const parsed = leadSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: '', error: 'Please complete the required lead fields.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('leads').insert({
    organization_id: user.organizationId,
    full_name: parsed.data.fullName,
    phone: parsed.data.phone,
    email: parsed.data.email || null,
    source: parsed.data.source ?? 'Manual',
    property_type: parsed.data.propertyType ?? 'Apartment',
    budget_min: parsed.data.budgetMin ?? null,
    budget_max: parsed.data.budgetMax ?? null,
    preferred_location: parsed.data.preferredLocation ?? null,
    notes: parsed.data.notes ?? null,
    status: 'New',
    temperature: 'Warm',
  });

  if (error) {
    return { message: '', error: error.message };
  }

  revalidatePath('/leads');
  revalidatePath('/dashboard');

  return { message: 'Lead created successfully.', error: '' };
}

export async function updateLeadStateAction(formData: FormData): Promise<void> {
  const leadId = String(formData.get('leadId') ?? '');
  const status = String(formData.get('status') ?? '');
  const temperature = String(formData.get('temperature') ?? '');
  const note = String(formData.get('note') ?? '');
  const user = await requireSessionUser();
  const supabase = await createSupabaseServerClient();

  if (leadId) {
    await supabase.from('leads').update({ status, temperature, updated_at: new Date().toISOString() }).eq('id', leadId).eq('organization_id', user.organizationId);
    if (note.trim()) {
      await supabase.from('activities').insert({
        organization_id: user.organizationId,
        lead_id: leadId,
        actor_id: user.id,
        type: 'note_added',
        payload: { message: note },
      });
    }
    revalidatePath(`/leads/${leadId}`);
    revalidatePath('/leads');
  }
}

export async function sharePropertyWithLeadAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const leadId = String(formData.get('leadId') ?? '');
  const propertyId = String(formData.get('propertyId') ?? '');
  const channel = String(formData.get('channel') ?? 'WhatsApp');
  const supabase = await createSupabaseServerClient();

  if (!leadId || !propertyId) {
    return { message: '', error: 'Select a lead and a property.' };
  }

  const leadResult = await supabase.from('leads').select('id, full_name, phone').eq('id', leadId).single();
  const propertyResult = await supabase.from('properties').select('id, title, location, price').eq('id', propertyId).single();

  const lead = leadResult.data;
  const property = propertyResult.data;

  if (!lead || !property) {
    return { message: '', error: 'Unable to load lead or property.' };
  }

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/share/properties/${property.id}`;
  const message = `Hi ${lead.full_name}, sharing details of ${property.title} in ${property.location}. Price: ₹${property.price?.toLocaleString() ?? '-'} . Photos and details: ${shareLink}`;

  await supabase.from('lead_property_shares').insert({
    lead_id: lead.id,
    property_id: property.id,
    shared_by: user.id,
    channel,
    message,
    share_link: shareLink,
  });

  await supabase.from('activities').insert({
    organization_id: user.organizationId,
    lead_id: lead.id,
    actor_id: user.id,
    type: 'property_shared',
    payload: { property_id: property.id, channel, message },
  });

  revalidatePath(`/leads/${lead.id}`);
  revalidatePath('/properties');

  return { message: 'Property shared and logged in the timeline.', error: '' };
}
