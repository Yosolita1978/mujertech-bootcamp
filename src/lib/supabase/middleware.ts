import { createServerClient, type CookieOptions } from '@supabase/ssr';
import type { NextRequest, NextResponse } from 'next/server';
import type { Database } from './types';

/**
 * Attach refreshed Supabase auth cookies to `response`.
 *
 * Called from `src/middleware.ts` after next-intl produces its NextResponse.
 * Reads cookies from the incoming request, writes refreshed cookies to the
 * outgoing response. The `getUser()` call at the end is what triggers the
 * SDK to refresh expired access tokens via the cookie setter.
 */
export async function updateSession(
  request: NextRequest,
  response: NextResponse
): Promise<NextResponse> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env vars: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.'
    );
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options: CookieOptions }>) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  // Calling getUser() forces a token check; if the access token is expired the
  // SDK refreshes it and writes new cookies via setAll above. The returned
  // value is intentionally unused here — auth state is consumed elsewhere.
  await supabase.auth.getUser();

  return response;
}
