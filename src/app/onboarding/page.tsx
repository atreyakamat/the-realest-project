import { getSessionUser } from '@/lib/auth';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { redirect } from 'next/navigation';
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard';
import { OnboardingWorkflowGuide } from '@/components/onboarding/onboarding-workflow-guide';

export default async function OnboardingPage() {
  const user = await getSessionUser();
  
  // If not authenticated, redirect to login
  if (!user) {
    redirect('/login');
  }

  // Check if user already has organization
  const supabase = await createSupabaseServerClient();
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', user.id)
    .maybeSingle();

  // If already has organization, redirect to dashboard
  if (profile?.organization_id) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <OnboardingWorkflowGuide />
      <OnboardingWizard userId={user.id} email={user.email || ''} />
    </div>
  );
}
