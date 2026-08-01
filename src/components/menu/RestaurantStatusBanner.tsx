/**
 * Banner shown at the top of the order page
 * indicating whether the restaurant is currently
 * accepting orders.
 *
 * Polls /api/status every 60 seconds to stay current.
 * Shows different colours and messages per state.
 */

'use client';

import { useState, useEffect } from 'react';

export type StatusState = 'OPEN' | 'BREAK' | 'CLOSED' | 'PAUSED' | 'LOADING';

export type StatusData = {
  state: StatusState;
  message: string;
  nextOpenTime: string | null;
  estimatedDeliveryMins: number;
  estimatedPickupMins: number;
  unavailableItemIds: string[];
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
};

type RestaurantStatusBannerProps = {
  onStatusLoad?: (data: StatusData) => void;
};

export default function RestaurantStatusBanner({ onStatusLoad }: RestaurantStatusBannerProps) {
  const [status, setStatus] = useState<StatusState>('LOADING');
  const [message, setMessage] = useState('');

  async function fetchStatus() {
    try {
      const response = await fetch('/api/status');
      const data: StatusData = await response.json();
      setStatus(data.state);
      setMessage(data.message);
      onStatusLoad?.(data);
    } catch {
      // If status fetch fails, assume open to avoid
      // blocking orders unnecessarily
      setStatus('OPEN');
      setMessage('');
    }
  }

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (status === 'LOADING') return null;

  if (status === 'OPEN') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-green-500/10 border-b border-green-500/20">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse shrink-0" />
        <span className="text-green-400 text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (status === 'BREAK') {
    return (
      <div className="flex items-center gap-2 px-6 py-3 bg-amber-500/10 border-b border-amber-500/20">
        <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
        <span className="text-amber-400 text-sm font-medium">{message}</span>
      </div>
    );
  }

  if (status === 'PAUSED') {
    return (
      <div className="px-6 py-4 bg-amber-500/10 border-b border-amber-500/20">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-amber-400 text-lg">⏸</span>
          <span className="text-amber-400 font-display uppercase tracking-wide text-sm font-bold">
            Tillfälligt pausat
          </span>
        </div>
        <p className="text-amber-300/70 text-sm">{message}</p>
      </div>
    );
  }

  // CLOSED state
  return (
    <div className="px-6 py-4 bg-red-500/10 border-b border-red-500/20">
      <div className="flex items-center gap-2 mb-1">
        <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        <span className="text-red-400 font-display uppercase tracking-wide text-sm font-bold">
          Stängt
        </span>
      </div>
      <p className="text-red-300/70 text-sm">{message}</p>
    </div>
  );
}
