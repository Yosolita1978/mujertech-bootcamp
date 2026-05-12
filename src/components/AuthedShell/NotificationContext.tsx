'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { NotificationType } from '@/lib/hooks/useNotification';

export type NotificationShower = (message: string, type?: NotificationType) => void;

const NotificationContext = createContext<NotificationShower | null>(null);

type ProviderProps = {
  value: NotificationShower;
  children: ReactNode;
};

export function NotificationProvider({ value, children }: ProviderProps) {
  return (
    <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
  );
}

export function useNotificationContext(): NotificationShower {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      'useNotificationContext must be used within an <AuthedShell>'
    );
  }
  return ctx;
}
