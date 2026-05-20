'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createSupabaseServerClient } from '../../lib/supabase-server';
import { createSupabaseAdminClient } from '../../lib/supabase-admin';

const loginSchema = z.object({
  email: z.string().email(),
});

const inviteSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2),
  role: z.string().min(2),
});

export async function signInWithOtpAction(_prevState: { message: string; error: string }, formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email') });

  if (!parsed.success) {
    return { message: '', error: 'Please enter a valid email address.' };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/auth/callback`,
    },
  });

  if (error) {
    return { message: '', error: error.message };
  }

  return { message: 'Check your inbox for the sign-in link.', error: '' };
}

export async function signOutAction() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function inviteTeamMemberAction(_prevState: { message: string; error: string }, formData: FormData) {
  const parsed = inviteSchema.safeParse({
    email: formData.get('email'),
    fullName: formData.get('fullName'),
    role: formData.get('role'),
  });

  if (!parsed.success) {
    return { message: '', error: 'Please fill in all invite fields.' };
  }

  const supabase = await createSupabaseServerClient();
  const { data: authUser } = await supabase.auth.getUser();
  const organizationId = authUser.user?.user_metadata?.organization_id ?? null;
  const admin = createSupabaseAdminClient();

  const { error } = await admin.auth.admin.inviteUserByEmail(parsed.data.email, {
    data: {
      full_name: parsed.data.fullName,
      role: parsed.data.role,
      organization_id: organizationId,
    },
  });

  if (error) {
    return { message: '', error: error.message };
  }

  revalidatePath('/team');

  return { message: `Invite sent to ${parsed.data.email}.`, error: '' };
}
