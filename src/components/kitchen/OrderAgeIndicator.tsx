/**
 * Displays the elapsed time since an order was created.
 * Turns red if elapsed time exceeds configured threshold.
 */

'use client';

import { useState, useEffect } from 'react';
import { differenceInMinutes } from 'date-fns';

type OrderAgeIndicatorProps = {
  createdAt: string;
  thresholdMins?: number;
};

export function OrderAgeIndicator({ createdAt, thresholdMins = 30 }: OrderAgeIndicatorProps) {
  const [elapsedMins, setElapsedMins] = useState(0);

  useEffect(() => {
    function updateAge() {
      const created = new Date(createdAt);
      const diff = Math.max(0, differenceInMinutes(new Date(), created));
      setElapsedMins(diff);
    }

    updateAge();
    const interval = setInterval(updateAge, 10000); // update every 10s
    return () => clearInterval(interval);
  }, [createdAt]);

  const isOverThreshold = elapsedMins >= thresholdMins;

  return (
    <span
      className={`font-mono text-xs px-2 py-0.5 rounded font-bold transition-colors ${
        isOverThreshold
          ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
          : 'bg-white/10 text-white/70'
      }`}
    >
      ⏱ {elapsedMins} min
    </span>
  );
}
