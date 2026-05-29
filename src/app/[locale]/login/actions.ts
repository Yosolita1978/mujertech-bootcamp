'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const EMAIL_COOKIE = 'last_login_email';
const EMAIL_COOKIE_MAX_AGE = 60 * 30; // 30 minutes — survives email scan + user reading

export type LoginState =
  | { status: 'idle' }
  | { status: 'codeSent'; email: string }
  | { status: 'error'; email?: string; message: string };

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
      return { status: 'error', email, message: t('rateLimited') };
    }
    if (error.message.toLowerCase().includes('email')) {
      return { status: 'error', message: t('invalidEmail') };
    }
    return { status: 'error', email, message: t('generic') };
  }

  // Persist the email so /login can pre-fill it if the magic link later fails
  // (e.g., Gmail's link scanner consumed the token before the user clicked).
  const cookieStore = await cookies();
  cookieStore.set(EMAIL_COOKIE, email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: EMAIL_COOKIE_MAX_AGE,
  });

  return { status: 'codeSent', email };
}

export async function verifyOtpCodeAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: 'auth.login.errors' });

  const emailRaw = formData.get('email');
  const codeRaw = formData.get('code');

  if (typeof emailRaw !== 'string' || emailRaw.trim() === '') {
    return { status: 'error', message: t('invalidEmail') };
  }
  const email = emailRaw.trim();

  if (typeof codeRaw !== 'string') {
    return { status: 'error', email, message: t('invalidCode') };
  }
  const code = codeRaw.replace(/\D/g, '');
  if (code.length !== 6) {
    return { status: 'error', email, message: t('invalidCode') };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: 'email',
  });

  if (error) {
    if (error.status === 429) {
      return { status: 'error', email, message: t('rateLimited') };
    }
    return { status: 'error', email, message: t('invalidCode') };
  }

  const cookieStore = await cookies();
  cookieStore.delete(EMAIL_COOKIE);

  redirect(`/${locale}`);
}
