import React, { useState, useEffect, memo } from 'react';
import { Timer } from './Timer';

interface TimerDisplayProps {
  endTime: number;
  totalTime?: number;
  onTimeUp: () => void;
}

export const TimerDisplay = memo(function TimerDisplay({ endTime, totalTime = 60, onTimeUp }: TimerDisplayProps) {
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, Math.ceil((endTime - Date.now()) / 1000)));

  useEffect(() => {
    const initialRemaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
    setTimeLeft(initialRemaining);
    if (initialRemaining <= 0) {
      onTimeUp();
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      
      if (remaining <= 0) {
        clearInterval(interval);
        onTimeUp();
      }
    }, 500);

    return () => clearInterval(interval);
  }, [endTime, onTimeUp]);

  return <Timer timeLeft={timeLeft} totalTime={totalTime} />;
});
