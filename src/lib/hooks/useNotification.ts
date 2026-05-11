'use client';

import { useState, useCallback } from 'react';

export type NotificationType = 'info' | 'success' | 'error';

export type NotificationState = {
  message: string;
  type: NotificationType;
  isVisible: boolean;
};

const INITIAL_STATE: NotificationState = {
  message: '',
  type: 'info',
  isVisible: false,
};

export function useNotification() {
  const [notification, setNotification] = useState<NotificationState>(INITIAL_STATE);

  const showNotification = useCallback(
    (message: string, type: NotificationType = 'info') => {
      setNotification({ message, type, isVisible: true });
    },
    []
  );

  const hideNotification = useCallback(() => {
    setNotification((prev) => ({ ...prev, isVisible: false }));
  }, []);

  return {
    notification,
    showNotification,
    hideNotification,
  };
}
