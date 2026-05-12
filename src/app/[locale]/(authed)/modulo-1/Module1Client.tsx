'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Module1 from '@/components/modules/Module1/Module1';
import { useProgress } from '@/lib/hooks/useProgress';
import { useNotificationContext } from '@/components/AuthedShell/NotificationContext';

type Props = {
  lessonId: string;
};

export default function Module1Client({ lessonId }: Props) {
  const router = useRouter();
  const showNotification = useNotificationContext();
  const { markStarted, markCompleted } = useProgress(lessonId);

  useEffect(() => {
    void markStarted();
  }, [markStarted]);

  const handleNext = async () => {
    await markCompleted();
    router.push('/');
  };

  const handlePrev = () => {
    router.push('/');
  };

  return (
    <Module1
      onNext={handleNext}
      onPrev={handlePrev}
      showNotification={showNotification}
      hidePrev={false}
    />
  );
}
