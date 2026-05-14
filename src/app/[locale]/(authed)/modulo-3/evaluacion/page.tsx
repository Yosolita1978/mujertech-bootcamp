import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import AssessmentForm from './AssessmentForm';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

// Pairs the i18n field key (camelCase) with the snake_case row column so the
// read-only "already submitted" view can iterate without duplicating strings.
const FIELDS = [
  { key: 'businessGoal', column: 'business_goal' },
  { key: 'promptV1', column: 'prompt_v1' },
  { key: 'aiOutput', column: 'ai_output' },
  { key: 'promptV2', column: 'prompt_v2' },
  { key: 'whatChanged', column: 'what_changed' },
  { key: 'whyChanged', column: 'why_changed' },
] as const;

export default async function AssessmentPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const { data: existing, error } = await supabase
    .from('marketing_assessment_submissions')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load assessment: ${error.message}`);
  }

  const t = await getTranslations('assessment');

  if (existing) {
    const formattedDate = new Intl.DateTimeFormat(locale, {
      dateStyle: 'long',
    }).format(new Date(existing.created_at));

    return (
      <main className={styles.main}>
        <div className={styles.card}>
          <h1 className={styles.title}>{t('alreadySubmitted.title')}</h1>
          <p className={styles.subtitle}>
            {t('alreadySubmitted.body', { date: formattedDate })}
          </p>

          <dl className={styles.readonlyList}>
            {FIELDS.map((f) => (
              <div key={f.key} className={styles.readonlyItem}>
                <dt className={styles.readonlyLabel}>
                  {t(`fields.${f.key}.label`)}
                </dt>
                <dd className={styles.readonlyValue}>{existing[f.column]}</dd>
              </div>
            ))}
          </dl>

          <Link href="/" className={styles.backLink}>
            {t('alreadySubmitted.backToDashboard')}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('subtitle')}</p>
        <p className={styles.intro}>{t('intro')}</p>
        <AssessmentForm />
      </div>
    </main>
  );
}
