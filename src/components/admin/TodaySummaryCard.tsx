/**
 * Display card for today's total order count and revenue summary.
 * Fetches data from GET /api/admin/orders-summary.
 */

'use client';

import { useState, useEffect } from 'react';

type SummaryData = {
  totalOrders: number;
  totalRevenueKr: number;
};

export function TodaySummaryCard() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function fetchSummary() {
    try {
      const res = await fetch('/api/admin/orders-summary', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
      }
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchSummary();
  }, []);

  return (
    <div className="bg-[#141414] border border-white/10 rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white/70 uppercase tracking-wider">
            Dagens Försäljning
          </h2>
          <p className="text-xs text-white/40 mt-0.5">Dagens ordrar och omsättning (Stockholm)</p>
        </div>
        <button
          type="button"
          onClick={fetchSummary}
          className="text-xs text-brand-gold hover:underline font-medium"
        >
          Uppdatera
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
        <div className="bg-black/50 border border-white/5 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Antal Ordrar
          </p>
          <p className="font-mono text-2xl font-bold text-white mt-1">
            {isLoading ? '...' : (summary?.totalOrders ?? 0)}
          </p>
        </div>
        <div className="bg-black/50 border border-white/5 rounded-lg p-3">
          <p className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Intäkter (kr)
          </p>
          <p className="font-mono text-2xl font-bold text-brand-gold mt-1">
            {isLoading ? '...' : `${summary?.totalRevenueKr ?? 0} kr`}
          </p>
        </div>
      </div>
    </div>
  );
}
