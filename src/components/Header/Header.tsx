'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import LanguageSwitcher from '@/components/LanguageSwitcher/LanguageSwitcher';
import styles from './Header.module.css';

type Props = {
  onGlossaryOpen: () => void;
};

export default function Header({ onGlossaryOpen }: Props) {
  const t = useTranslations('header');

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.logo}>
          <Image
            src="/images/logomujertech1.png"
            alt="MujerTech Logo"
            width={28}
            height={28}
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
        </div>
      </div>
    </header>
  );
}
