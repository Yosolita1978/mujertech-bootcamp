'use client';

import { useTranslations } from 'next-intl';
import styles from './SuccessCriteria.module.css';

type Props =
  | { mode: 'intro'; outcomes: readonly string[] }
  | { mode: 'completion'; completionText: string };

export default function SuccessCriteria(props: Props) {
  const t = useTranslations('successCriteria');

  if (props.mode === 'intro') {
    return (
      <div className={styles.introCard}>
        <div className={styles.header}>
          <span className={styles.icon}>🎯</span>
          <h3>{t('introTitle')}</h3>
        </div>
        <ul className={styles.outcomesList}>
          {props.outcomes.map((outcome, index) => (
            <li key={index}>
              <span className={styles.bullet}>✦</span>
              <span>{outcome}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className={styles.completionCard}>
      <div className={styles.header}>
        <span className={styles.icon}>✅</span>
        <h3>{t('completionTitle')}</h3>
      </div>
      <p className={styles.completionText}>{props.completionText}</p>
    </div>
  );
}
