'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/navigation';
import Capstone from '@/components/modules/Capstone/Capstone';
import { useProgress } from '@/lib/hooks/useProgress';
import { useNotificationContext } from '@/components/AuthedShell/NotificationContext';

type Props = {
  lessonId: string;
};

export default function CapstoneClient({ lessonId }: Props) {
  const router = useRouter();
  const showNotification = useNotificationContext();
  const { markStarted, markCompleted } = useProgress(lessonId);

  useEffect(() => {
    void markStarted();
  }, [markStarted]);

  // Capstone exposes a single `onBack` for both the top "back to workshop"
  // button and the final step-9 button. We can't distinguish "exited early"
  // from "finished" without refactoring Capstone, so we mark it complete on
  // any back press. Imperfect but acceptable for a bonus module; revisited
  // in prompt 7 when Capstone is refactored for the assessment UI.
  const handleBack = async () => {
    await markCompleted();
    router.push('/');
  };

  return <Capstone onBack={handleBack} showNotification={showNotification} />;
}
