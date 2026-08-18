/**
 * Restaurant open/pause control card.
 * Uses getRestaurantStatus() and updates is_paused & pause_message via PATCH /api/admin/config.
 */

'use client';

import { useState } from 'react';
import type { AppConfig } from '@/types/config';
import { getRestaurantStatus } from '@/lib/openingHours';

type RestaurantControlCardProps = {
  config: AppConfig;
  onConfigChange: () => void;
};

export function RestaurantControlCard({ config, onConfigChange }: RestaurantControlCardProps) {
  const [pauseMsg, setPauseMsg] = useState(config.pauseMessage || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [msgSaved, setMsgSaved] = useState(false);

  const status = getRestaurantStatus(config);

  async function togglePause() {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'is_paused', value: config.isPaused ? 'false' : 'true' }),
      });
      if (res.ok) {
        onConfigChange();
      }
    } catch {
      // error handled silently
    } finally {
      setIsUpdating(false);
    }
  }

  async function savePauseMessage() {
    setIsUpdating(true);
    setMsgSaved(false);
    try {
      const res = await fetch('/api/admin/config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'pause_message', value: pauseMsg }),
      });
      if (res.ok) {
        setMsgSaved(true);
        setTimeout(() => setMsgSaved(false), 2500);
        onConfigChange();
      }
    } catch {
      // error handled silently
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Restaurangstatus
          </h2>
          <p className="text-xs text-white/40 mt-0.5">{status.message}</p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            status.state === 'OPEN'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : status.state === 'PAUSED'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
          }`}
        >
          {status.state}
        </span>
      </div>

      <div className="pt-2 border-t border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-white">Pausa beställningar</p>
          <p className="text-[11px] text-white/40">
            Stoppar tillfälligt nya order i kassan och köket
          </p>
        </div>
        <button
          type="button"
          onClick={togglePause}
          disabled={isUpdating}
          className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 ${
            config.isPaused
              ? 'bg-green-600 hover:bg-green-500 text-white'
              : 'bg-amber-600 hover:bg-amber-500 text-white'
          }`}
        >
          {isUpdating ? '...' : config.isPaused ? 'Återuppta order' : 'Pausa order'}
        </button>
      </div>

      <div className="space-y-2 pt-2 border-t border-white/10">
        <label className="text-xs font-semibold text-white/70 block">
          Pausmeddelande till kunder
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={pauseMsg}
            onChange={(e) => setPauseMsg(e.target.value)}
            placeholder="t.ex. Vi har hög belastning och pausar 15 min."
            className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 flex-1 focus:outline-none focus:border-brand-gold"
          />
          <button
            type="button"
            onClick={savePauseMessage}
            disabled={isUpdating}
            className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {msgSaved ? 'Sparat!' : 'Spara'}
          </button>
        </div>
      </div>
    </div>
  );
}
