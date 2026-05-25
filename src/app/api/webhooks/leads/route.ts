import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { assignLeadRoundRobin, getAvailableSalesAgentCandidates } from '@/services/leadAssignmentService';
import { bridgeCall } from '@/services/callService';
import { scheduleDefaultLeadDripSequence } from '@/services/dripCampaignService';
import { sendPushToOrganization } from '@/services/pushService';
import { notifyNewLeadAssigned } from '@/services/slackService';
import { syncLeadToGoogleSheets } from '@/services/googleSheetsSyncService';

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

export async function GET(req: Request) {
  const url = new URL(req.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');

  if (mode && token) {
    if (mode === 'subscribe' && token === (process.env.META_VERIFY_TOKEN || 'estateflow_secret')) {
      console.log('WEBHOOK_VERIFIED');
      return new Response(challenge, { status: 200 });
    }
    return new Response(null, { status: 403 });
  }
  return new Response(null, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Handle Meta Lead Ads payload structure
     const parsedBody = body;
    if (body.object === 'page' && body.entry?.[0]?.changes?.[0]?.value?.leadgen_id) {
       // This is a Meta Lead Ads event. 
       // In a real app, we'd fetch the lead data from Graph API here.
       // For now, we'll map the basic info if it was passed in a simplified webhook, 
       // or log it for processing.
       console.log('Meta Lead Ads Event Received:', body.entry[0].changes[0].value.leadgen_id);
       // We'll proceed with the normalized LeadPayload validation.
    }

    const parsed = LeadPayload.parse(parsedBody);
    const dryRun =
      process.env.DRY_RUN === '1' ||
      !process.env.SUPABASE_URL ||
      !process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_URL.includes('your_supabase');

    if (dryRun) {
      const leadId = `dry-${Date.now()}`;
      const organizationId = parsed.organizationId ?? '00000000-0000-0000-0000-000000000001';

      await bridgeCall({
        organizationId,
        agentPhone: '',
        leadPhone: parsed.phone,
        leadId,
        dryRun: true,
      });

      await syncLeadToGoogleSheets({
        organizationId,
        leadId,
        leadName: parsed.fullName,
        phone: parsed.phone,
        email: parsed.email ?? null,
        source: parsed.source ?? null,
        status: 'New',
        temperature: 'Warm',
        preferredLocation: parsed.preferredLocation ?? null,
        budgetMin: parsed.budgetMin ?? null,
        budgetMax: parsed.budgetMax ?? null,
        notes: parsed.notes ?? null,
      }).catch((syncError) => {
        console.error('Google Sheets sync failed in dry run:', syncError);
      });

      return NextResponse.json({ ok: true, leadId, bridged: true, dryRun: true });
    }

    const supabaseServer = await createSupabaseServerClient();

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

      if (dryRun || process.env.NODE_ENV !== 'production') {
        const dryLeadId = `dry-${Date.now()}`;
        await bridgeCall({
          organizationId,
          agentPhone: '',
          leadPhone: parsed.phone,
          leadId: dryLeadId,
          dryRun: true,
        });

        return NextResponse.json({
          ok: true,
          leadId: dryLeadId,
          bridged: true,
          dryRun: true,
          fallback: 'db_insert_failed',
        });
      }

      return NextResponse.json({ error: 'DB_INSERT_ERROR' }, { status: 500 });
    }

    await syncLeadToGoogleSheets({
      organizationId,
      leadId: lead.id,
      leadName: lead.full_name,
      phone: lead.phone,
      email: lead.email,
      source: lead.source,
      status: lead.status,
      temperature: lead.temperature,
      preferredLocation: lead.preferred_location,
      budgetMin: lead.budget_min,
      budgetMax: lead.budget_max,
      notes: lead.notes,
    }).catch((syncError) => {
      console.error('Google Sheets sync failed for webhook lead:', syncError);
    });

    // Assign agent using round-robin
    const assignRes = await assignLeadRoundRobin(organizationId);
    const allCandidates = await getAvailableSalesAgentCandidates(organizationId);
    const orderedCandidates = [
      ...allCandidates.filter((item) => item.teamMemberId === assignRes.agentId),
      ...allCandidates.filter((item) => item.teamMemberId !== assignRes.agentId),
    ].filter((item) => item.phone);

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

      await sendPushToOrganization(organizationId, {
        title: 'New lead assigned',
        body: `${lead.full_name ?? 'A lead'} has been assigned and is ready for follow-up.`,
        data: { leadId: lead.id, path: `/leads/${lead.id}` },
      });

      await notifyNewLeadAssigned(organizationId, {
        id: lead.id,
        full_name: lead.full_name,
        source: lead.source,
      }).catch((slackError) => {
        console.error('Slack notification failed for webhook lead:', slackError);
      });
    }

    await scheduleDefaultLeadDripSequence({
      organizationId,
      leadId: lead.id,
      leadCreatedAt: lead.created_at,
    });

    // Trigger call bridge automation with retry on available agents.
    const callDryRun = dryRun || process.env.NODE_ENV !== 'production';
    let bridged = false;

    for (const candidate of orderedCandidates) {
      try {
        const callResult = await bridgeCall({
          organizationId,
          agentPhone: candidate.phone ?? '',
          leadPhone: parsed.phone,
          leadId: lead.id,
          agentId: candidate.teamMemberId,
          dryRun: callDryRun,
        });

        await supabaseServer.from('leads').update({ assigned_agent_id: candidate.teamMemberId }).eq('id', lead.id);
        await supabaseServer
          .from('leads')
          .update({ status: 'Contacted', last_contacted_at: new Date().toISOString() })
          .eq('id', lead.id);

        await supabaseServer.from('calls').insert({
          organization_id: organizationId,
          lead_id: lead.id,
          agent_id: candidate.teamMemberId,
          call_sid: callResult.call_sid,
          conference_sid: callResult.conference_sid,
          status: callResult.status,
          duration: callResult.duration,
          recording_url: callResult.recording_url,
          started_at: callResult.started_at,
          ended_at: callResult.ended_at,
          outcome: callResult.outcome,
        });

        bridged = true;
        break;
      } catch (error) {
        console.error('Bridge attempt failed for candidate', candidate.teamMemberId, error);
      }
    }

    if (!bridged) {
      await supabaseServer.from('leads').update({ status: 'Call Pending' }).eq('id', lead.id);

      await supabaseServer.from('tasks').insert({
        organization_id: organizationId,
        title: `Call Pending: ${parsed.fullName}`,
        payload: { lead_id: lead.id },
      });

      const { data: managers } = await supabaseServer
        .from('team_members')
        .select('profile_id')
        .eq('organization_id', organizationId)
        .eq('role', 'Sales Manager')
        .eq('is_active', true);

      if (managers?.length) {
        await supabaseServer.from('notifications').insert(
          managers
            .filter((manager) => manager.profile_id)
            .map((manager) => ({
              organization_id: organizationId,
              user_id: manager.profile_id,
              type: 'missed_lead_call',
              payload: { lead_id: lead.id, lead_name: lead.full_name },
            })),
        );
      }
    }

    return NextResponse.json({ ok: true, leadId: lead.id, bridged });
  } catch (err) {
    console.error('Webhook handler error', err);
    return NextResponse.json({ error: 'INVALID_PAYLOAD' }, { status: 400 });
  }
}

