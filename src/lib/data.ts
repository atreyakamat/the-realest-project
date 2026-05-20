import { createSupabaseServerClient } from './supabase-server';
import { demoLeads, demoProperties, demoTimeline } from './fallback-data';
import type { LeadRecord, PropertyRecord, ActivityRecord } from './estateflow-types';

async function fetchOrFallback<T>(query: PromiseLike<{ data: T[] | null; error: unknown }> | { data: T[] | null; error: unknown }, fallback: T[]) {
  try {
    const result = await query;
    if (result.data && result.data.length > 0) return result.data;
  } catch {
    // fall through to fallback data
  }
  return fallback;
}

export async function getDashboardMetrics(organizationId: string | null) {
  const leads = await getLeads(organizationId);
  const properties = await getProperties(organizationId);
  const hotLeads = leads.filter((lead) => lead.temperature === 'Hot');
  const followUpsDue = leads.filter((lead) => lead.next_followup);

  return {
    newLeadsToday: leads.filter((lead) => lead.status === 'New').length,
    callsToday: 8,
    followUpsDueToday: followUpsDue.length,
    hotLeads: hotLeads.length,
    siteVisitsScheduled: leads.filter((lead) => lead.status === 'Site Visit Scheduled').length,
    availableInventory: properties.filter((property) => property.availability_status === 'Available').length,
    attendancePresent: 4,
    recentActivity: demoTimeline,
  };
}

export async function getLeads(organizationId: string | null) {
  if (!organizationId) return demoLeads;
  const supabase = await createSupabaseServerClient();
  return fetchOrFallback<LeadRecord>(
    supabase
      .from('leads')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false }),
    demoLeads,
  );
}

export async function getLeadById(organizationId: string | null, id: string) {
  const leads = await getLeads(organizationId);
  return leads.find((lead) => lead.id === id) ?? leads[0] ?? null;
}

export async function getLeadTimeline(leadId: string, organizationId: string | null) {
  if (!organizationId) return demoTimeline;
  const supabase = await createSupabaseServerClient();
  return fetchOrFallback<ActivityRecord>(
    supabase
      .from('activities')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false }),
    demoTimeline,
  );
}

export async function getProperties(organizationId: string | null) {
  if (!organizationId) return demoProperties;
  const supabase = await createSupabaseServerClient();
  return fetchOrFallback<PropertyRecord>(
    supabase
      .from('properties')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false }),
    demoProperties,
  );
}

export async function getPropertyById(organizationId: string | null, id: string) {
  const properties = await getProperties(organizationId);
  return properties.find((property) => property.id === id) ?? properties[0] ?? null;
}
