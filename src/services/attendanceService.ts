import { createSupabaseServerClient } from '../lib/supabase-server';

type AttendancePayload = {
  organizationId: string;
  userId: string;
  latitude: number | null;
  longitude: number | null;
  notes: string | null;
  selfieUrl?: string | null;
};

export async function checkInAttendance(payload: AttendancePayload) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('attendance').insert({
    organization_id: payload.organizationId,
    user_id: payload.userId,
    check_in_time: new Date().toISOString(),
    check_in_latitude: payload.latitude,
    check_in_longitude: payload.longitude,
    selfie_url: payload.selfieUrl ?? null,
    status: 'present',
    notes: payload.notes,
  });

  if (error) throw error;
}

export async function checkOutAttendance(payload: AttendancePayload) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from('attendance').insert({
    organization_id: payload.organizationId,
    user_id: payload.userId,
    check_out_time: new Date().toISOString(),
    check_out_latitude: payload.latitude,
    check_out_longitude: payload.longitude,
    status: 'completed',
    notes: payload.notes,
  });

  if (error) throw error;
}

export async function listAttendanceHistory(organizationId: string, limit = 20) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('attendance')
    .select('id, status, check_in_time, check_out_time, notes, created_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
