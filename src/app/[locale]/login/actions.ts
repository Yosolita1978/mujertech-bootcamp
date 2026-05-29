'use server';

import { redirect } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithOtp({ email });

  if (error) {
    if (error.status === 429) {
      return { status: 'error', email, message: t('rateLimited') };
    }
    if (error.message.toLowerCase().includes('email')) {
      return { status: 'error', message: t('invalidEmail') };
    }
    return { status: 'error', email, message: t('generic') };
  }

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

  // Accept the code at whatever length Supabase sends it (6–10 digits).
  // Strip anything that isn't a digit so spaces/dashes pasted from the email
  // don't trip up verification.
  const code = typeof codeRaw === 'string' ? codeRaw.replace(/\D/g, '') : '';
  if (code === '') {
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

  redirect(`/${locale}`);
}
