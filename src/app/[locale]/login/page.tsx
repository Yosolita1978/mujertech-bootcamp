import { redirect } from 'next/navigation';
import { setRequestLocale, getTranslations } from 'next-intl/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import LoginForm from './LoginForm';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

type Accent = 'teal' | 'coral' | 'plum' | 'amber';

const ACCENT_CLASS: Record<Accent, string> = {
  teal: styles.previewTeal,
  coral: styles.previewCoral,
  plum: styles.previewPlum,
  amber: styles.previewAmber,
};

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Already signed in? Send them to the dashboard instead of the landing.
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) {
    redirect(`/${locale}`);
  }

  const t = await getTranslations('auth.login.landing');
  const tModules = await getTranslations('progress.modules');
  const tM1 = await getTranslations('module1');
  const tM2 = await getTranslations('module2');
  const tM3 = await getTranslations('module3');

  const previews: ReadonlyArray<{
    icon: string;
    accent: Accent;
    title: string;
    tagline: string;
    isBonus: boolean;
  }> = [
    {
      icon: '🤖',
      accent: 'teal',
      title: tModules('module1'),
      tagline: tM1('subtitle'),
      isBonus: false,
    },
    {
      icon: '💬',
      accent: 'coral',
      title: tModules('module2'),
      tagline: tM2('subtitle'),
      isBonus: false,
    },
    {
      icon: '🎯',
      accent: 'plum',
      title: tModules('module3'),
      tagline: tM3('subtitle'),
      isBonus: false,
    },
    {
      icon: '✨',
      accent: 'amber',
      title: tModules('capstone'),
      tagline: t('capstoneTagline'),
      isBonus: true,
    },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.landing}>
        <section className={styles.hero}>
          <p className={styles.kicker}>{t('kicker')}</p>
          <h1 className={styles.headline}>{t('headline')}</h1>
          <p className={styles.subhead}>{t('subhead')}</p>
          <div className={styles.card}>
            <LoginForm />
            <p className={styles.reassurance}>{t('reassurance')}</p>
          </div>
        </section>

        <section className={styles.modules}>
          <div className={styles.modulesHeading}>
            <h2 className={styles.modulesTitle}>{t('modulesTitle')}</h2>
            <p className={styles.lockedHint}>
              <span aria-hidden="true">🔒</span> {t('lockedHint')}
            </p>
          </div>

          <ul className={styles.moduleList}>
            {previews.map((card) => (
              <li
                key={card.title}
                className={`${styles.previewCard} ${ACCENT_CLASS[card.accent]}`}
              >
                {card.isBonus && (
                  <span className={styles.bonusBadge}>{t('bonusBadge')}</span>
                )}
                <span className={styles.previewIcon} aria-hidden="true">
                  {card.icon}
                </span>
                <div className={styles.previewBody}>
                  <h3 className={styles.previewTitle}>{card.title}</h3>
                  <p className={styles.previewTagline}>{card.tagline}</p>
                </div>
                <span className={styles.previewLock} aria-hidden="true">
                  🔒
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
