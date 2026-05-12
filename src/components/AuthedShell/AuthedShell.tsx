'use client';

import { useState, type ReactNode } from 'react';
import Header from '@/components/Header/Header';
import Glossary from '@/components/Glossary/Glossary';
import Notification from '@/components/Notification/Notification';
import { useNotification } from '@/lib/hooks/useNotification';
import { NotificationProvider } from './NotificationContext';
import styles from './AuthedShell.module.css';

type Props = {
  userEmail: string;
  children: ReactNode;
};

export default function AuthedShell({ userEmail, children }: Props) {
  const [glossaryOpen, setGlossaryOpen] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  return (
    <NotificationProvider value={showNotification}>
      <Header userEmail={userEmail} onGlossaryOpen={() => setGlossaryOpen(true)} />
      <main className={styles.main}>{children}</main>
      <Glossary isOpen={glossaryOpen} onClose={() => setGlossaryOpen(false)} />
      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onHide={hideNotification}
      />
    </NotificationProvider>
  );
}
