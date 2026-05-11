import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

type Params = { locale: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<Params> }
): Promise<NextResponse> {
  const { locale } = await params;
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=invalid_link`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/${locale}/login?error=invalid_link`);
  }

  return NextResponse.redirect(`${origin}/${locale}/`);
}
