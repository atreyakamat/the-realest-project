'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';

const propertySchema = z.object({
  title: z.string().min(3),
  location: z.string().min(2),
  address: z.string().optional(),
  propertyType: z.string().optional(),
  price: z.coerce.number(),
  size: z.string().optional(),
  bedrooms: z.coerce.number().optional(),
  bathrooms: z.coerce.number().optional(),
  floor: z.string().optional(),
  furnishing: z.string().optional(),
  status: z.string().optional(),
  description: z.string().optional(),
});

export async function createPropertyAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const parsed = propertySchema.safeParse(Object.fromEntries(formData.entries()));

  if (!parsed.success) {
    return { message: '', error: 'Please check the property details.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('properties').insert({
    organization_id: user.organizationId,
    title: parsed.data.title,
    location: parsed.data.location,
    address: parsed.data.address || null,
    property_type: parsed.data.propertyType ?? 'Apartment',
    price: parsed.data.price,
    size: parsed.data.size || null,
    bedrooms: parsed.data.bedrooms || null,
    bathrooms: parsed.data.bathrooms || null,
    floor: parsed.data.floor || null,
    furnishing: parsed.data.furnishing || 'Unfurnished',
    availability_status: parsed.data.status ?? 'Available',
    description: parsed.data.description || null,
  });

  if (error) {
    return { message: '', error: error.message };
  }

  revalidatePath('/properties');

  return { message: 'Property added to inventory.', error: '' };
}
