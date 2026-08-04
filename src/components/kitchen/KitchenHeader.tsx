/**
 * Top header bar for kitchen dashboard.
 * Includes pause/resume control, auto-print toggle, audio unlock hint, and current clock.
 */

'use client';

import { useState, useEffect } from 'react';
import { playNewOrderSound } from '@/lib/soundAlert';

type KitchenHeaderProps = {
  isPaused: boolean;
  autoPrint: boolean;
  onTogglePause: () => void;
  onToggleAutoPrint: () => void;
};

export function KitchenHeader({
  isPaused,
  autoPrint,
  onTogglePause,
  onToggleAutoPrint,
}: KitchenHeaderProps) {
  const [clock, setClock] = useState('');

  useEffect(() => {
    function updateClock() {
      const now = new Date();
      setClock(now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' }));
    }
    updateClock();
    const interval = setInterval(updateClock, 10000);
    return () => clearInterval(interval);
  }, []);

  function handleSoundTest() {
    playNewOrderSound();
  }

  return (
    <header className="bg-black border-b border-white/10 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-xl md:text-2xl text-brand-gold uppercase tracking-wider font-bold">
          KÖKSDASHBOARD
        </h1>
        <span className="font-mono text-lg font-bold text-white/80 bg-white/5 px-2 py-0.5 rounded border border-white/10">
          {clock}
        </span>
      </div>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Sound Test / Enable Button */}
        <button
          onClick={handleSoundTest}
          title="Klicka för att testa/aktivera ljud"
          className="px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors flex items-center gap-1"
        >
          <span>🔔 Test-ljud</span>
        </button>

        {/* Auto-print toggle */}
        <button
          onClick={onToggleAutoPrint}
          className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1 border ${
            autoPrint
              ? 'bg-blue-600/20 border-blue-500 text-blue-300'
              : 'bg-white/5 border-white/10 text-white/50 hover:text-white'
          }`}
        >
          <span>🖨️ Automatisk utskrift: {autoPrint ? 'PÅ' : 'AV'}</span>
        </button>

        {/* Pause/Resume toggle */}
        <button
          onClick={onTogglePause}
          className={`px-4 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-colors border ${
            isPaused
              ? 'bg-red-600 text-white border-red-500 animate-pulse'
              : 'bg-green-600 hover:bg-green-500 text-white border-green-500'
          }`}
        >
          {isPaused ? '🔴 PAUSAD (Klicka för AKTIV)' : '🟢 AKTIV (Klicka för PAUS)'}
        </button>
      </div>
    </header>
  );
}
