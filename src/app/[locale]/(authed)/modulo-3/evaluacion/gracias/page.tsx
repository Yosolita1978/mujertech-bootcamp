import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from '../page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function GraciasPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('assessment.thanks');

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.subtitle}>{t('body')}</p>
        <Link href="/" className={styles.backLink}>
          {t('backToDashboard')}
        </Link>
      </div>
    </main>
  );
}
