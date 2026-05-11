'use client';

import { useEffect } from 'react';
import type { NotificationType } from '@/lib/hooks/useNotification';
import styles from './Notification.module.css';

type Props = {
  message: string;
  type?: NotificationType;
  isVisible: boolean;
  onHide: () => void;
};

export default function Notification({
  message,
  type = 'info',
  isVisible,
  onHide,
}: Props) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onHide();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onHide]);

  const variantClass: Record<NotificationType, string> = {
    info: styles.info,
    success: styles.success,
    error: styles.error,
  };

  return (
    <div className={styles.container}>
      <div
        className={`${styles.notification} ${variantClass[type]} ${isVisible ? styles.show : ''}`}
      >
        {message}
      </div>
    </div>
  );
}
