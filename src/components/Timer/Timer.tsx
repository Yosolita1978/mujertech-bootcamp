'use client';

import { useState, useEffect } from 'react';
import styles from './Timer.module.css';

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (totalSeconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.timerContainer}>
      <span className={styles.timerIcon}>⏱️</span>
      <span className={styles.timer}>{formatTime(seconds)}</span>
    </div>
  );
}
