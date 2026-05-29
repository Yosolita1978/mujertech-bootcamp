import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

const EMAIL_COOKIE = 'last_login_email';

export default async function LoginPage({ params, searchParams }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already signed in? Send them to the dashboard instead of showing the form.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(`/${locale}`);
  }

  const sp = await searchParams;
  const errorParam = typeof sp.error === 'string' ? sp.error : null;

  const cookieStore = await cookies();
  const rememberedEmail = cookieStore.get(EMAIL_COOKIE)?.value ?? '';

  const t = await getTranslations('auth.login');
  const tCallback = await getTranslations('auth.callback');

  const showInvalidLinkError = errorParam === 'invalid_link';
  const errorBody =
    showInvalidLinkError && rememberedEmail
      ? tCallback('errorBodyWithEmail', { email: rememberedEmail })
      : tCallback('errorBody');

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>

        {showInvalidLinkError && (
          <div className={styles.calloutError} role="alert">
            <p className={styles.calloutTitle}>{tCallback('errorTitle')}</p>
            <p>{errorBody}</p>
          </div>
        )}

        <LoginForm defaultEmail={rememberedEmail} />
      </div>
    </main>
  );
}
