import { setRequestLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import styles from './page.module.css';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function Module3StubPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('module3Stub');

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <span className={styles.icon} aria-hidden="true">
          🚧
        </span>
        <h1 className={styles.title}>{t('title')}</h1>
        <p className={styles.body}>{t('body')}</p>
        <Link href="/" className={styles.backLink}>
          ← {t('back')}
        </Link>
      </div>
    </div>
  );
}
