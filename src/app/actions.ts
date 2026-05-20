'use server';

import { bridgeCall } from '@/services/callService';
import { sendMessage } from '@/services/messageService';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { revalidatePath } from 'next/cache';

export async function initiateCall(leadId: string, leadPhone: string, agentPhone: string) {
  const dryRun = process.env.DRY_RUN === '1';
  
  try {
    const res = await bridgeCall({
      organizationId: 'demo-org',
      agentPhone,
      leadPhone,
      leadId,
      dryRun
    });

    const supabase = await createSupabaseServerClient();
    await supabase.from('activities').insert({
      lead_id: leadId,
      type: 'call_initiated',
      payload: { call_sid: res.call_sid }
    });

    revalidatePath(`/leads/${leadId}`);
    return { success: true, callSid: res.call_sid };
  } catch (error) {
    console.error('Call Error:', error);
    return { success: false, error: 'Failed to initiate call' };
  }
}

export async function sendWhatsAppFollowup(leadId: string, leadPhone: string, message: string) {
  const dryRun = process.env.DRY_RUN === '1';
  
  try {
    const res = await sendMessage({
      to: leadPhone,
      body: message,
      channel: 'whatsapp',
      dryRun
    });

    const supabase = await createSupabaseServerClient();
    await supabase.from('activities').insert({
      lead_id: leadId,
      type: 'message_sent',
      payload: { sid: res.sid, channel: 'whatsapp', body: message }
    });

    revalidatePath(`/leads/${leadId}`);
    return { success: true, sid: res.sid };
  } catch (error) {
    console.error('WhatsApp Error:', error);
    return { success: false, error: 'Failed to send WhatsApp' };
  }
}

export async function checkInAttendance(userId: string, lat: number, lng: number) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from('attendance').insert({
      user_id: userId,
      check_in_time: new Date().toISOString(),
      check_in_latitude: lat,
      check_in_longitude: lng,
      status: 'Present'
    }).select().single();

    if (error) throw error;
    revalidatePath('/attendance');
    return { success: true, data };
  } catch (error) {
    console.error('Attendance Error:', error);
    return { success: false, error: 'Failed to check in' };
  }
}
