/**
 * Container component for Admin Analytics section.
 * Fetches volume, peak-times, and top-items data using a common date range selector.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { OrderVolumeChart } from './OrderVolumeChart';
import { PeakTimesChart } from './PeakTimesChart';
import { TopItemsChart } from './TopItemsChart';

function getDefaultFromDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split('T')[0];
}

function getDefaultToDate(): string {
  return new Date().toISOString().split('T')[0];
}

export function AdminAnalyticsSection() {
  const [fromDate, setFromDate] = useState(getDefaultFromDate());
  const [toDate, setToDate] = useState(getDefaultToDate());

  const [volumeData, setVolumeData] = useState<Array<{ date: string; count: number }>>([]);
  const [peakTimesData, setPeakTimesData] = useState<{
    byDayOfWeek: Array<{ day: string; count: number }>;
    byHour: Array<{ hour: string; count: number }>;
  }>({ byDayOfWeek: [], byHour: [] });
  const [topItemsData, setTopItemsData] = useState<
    Array<{ menuItemId: string; name: string; totalQuantity: number }>
  >([]);

  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    const params = new URLSearchParams({ from: fromDate, to: toDate });
    try {
      const [volRes, peakRes, topRes] = await Promise.all([
        fetch(`/api/admin/analytics/volume?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/admin/analytics/peak-times?${params.toString()}`, { cache: 'no-store' }),
        fetch(`/api/admin/analytics/top-items?${params.toString()}`, { cache: 'no-store' }),
      ]);

      if (volRes.ok) {
        const v = await volRes.json();
        setVolumeData(v.data || []);
      }
      if (peakRes.ok) {
        const p = await peakRes.json();
        setPeakTimesData({
          byDayOfWeek: p.byDayOfWeek || [],
          byHour: p.byHour || [],
        });
      }
      if (topRes.ok) {
        const t = await topRes.json();
        setTopItemsData(t.data || []);
      }
    } catch {
      // Handled silently
    } finally {
      setIsLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Försäljningsanalys
          </h2>
          <p className="text-xs text-white/40">
            Visualisera försäljningsvolymer, toppider och populära produkter
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
          <span className="text-xs text-white/40">till</span>
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="bg-black/60 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-brand-gold"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="p-8 text-center text-xs text-white/40">Laddar analysdata...</div>
      ) : (
        <div className="space-y-6">
          <OrderVolumeChart data={volumeData} />
          <PeakTimesChart byDayOfWeek={peakTimesData.byDayOfWeek} byHour={peakTimesData.byHour} />
          <TopItemsChart data={topItemsData} />
        </div>
      )}
    </div>
  );
}
