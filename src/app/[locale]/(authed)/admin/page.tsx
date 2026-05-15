import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createSupabaseAdminClient } from '@/lib/supabase/admin';
import { isAdminEmail } from '@/lib/admin';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

const FIELDS = [
  { key: 'businessGoal', column: 'business_goal' },
  { key: 'promptV1', column: 'prompt_v1' },
  { key: 'aiOutput', column: 'ai_output' },
  { key: 'promptV2', column: 'prompt_v2' },
  { key: 'whatChanged', column: 'what_changed' },
  { key: 'whyChanged', column: 'why_changed' },
] as const;

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // (authed) layout already redirects unauthenticated users; we re-check here
  // because we need user.email for the admin-allowlist comparison and TS
  // narrowing.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    redirect(`/${locale}/login`);
  }

  if (!isAdminEmail(user.email)) {
    redirect(`/${locale}`);
  }

  const admin = createSupabaseAdminClient();

  const { data: submissions, error: subError } = await admin
    .from('marketing_assessment_submissions')
    .select('*')
    .order('created_at', { ascending: false });

  if (subError) {
    throw new Error(`Failed to load submissions: ${subError.message}`);
  }

  // One round-trip to build a user_id → email map. Default page size is 50;
  // when traffic grows past that we'll need pagination here.
  const { data: usersData, error: usersError } =
    await admin.auth.admin.listUsers();
  if (usersError) {
    throw new Error(`Failed to load users: ${usersError.message}`);
  }
  const emailById = new Map<string, string>();
  for (const u of usersData.users) {
    if (u.email) emailById.set(u.id, u.email);
  }

  const t = await getTranslations('admin');
  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <div className={styles.container}>
      <header className={styles.heading}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>
          {t('subtitle', { count: submissions.length })}
        </p>
      </header>

      {submissions.length === 0 ? (
        <p className={styles.empty}>{t('empty')}</p>
      ) : (
        <ul className={styles.list}>
          {submissions.map((s) => {
            const email = emailById.get(s.user_id) ?? '—';
            const formattedDate = dateFormatter.format(new Date(s.created_at));
            const preview =
              s.business_goal.length > 80
                ? `${s.business_goal.slice(0, 80)}…`
                : s.business_goal;
            return (
              <li key={s.id} className={styles.row}>
                <details className={styles.details}>
                  <summary className={styles.summary}>
                    <span className={styles.summaryMeta}>
                      <span className={styles.summaryEmail}>{email}</span>
                      <span className={styles.summaryDate}>
                        {formattedDate}
                      </span>
                    </span>
                    <span className={styles.summaryPreview}>{preview}</span>
                  </summary>
                  <dl className={styles.detailList}>
                    {FIELDS.map((f) => (
                      <div key={f.key} className={styles.detailItem}>
                        <dt className={styles.detailLabel}>
                          {t(`fields.${f.key}`)}
                        </dt>
                        <dd className={styles.detailValue}>{s[f.column]}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
