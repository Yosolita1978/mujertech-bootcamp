'use client';

import { useCallback } from 'react';
import {
  markLessonStartedAction,
  markLessonCompletedAction,
} from '@/lib/progress/actions';

export type UseProgress = {
  markStarted: () => Promise<void>;
  markCompleted: () => Promise<void>;
};

export function useProgress(lessonId: string): UseProgress {
  const markStarted = useCallback(async (): Promise<void> => {
    await markLessonStartedAction(lessonId);
  }, [lessonId]);

  const markCompleted = useCallback(async (): Promise<void> => {
    await markLessonCompletedAction(lessonId);
  }, [lessonId]);

  return { markStarted, markCompleted };
}
