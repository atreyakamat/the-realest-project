'use server';

import { revalidatePath } from 'next/cache';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { requireSessionUser } from '../../lib/auth';
import { checkInAttendance, checkOutAttendance } from '../../services/attendanceService';

type AttendancePayload = {
  latitude: number | null;
  longitude: number | null;
  selfieUrl: string | null;
  notes: string | null;
};

async function saveAttendance(eventType: 'check_in' | 'check_out', payload: AttendancePayload) {
  const user = await requireSessionUser();
  const supabase = await createSupabaseServerClient();

  if (eventType === 'check_in') {
    await checkInAttendance({
      organizationId: user.organizationId ?? '',
      userId: user.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      selfieUrl: payload.selfieUrl,
      notes: payload.notes,
    });
  } else {
    await checkOutAttendance({
      organizationId: user.organizationId ?? '',
      userId: user.id,
      latitude: payload.latitude,
      longitude: payload.longitude,
      notes: payload.notes,
    });
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
