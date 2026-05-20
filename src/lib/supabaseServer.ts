export { createSupabaseServerClient } from './supabase-server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('Supabase URL or service role key missing. Some server actions may fail.');
}

export const supabaseServer = createClient(supabaseUrl || '', serviceRoleKey || '', {
  auth: { persistSession: false }
});

export default supabaseServer;
