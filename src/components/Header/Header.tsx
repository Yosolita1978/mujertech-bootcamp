'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import { Link } from '@/i18n/navigation';
import { signOutAction } from '@/app/actions/auth';
import styles from './Header.module.css';

type Props = {
  onGlossaryOpen: () => void;
  userEmail: string | null;
  isAdmin: boolean;
};

export default function Header({ onGlossaryOpen, userEmail, isAdmin }: Props) {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link href="/" className={styles.logo} aria-label={t('title')}>
          <Image
            src="/images/logomujertech1.png"
            alt="MujerTech Logo"
            width={80}
            height={80}
            className={styles.logoImage}
            priority
          />
          <span className={styles.brandText}>{t('title')}</span>
        </Link>
        <div className={styles.headerRight}>
          <LanguageSwitcher />
          <button
            className={styles.glossaryBtn}
            onClick={onGlossaryOpen}
            type="button"
            aria-label={t('help')}
          >
            <span className={styles.glossaryIcon}>📖</span>
            <span className={styles.btnLabel}>{t('help')}</span>
          </button>
          {isAdmin && (
            <Link
              href="/admin"
              className={styles.adminBtn}
              aria-label={t('admin')}
            >
              <span className={styles.glossaryIcon}>⚙️</span>
              <span className={styles.btnLabel}>{t('admin')}</span>
            </Link>
          )}
          {userEmail && (
            <form action={signOutAction}>
              <button className={styles.signOutBtn} type="submit">
                {tAuth('signOut')}
              </button>
            </form>
          )}
        </div>
      </div>
    </header>
  );
}
