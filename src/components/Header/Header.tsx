'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import { signOutAction } from '@/app/actions/auth';
import styles from './Header.module.css';

type Props = {
  onGlossaryOpen: () => void;
  userEmail: string | null;
};

export default function Header({ onGlossaryOpen, userEmail }: Props) {
  const t = useTranslations('header');
  const tAuth = useTranslations('auth');

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Image
            src="/images/logomujertech1.png"
            alt="MujerTech Logo"
            width={80}
            height={80}
            className={styles.logoImage}
            priority
          />
          <span>{t('title')}</span>
        </div>
        <div className={styles.headerRight}>
          <LanguageSwitcher />
          <button
            className={styles.glossaryBtn}
            onClick={onGlossaryOpen}
            type="button"
          >
            <span className={styles.glossaryIcon}>📖</span>
            <span>{t('help')}</span>
          </button>
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
