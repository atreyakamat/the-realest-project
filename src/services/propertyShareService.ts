import { createSupabaseServerClient } from '../lib/supabase-server';

type SharePropertyOptions = {
  organizationId: string;
  actorId: string;
  leadId: string;
  propertyId: string;
  channel: string;
};

export async function sharePropertyWithLead({ organizationId, actorId, leadId, propertyId, channel }: SharePropertyOptions) {
  const supabase = await createSupabaseServerClient();

  const leadResult = await supabase.from('leads').select('id, full_name, phone').eq('id', leadId).single();
  const propertyResult = await supabase.from('properties').select('id, title, location, price').eq('id', propertyId).single();

  const lead = leadResult.data;
  const property = propertyResult.data;

  if (!lead || !property) {
    throw new Error('Unable to load lead or property.');
  }

  const shareLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/share/properties/${property.id}`;
  const message = `Hi ${lead.full_name}, sharing details of ${property.title} in ${property.location}. Price: ₹${property.price?.toLocaleString() ?? '-'} . Photos and details: ${shareLink}`;

  await supabase.from('lead_property_shares').insert({
    lead_id: lead.id,
    property_id: property.id,
    shared_by: actorId,
    channel,
    message,
    share_link: shareLink,
  });

  await supabase.from('activities').insert({
    organization_id: organizationId,
    lead_id: lead.id,
    actor_id: actorId,
    type: 'property_shared',
    payload: { property_id: property.id, channel, message },
  });

  return { leadId: lead.id, propertyId: property.id, shareLink };
}
