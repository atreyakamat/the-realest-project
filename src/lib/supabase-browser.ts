import { createClient } from '@supabase/supabase-js';

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL ?? '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY ?? '';

  if (!url || !anonKey || url.includes('your_supabase') || anonKey.includes('your_supabase')) {
    return null;
  }

  return createClient(url, anonKey);
}
