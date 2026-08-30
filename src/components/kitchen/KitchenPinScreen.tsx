/**
 * PIN entry screen for kitchen dashboard authentication.
 * Compares PIN server-side via POST /api/kitchen/auth without exposing KITCHEN_PIN to client.
 */

'use client';

import { useState } from 'react';

type KitchenPinScreenProps = {
  onSuccess: () => void;
};

export function KitchenPinScreen({ onSuccess }: KitchenPinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleDigit(digit: string) {
    if (pin.length < 10) {
      setPin((prev) => prev + digit);
      setError(null);
    }
  }

  function handleClear() {
    setPin('');
    setError(null);
  }

  async function handleSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!pin || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/kitchen/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Fel PIN-kod');
        setPin('');
      }
    } catch {
      setError('Nätverksfel. Försök igen.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="bg-[#141414] border border-white/10 p-6 md:p-8 rounded-xl max-w-sm w-full space-y-6 text-center shadow-2xl">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-gold uppercase tracking-wider">
            KÖKSINLOGGNING
          </h1>
          <p className="text-xs text-white/50 mt-1">Ange PIN-kod för att öppna instrumentpanelen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-black/60 border border-white/10 p-4 rounded-lg flex justify-center items-center h-14">
            <span className="font-mono text-3xl font-bold tracking-widest text-white">
              {'•'.repeat(pin.length) || <span className="text-white/20 text-base">Ange PIN</span>}
            </span>
          </div>

          {error && <p className="text-red-400 text-xs font-bold animate-pulse">{error}</p>}

          <div className="grid grid-cols-3 gap-3">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-lg bg-white/5 hover:bg-white/15 text-white font-mono text-xl font-bold transition-colors border border-white/5"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="h-14 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 font-display text-xs uppercase font-bold transition-colors border border-red-500/20"
            >
              RESA
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 rounded-lg bg-white/5 hover:bg-white/15 text-white font-mono text-xl font-bold transition-colors border border-white/5"
            >
              0
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !pin}
              className="h-14 rounded-lg bg-brand-gold hover:bg-yellow-400 text-brand-black font-display text-xs uppercase tracking-wider font-bold transition-colors disabled:opacity-50"
            >
              {isSubmitting ? '...' : 'OK'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
