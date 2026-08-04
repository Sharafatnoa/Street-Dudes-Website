/**
 * MENY tab: Menu item availability toggles for kitchen staff.
 * Toggles sold-out state per item via PATCH /api/kitchen/availability/[menuItemId].
 */

'use client';

import { useState, useEffect } from 'react';
import { menuCategories } from '@/data/menu';
import { useTranslations } from 'next-intl';

export function MenuAvailabilityTab() {
  const t = useTranslations();
  const [unavailableIds, setUnavailableIds] = useState<Set<string>>(new Set());
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadStatus() {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          const unavail = new Set<string>(data.unavailableItemIds || []);
          setUnavailableIds(unavail);
        }
      } catch {
        // Fallback to empty if status fails
      }
    }
    loadStatus();
  }, []);

  async function toggleAvailability(menuItemId: string, currentlyAvailable: boolean) {
    const nextAvailable = !currentlyAvailable;
    setUpdatingId(menuItemId);

    // Optimistic UI update
    setUnavailableIds((prev) => {
      const next = new Set(prev);
      if (nextAvailable) {
        next.delete(menuItemId);
      } else {
        next.add(menuItemId);
      }
      return next;
    });

    try {
      const res = await fetch(`/api/kitchen/availability/${menuItemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAvailable: nextAvailable }),
      });

      if (!res.ok) {
        // Rollback on error
        setUnavailableIds((prev) => {
          const next = new Set(prev);
          if (currentlyAvailable) {
            next.delete(menuItemId);
          } else {
            next.add(menuItemId);
          }
          return next;
        });
        alert('Kunde inte uppdatera tillgänglighet.');
      }
    } catch {
      alert('Nätverksfel vid uppdatering.');
    } finally {
      setUpdatingId(null);
    }
  }

  const allItems = menuCategories.flatMap((cat) =>
    cat.items.map((item) => ({
      ...item,
      categoryLabel: t(cat.labelKey),
    })),
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="bg-[#111] p-4 rounded-lg border border-white/10">
        <h2 className="text-xl font-display uppercase tracking-wider text-brand-gold font-bold mb-1">
          ARTIKELTILLGÄNGLIGHET
        </h2>
        <p className="text-xs text-white/50">
          Markera rätter som slutsålda när ingredienser tar slut. Ändringar slår igenom direkt på
          menyn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allItems.map((item) => {
          const isAvailable = !unavailableIds.has(item.id);
          const isPending = updatingId === item.id;

          return (
            <div
              key={item.id}
              className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                isAvailable ? 'bg-[#161616] border-white/10' : 'bg-red-950/30 border-red-500/40'
              }`}
            >
              <div>
                <p className="font-bold text-sm text-white">{t(item.nameKey)}</p>
                <p className="text-xs text-white/40">
                  {item.categoryLabel} · {item.price} kr
                </p>
              </div>

              <button
                onClick={() => toggleAvailability(item.id, isAvailable)}
                disabled={isPending}
                className={`px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                  isAvailable
                    ? 'bg-green-600 hover:bg-green-500 text-white'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
              >
                {isPending ? 'Sparar...' : isAvailable ? 'TILLGÄNGLIG' : 'SLUT FÖR IDAG'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
