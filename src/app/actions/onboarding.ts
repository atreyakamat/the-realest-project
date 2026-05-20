'use server';

import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createSupabaseAdminClient } from '@/lib/supabase-admin';

export async function CompleteOnboardingAction(
  _prevState: { message: string; error: string },
  formData: FormData
) {
  try {
    const userId = formData.get('userId') as string;
    const email = formData.get('email') as string;
    const orgName = formData.get('orgName') as string;
    const orgIndustry = formData.get('orgIndustry') as string;
    const adminFullName = formData.get('adminFullName') as string;
    const adminPhone = formData.get('adminPhone') as string;
    const teamMembersStr = formData.get('teamMembers') as string;
    const apiKeysStr = formData.get('apiKeys') as string;
    const leadSourcesStr = formData.get('leadSources') as string;

    if (!userId || !orgName) {
      return { message: '', error: 'Missing required organization data' };
    }

    const supabase = await createSupabaseServerClient();
    const admin = createSupabaseAdminClient();

    // 1. Create organization
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        name: orgName,
        metadata: { industry: orgIndustry },
      })
      .select()
      .single();

    if (orgError || !org) {
      return { message: '', error: 'Failed to create organization' };
    }

    // 2. Update user profile with organization and admin info
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        email,
        organization_id: org.id,
        full_name: adminFullName,
        phone: adminPhone,
        role: 'admin',
      })
      .select()
      .single();

    if (profileError) {
      return { message: '', error: 'Failed to update admin profile' };
    }

    // 3. Save API keys as integration settings
    const apiKeys = JSON.parse(apiKeysStr || '{}');
    const settingsToSave = [
      { key: 'assignment_mode', value: 'round_robin', is_secret: false },
      ...Object.entries(apiKeys)
        .filter(([, value]) => value)
        .map(([key, value]) => ({
          key,
          value: String(value),
          is_secret: true,
        })),
    ];

    for (const setting of settingsToSave) {
      await supabase.from('integration_settings').upsert(
        {
          organization_id: org.id,
          key: setting.key,
          value: setting.value,
          is_secret: setting.is_secret,
        },
        { onConflict: 'organization_id,key' },
      );
    }

    // 4. Invite team members
    const teamMembers = JSON.parse(teamMembersStr || '[]');
    for (const member of teamMembers) {
      try {
        await admin.auth.admin.inviteUserByEmail(member.email, {
          data: {
            full_name: member.fullName,
            role: member.role,
            organization_id: org.id,
          },
        });
      } catch (err) {
        console.error(`Failed to invite ${member.email}`, err);
      }
    }

    // 5. Create lead sources
    const leadSources = JSON.parse(leadSourcesStr || '[]');
    const sourceMap: Record<string, string> = {
      '36_acre': '36 Acre',
      'magicbricks': 'MagicBricks',
      'housing': 'Housing.com',
      'facebook': 'Facebook Ads',
      'instagram': 'Instagram Ads',
      'website': 'Website Form',
      'whatsapp': 'WhatsApp',
      'referral': 'Referral',
      'manual': 'Manual Entry',
    };

    for (const sourceId of leadSources) {
      const sourceName = sourceMap[sourceId] || sourceId;
      await supabase.from('lead_sources').insert({
        organization_id: org.id,
        name: sourceName,
      });
    }

    // 6. Redirect to dashboard
    redirect('/');
  } catch (error) {
    console.error('Onboarding error:', error);
    return { message: '', error: 'An unexpected error occurred during setup' };
  }
}
