'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireSessionUser } from '../../lib/auth';
import { createSocialPost } from '../../services/socialPostService';

const socialPostSchema = z.object({
  title: z.string().min(2),
  caption: z.string().min(2),
  postType: z.string().min(2),
  status: z.enum(['idea', 'draft', 'scheduled', 'published']),
  scheduledAt: z.string().optional(),
});

export async function createSocialPostAction(_prevState: { message: string; error: string }, formData: FormData) {
  const user = await requireSessionUser();
  const parsed = socialPostSchema.safeParse({
    title: formData.get('title'),
    caption: formData.get('caption'),
    postType: formData.get('postType'),
    status: formData.get('status'),
    scheduledAt: formData.get('scheduledAt'),
  });

  if (!parsed.success) {
    return { message: '', error: 'Please fill in title, caption, post type, and status.' };
  }

  try {
    await createSocialPost({
      organizationId: user.organizationId ?? '',
      title: parsed.data.title,
      caption: parsed.data.caption,
      postType: parsed.data.postType,
      status: parsed.data.status,
      scheduledAt: parsed.data.scheduledAt || null,
      assignedTo: user.id,
      media: [],
    });

    revalidatePath('/social');
    return { message: 'Social post saved.', error: '' };
  } catch (error) {
    return { message: '', error: error instanceof Error ? error.message : 'Unable to save social post.' };
  }
}
