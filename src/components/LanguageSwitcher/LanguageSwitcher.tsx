'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import type { Locale } from '@/i18n/routing';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div className={styles.switcher}>
      <button
        className={`${styles.langBtn} ${locale === 'es' ? styles.active : ''}`}
        onClick={() => switchLocale('es')}
        type="button"
        aria-label="Cambiar a español"
      >
        ES
      </button>
      <button
        className={`${styles.langBtn} ${locale === 'en' ? styles.active : ''}`}
        onClick={() => switchLocale('en')}
        type="button"
        aria-label="Switch to English"
      >
        EN
      </button>
    </div>
  );
}
