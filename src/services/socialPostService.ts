import { createSupabaseServerClient } from '../lib/supabase-server';

type CreateSocialPostOptions = {
  organizationId: string;
  title: string;
  caption: string;
  postType: string;
  status: string;
  scheduledAt: string | null;
  assignedTo: string | null;
  media?: string[];
};

export async function createSocialPost(options: CreateSocialPostOptions) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('social_posts')
    .insert({
      organization_id: options.organizationId,
      title: options.title,
      caption: options.caption,
      post_type: options.postType,
      status: options.status,
      scheduled_at: options.scheduledAt,
      assigned_to: options.assignedTo,
      media: options.media ?? [],
    } as never)
    .select('id')
    .single();

  if (error) throw error;
  return data;
}

export async function listSocialPosts(organizationId: string, limit = 30) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from('social_posts')
    .select('id, title, caption, post_type, status, scheduled_at, assigned_to, media, created_at')
    .eq('organization_id', organizationId)
    .order('scheduled_at', { ascending: true, nullsFirst: false })
    .limit(limit);

  if (error) return [];
  return data ?? [];
}
