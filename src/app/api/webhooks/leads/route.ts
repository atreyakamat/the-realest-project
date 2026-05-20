import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { assignLeadRoundRobin } from '@/services/leadAssignmentService';
import { bridgeCall } from '@/services/callService';

const LeadPayload = z.object({
  fullName: z.string(),
  phone: z.string(),
  email: z.string().optional(),
  source: z.string().optional(),
  propertyType: z.string().optional(),
  budgetMin: z.number().optional(),
  budgetMax: z.number().optional(),
  preferredLocation: z.string().optional(),
  notes: z.string().optional(),
  organizationId: z.string().optional()
});

export async function POST(req: Request) {
  try {
    const supabaseServer = await createSupabaseServerClient();
    const body = await req.json();
    const parsed = LeadPayload.parse(body);

    // Determine organization - default to first org for demo if not provided
    let organizationId: string = parsed.organizationId ?? '';
    if (!organizationId) {
      const { data: orgs } = await supabaseServer.from('organizations').select('id').limit(1);
      organizationId = orgs?.[0]?.id ?? '00000000-0000-0000-0000-000000000001';
    }

    // Insert lead
    const { data: lead, error: insertError } = await supabaseServer
      .from('leads')
      .insert({
        organization_id: organizationId,
        full_name: parsed.fullName,
        phone: parsed.phone,
        email: parsed.email,
        source: parsed.source,
        property_type: parsed.propertyType,
        budget_min: parsed.budgetMin,
        budget_max: parsed.budgetMax,
        preferred_location: parsed.preferredLocation,
        notes: parsed.notes,
        status: 'New'
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Lead insert error', insertError);
      return NextResponse.json({ error: 'DB_INSERT_ERROR' }, { status: 500 });
    }

    // Assign agent using round-robin
    const assignRes = await assignLeadRoundRobin(organizationId);

    if (assignRes.agentId) {
      await supabaseServer
        .from('leads')
        .update({ assigned_agent_id: assignRes.agentId })
        .eq('id', lead.id);

      // create activity
      await supabaseServer.from('activities').insert({
        organization_id: organizationId,
        lead_id: lead.id,
        type: 'lead_assigned',
        payload: { agent_id: assignRes.agentId }
      });

      // Notify agent via in-app notification
      await supabaseServer.from('notifications').insert({
        organization_id: organizationId,
        user_id: null, 
        type: 'lead_assigned',
        payload: { lead_id: lead.id, lead_name: lead.full_name }
      });
    }

    // Trigger call bridge automation
    const dryRun = process.env.DRY_RUN === '1' || process.env.NODE_ENV !== 'production';

    try {
      let agentPhone = undefined;
      if (assignRes.agentId) {
        const { data: agent } = await supabaseServer
          .from('team_members')
          .select('profile_id')
          .eq('id', assignRes.agentId)
          .single();
        
        if (agent?.profile_id) {
          const { data: profile } = await supabaseServer
            .from('profiles')
            .select('phone')
            .eq('id', agent.profile_id)
            .single();
          agentPhone = profile?.phone;
        }
      }

      const callResult = await bridgeCall({
        organizationId: organizationId as string,
        agentPhone: agentPhone || process.env.TWILIO_PHONE_NUMBER || '',
        leadPhone: parsed.phone,
        leadId: lead.id,
        agentId: assignRes.agentId || undefined,
        dryRun
      });

      // Log call
      await supabaseServer.from('calls').insert({
        organization_id: organizationId,
        lead_id: lead.id,
        agent_id: assignRes.agentId,
        call_sid: callResult.call_sid,
        conference_sid: callResult.conference_sid,
        status: callResult.status,
        duration: callResult.duration,
        recording_url: callResult.recording_url,
        started_at: callResult.started_at,
        ended_at: callResult.ended_at,
        outcome: callResult.outcome
      });

    } catch (err) {
      console.error('Call bridge error', err);
      // create follow-up task
      await supabaseServer.from('tasks').insert({
        organization_id: organizationId,
        title: 'Call Pending: ' + parsed.fullName,
        payload: { lead_id: lead.id }
      });
    }

    return NextResponse.json({ ok: true, leadId: lead.id });
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }
}
