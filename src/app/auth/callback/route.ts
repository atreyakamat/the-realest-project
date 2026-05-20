import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);

    // Check if user has organization
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', authUser.user.id)
        .maybeSingle();

      // If no organization, go to onboarding
      if (!profile?.organization_id) {
        return NextResponse.redirect(new URL('/onboarding', request.url));
      }
    }
  }

  return NextResponse.redirect(new URL('/', request.url));
}
