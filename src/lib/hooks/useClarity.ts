'use client';

import { useEffect, useCallback } from 'react';

const isDev = process.env.NODE_ENV === 'development';

export function useClarity(currentModule: string | undefined) {
  useEffect(() => {
    if (typeof window === 'undefined' || !window.clarity || !currentModule) return;

    window.clarity('set', 'module', currentModule);
    window.clarity('event', `module_${currentModule}`);
  }, [currentModule]);

  const trackEvent = useCallback(
    (eventName: string, eventData?: Record<string, unknown>) => {
      if (isDev) {
        console.log('[Clarity Event]', eventName, eventData);
      }

      if (typeof window === 'undefined' || !window.clarity) {
        if (isDev) {
          console.warn('[Clarity] window.clarity not available');
        }
        return;
      }

      window.clarity('event', eventName);

      if (eventData) {
        Object.entries(eventData).forEach(([key, value]) => {
          window.clarity?.('set', key, String(value));
        });
      }
    },
    []
  );

  const setTag = useCallback((key: string, value: unknown) => {
    if (typeof window === 'undefined' || !window.clarity) return;
    window.clarity('set', key, String(value));
  }, []);

  return { trackEvent, setTag };
}
