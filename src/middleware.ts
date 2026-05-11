import createIntlMiddleware from 'next-intl/middleware';
import type { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { updateSession } from './lib/supabase/middleware';

const intlMiddleware = createIntlMiddleware(routing);

export default async function middleware(request: NextRequest): Promise<NextResponse> {
  // next-intl handles locale negotiation and may produce a redirect or rewrite.
  // We then layer Supabase's session cookie refresh onto whatever response it
  // returns so that auth state stays alive across navigations.
  const response = intlMiddleware(request);
  return updateSession(request, response);
}

export const config = {
  // Match all pathnames except:
  // - API / tRPC routes, Next internals, Vercel internals
  // - any path containing a dot (static files like favicon.ico, images)
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
};
