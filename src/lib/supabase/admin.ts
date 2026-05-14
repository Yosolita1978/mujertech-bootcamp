import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Server-only Supabase client backed by the service-role key. Bypasses RLS.
// MUST NOT be imported from any Client Component or file that ships to the
// browser. Use only from server actions, route handlers, or Server Components
// gated to admin users (see /[locale]/admin).
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error('Missing env var: NEXT_PUBLIC_SUPABASE_URL is required.');
  }
  if (!serviceRoleKey) {
    throw new Error('Missing env var: SUPABASE_SERVICE_ROLE_KEY is required.');
  }

  return createClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
