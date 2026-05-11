'use client';

import { useTranslations } from 'next-intl';
import styles from './ProgressBar.module.css';

const DISPLAY_MODULES = ['module1', 'module2', 'module3'] as const;
export type DisplayModule = (typeof DISPLAY_MODULES)[number];

type Props = {
  currentModule: DisplayModule;
};

export default function ProgressBar({ currentModule }: Props) {
  const t = useTranslations('progress');

  const currentIndex = DISPLAY_MODULES.indexOf(currentModule);
  const totalModules = DISPLAY_MODULES.length;
  const progress = ((currentIndex + 1) / totalModules) * 100;

  const blockText = t('blockOf', { current: currentIndex + 1, total: totalModules });
  const sectionName = t(`modules.${currentModule}`);

  return (
    <div className={styles.progressIndicator}>
      <div className={styles.progressInfo}>
        <span className={styles.progressText}>{blockText}</span>
        <span className={styles.progressPercent}>{Math.round(progress)}%</span>
      </div>
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>
      <span className={styles.currentSection}>{sectionName}</span>
    </div>
  );
}
