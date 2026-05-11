'use server';

import { headers } from 'next/headers';
import { getLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type LoginState =
  | { status: 'idle' }
  | { status: 'success'; email: string }
  | { status: 'error'; message: string };

export async function signInWithEmailAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'auth.login.errors' });

  const emailRaw = formData.get('email');
  if (typeof emailRaw !== 'string' || emailRaw.trim() === '') {
    return { status: 'error', message: t('invalidEmail') };
  }
  const email = emailRaw.trim();

  const headersList = await headers();
  const host = headersList.get('host');
  const proto = headersList.get('x-forwarded-proto') ?? 'http';
  if (!host) {
    return { status: 'error', message: t('generic') };
  }
  const origin = `${proto}://${host}`;

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${origin}/${locale}/auth/callback`,
    },
  });

  if (error) {
    if (error.status === 429) {
      return { status: 'error', message: t('rateLimited') };
    }
    if (error.message.toLowerCase().includes('email')) {
      return { status: 'error', message: t('invalidEmail') };
    }
    return { status: 'error', message: t('generic') };
  }

  return { status: 'success', email };
}
