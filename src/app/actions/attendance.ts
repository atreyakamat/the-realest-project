'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';

type AttendancePayload = {
  latitude: number | null;
  longitude: number | null;
  selfieUrl: string | null;
  notes: string | null;
};

async function saveAttendance(eventType: 'check_in' | 'check_out', payload: AttendancePayload) {
  const user = await requireSessionUser();
  const supabase = await createSupabaseServerClient();

  const columnMap =
    eventType === 'check_in'
      ? {
          check_in_time: new Date().toISOString(),
          check_in_latitude: payload.latitude,
          check_in_longitude: payload.longitude,
          selfie_url: payload.selfieUrl,
          status: 'present',
        }
      : {
          check_out_time: new Date().toISOString(),
          check_out_latitude: payload.latitude,
          check_out_longitude: payload.longitude,
          status: 'completed',
        };

  const { error } = await supabase.from('attendance').insert({
    organization_id: user.organizationId,
    user_id: user.id,
    ...columnMap,
    notes: payload.notes,
  });

  if (error) {
    throw error;
  }

  await supabase.from('notifications').insert({
    organization_id: user.organizationId,
    user_id: user.id,
    type: eventType === 'check_in' ? 'attendance_check_in' : 'attendance_check_out',
    payload,
  });

  revalidatePath('/attendance');
  revalidatePath('/dashboard');
}

export async function checkInAttendanceAction(_prevState: { message: string; error: string }, formData: FormData) {
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));
  const selfie = formData.get('selfie');
  const notes = String(formData.get('notes') ?? '').trim();

  try {
    await saveAttendance('check_in', {
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      selfieUrl: selfie instanceof File && selfie.size > 0 ? selfie.name : null,
      notes: notes.length > 0 ? notes : null,
    });

    return { message: 'Checked in successfully.', error: '' };
  } catch (error) {
    return { message: '', error: error instanceof Error ? error.message : 'Unable to check in.' };
  }
}

export async function checkOutAttendanceAction(_prevState: { message: string; error: string }, formData: FormData) {
  const latitude = Number(formData.get('latitude'));
  const longitude = Number(formData.get('longitude'));
  const notes = String(formData.get('notes') ?? '').trim();

  try {
    await saveAttendance('check_out', {
      latitude: Number.isFinite(latitude) ? latitude : null,
      longitude: Number.isFinite(longitude) ? longitude : null,
      selfieUrl: null,
      notes: notes.length > 0 ? notes : null,
    });

    return { message: 'Checked out successfully.', error: '' };
  } catch (error) {
    return { message: '', error: error instanceof Error ? error.message : 'Unable to check out.' };
  }
}
