import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

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

  const t = await getTranslations('auth.login');
  const tCallback = await getTranslations('auth.callback');

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>

        {errorParam === 'invalid_link' && (
          <div className={styles.calloutError} role="alert">
            <p className={styles.calloutTitle}>{tCallback('errorTitle')}</p>
            <p>{tCallback('errorBody')}</p>
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
