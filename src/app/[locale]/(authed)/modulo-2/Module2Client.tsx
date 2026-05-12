'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Module2 from '@/components/modules/Module2/Module2';
import { useProgress } from '@/lib/hooks/useProgress';
import { useNotificationContext } from '@/components/AuthedShell/NotificationContext';

type Props = {
  lessonId: string;
};

export default function Module2Client({ lessonId }: Props) {
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
    <Module2
      onNext={handleNext}
      onPrev={handlePrev}
      showNotification={showNotification}
      hidePrev={false}
    />
  );
}
