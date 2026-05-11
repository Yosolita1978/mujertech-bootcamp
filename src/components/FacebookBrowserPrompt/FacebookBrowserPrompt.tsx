'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import styles from './FacebookBrowserPrompt.module.css';

const STORAGE_KEY = 'mujertech_fb_prompt_dismissed';

function isFacebookBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = navigator.userAgent || navigator.vendor || '';
  return /FBAN|FBAV|FB_IAB|Instagram/i.test(ua);
}

export default function FacebookBrowserPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = useTranslations('facebookPrompt');

  useEffect(() => {
    if (!isFacebookBrowser()) return;

    try {
      const dismissed = localStorage.getItem(STORAGE_KEY);
      if (!dismissed) {
        setTimeout(() => setIsVisible(true), 100);
      }
    } catch {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, []);

  const handleDismiss = () => {
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      /* localStorage may be blocked (private mode, embedded browsers) — no recovery needed */
    }
    setIsVisible(false);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isVisible) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.icon}>🌐</div>
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>

        <div className={styles.instructions}>
          <p className={styles.instructionTitle}>{t('howTo')}</p>
          <ol>
            <li>{t('step1')}</li>
            <li>{t('step2')}</li>
            <li>{t('step3')}</li>
          </ol>
        </div>

        <button className={styles.btnCopy} onClick={handleCopyLink} type="button">
          {copied ? t('copied') : t('copyLink')}
        </button>

        <button className={styles.btnContinue} onClick={handleDismiss} type="button">
          {t('continueAnyway')}
        </button>
      </div>
    </div>
  );
}
