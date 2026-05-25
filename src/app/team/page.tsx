import { Card } from '@/components/ui';
import { InviteTeamMemberForm } from '@/components/team/invite-team-member-form';
import { getSessionUser } from '@/lib/auth';
import { isAdmin } from '@/lib/rbac';
import { redirect } from 'next/navigation';

export default async function TeamPage() {
  const user = await getSessionUser();

  if (!isAdmin(user)) {
    redirect('/');
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">People</p>
        <h1 className="text-3xl font-semibold text-white">Team</h1>
        <p className="max-w-2xl text-sm leading-6 text-slate-300">Invite new agents, managers, and field staff to the CRM.</p>
      </header>

      <Card>
        <InviteTeamMemberForm />
      </Card>
    </div>
  );
}
