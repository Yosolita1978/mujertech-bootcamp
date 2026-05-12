import { setRequestLocale, getTranslations } from 'next-intl/server';
import { redirect } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import {
  getProgressByModuleSlug,
  type ProgressStatus,
} from '@/lib/progress/queries';
import styles from './page.module.css';

type ModuleSlug = 'module1' | 'module2' | 'module3' | 'capstone';
type ModuleRoute = '/modulo-1' | '/modulo-2' | '/modulo-3' | '/prompts';
type Accent = 'teal' | 'coral' | 'amber' | 'plum' | 'muted';

type ModuleCard = {
  slug: ModuleSlug;
  href: ModuleRoute;
  isBonus: boolean;
  isComingSoon: boolean;
  icon: string;
  accent: Accent;
};

const CARDS: readonly ModuleCard[] = [
  {
    slug: 'module1',
    href: '/modulo-1',
    isBonus: false,
    isComingSoon: false,
    icon: '🤖',
    accent: 'teal',
  },
  {
    slug: 'module2',
    href: '/modulo-2',
    isBonus: false,
    isComingSoon: false,
    icon: '💬',
    accent: 'coral',
  },
  {
    slug: 'module3',
    href: '/modulo-3',
    isBonus: false,
    isComingSoon: false,
    icon: '🎯',
    accent: 'plum',
  },
  {
    slug: 'capstone',
    href: '/prompts',
    isBonus: true,
    isComingSoon: false,
    icon: '✨',
    accent: 'amber',
  },
];

type DisplayStatus = ProgressStatus | 'coming_soon';

function pickUserNameFromEmail(email: string): string | null {
  const part = email.split('@')[0]?.trim();
  return part ? part : null;
}

const ACCENT_CLASS: Record<Accent, string> = {
  teal: styles.cardTeal,
  coral: styles.cardCoral,
  amber: styles.cardAmber,
  plum: styles.cardPlum,
  muted: styles.cardMuted,
};

const STATUS_CLASS: Record<DisplayStatus, string> = {
  not_started: styles.cardStatusNotStarted,
  in_progress: styles.cardStatusInProgress,
  completed: styles.cardStatusCompleted,
  coming_soon: styles.cardStatusComingSoon,
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) {
    redirect(`/${locale}/login`);
  }

  const progress = await getProgressByModuleSlug(user.id);

  const t = await getTranslations('dashboard');
  const tCard = await getTranslations('dashboard.card');
  const tModules = await getTranslations('progress.modules');

  const name = pickUserNameFromEmail(user.email);

  return (
    <div className={styles.container}>
      <header className={styles.heading}>
        <p className={styles.kicker}>{t('kicker')}</p>
        <h1 className={styles.title}>
          {name
            ? t.rich('greetingWithName', {
                name,
                emph: (chunks) => <em>{chunks}</em>,
              })
            : t('greeting')}
        </h1>
        <p className={styles.subheading}>{t('subheading')}</p>
      </header>

      <div className={styles.grid}>
        {CARDS.map((card) => {
          const status: DisplayStatus = card.isComingSoon
            ? 'coming_soon'
            : (progress[card.slug] ?? 'not_started');

          const isLinkable = status !== 'coming_soon';

          const statusLabel =
            status === 'coming_soon'
              ? tCard('status.comingSoon')
              : status === 'completed'
                ? tCard('status.completed')
                : status === 'in_progress'
                  ? tCard('status.inProgress')
                  : tCard('status.notStarted');

          const classes = [
            styles.card,
            ACCENT_CLASS[card.accent],
            STATUS_CLASS[status],
            card.isBonus ? styles.cardBonus : '',
            status === 'completed' ? styles.cardCompleted : '',
            status === 'coming_soon' ? styles.cardComingSoon : '',
          ]
            .filter(Boolean)
            .join(' ');

          const ctaArrow =
            status === 'coming_soon' ? (
              <span className={styles.cardCtaSpacer} aria-hidden="true" />
            ) : status === 'completed' ? (
              <span
                className={`${styles.cardCta} ${styles.cardCtaCompleted}`}
                aria-hidden="true"
              >
                ✓
              </span>
            ) : (
              <span className={styles.cardCta} aria-hidden="true">
                →
              </span>
            );

          const body = (
            <>
              {card.isBonus && (
                <span className={styles.bonusBadge}>{tCard('bonusBadge')}</span>
              )}
              <span className={styles.cardIcon} aria-hidden="true">
                {card.icon}
              </span>
              <div className={styles.cardBody}>
                <h2 className={styles.cardTitle}>{tModules(card.slug)}</h2>
                <span className={styles.cardStatus}>
                  <span className={styles.cardStatusDot} aria-hidden="true" />
                  {statusLabel}
                </span>
              </div>
              {ctaArrow}
            </>
          );

          if (!isLinkable) {
            return (
              <div key={card.slug} className={classes} aria-disabled="true">
                {body}
              </div>
            );
          }

          return (
            <Link
              key={card.slug}
              href={card.href}
              className={classes}
              aria-label={`${tModules(card.slug)} — ${statusLabel}`}
            >
              {body}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
