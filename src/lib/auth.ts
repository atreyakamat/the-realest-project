import type { Role } from './estateflow-types';
import { createSupabaseServerClient } from './supabase-server';

export type SessionUser = {
  id: string;
  email: string | null;
  role: Role | string | null;
  organizationId: string | null;
  fullName: string | null;
};

export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createSupabaseServerClient();
  const { data: authData } = await supabase.auth.getUser();
  const user = authData.user;

  if (!user && process.env.NODE_ENV !== 'production') {
    return {
      id: '00000000-0000-0000-0000-000000000011',
      email: 'admin@estateflow.test',
      role: 'Admin',
      organizationId: '00000000-0000-0000-0000-000000000001',
      fullName: 'Admin User',
    };
  }

  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name, role')
    .eq('id', user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? null,
    role: profile?.role ?? (user.user_metadata?.role as string | null) ?? null,
    organizationId: profile?.organization_id ?? (user.user_metadata?.organization_id as string | null) ?? null,
    fullName: profile?.full_name ?? (user.user_metadata?.full_name as string | null) ?? null,
  };
}

export async function requireSessionUser() {
  const user = await getSessionUser();

  if (!user) {
    throw new Error('UNAUTHENTICATED');
  }

  return user;
}
