/**
 * /admin main dashboard page.
 * Assembles today's summary, restaurant controls, config forms, order history, analytics, and promo code placeholder.
 */

'use client';

import { useState, useEffect } from 'react';
import type { AppConfig } from '@/types/config';
import { TodaySummaryCard } from '@/components/admin/TodaySummaryCard';
import { RestaurantControlCard } from '@/components/admin/RestaurantControlCard';
import { DeliveryConfigForm } from '@/components/admin/DeliveryConfigForm';
import { OpeningHoursForm } from '@/components/admin/OpeningHoursForm';
import { OrderHistoryTable } from '@/components/admin/OrderHistoryTable';
import { AdminAnalyticsSection } from '@/components/admin/analytics/AdminAnalyticsSection';
import { PromoCodesCard } from '@/components/admin/PromoCodesCard';

export default function AdminDashboardPage() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadConfig() {
    try {
      const res = await fetch('/api/admin/config', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config || null);
      }
    } catch {
      // Error handled silently
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadConfig();
  }, []);

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-brand-gold tracking-wide uppercase">
            STREET DUDES ADMIN
          </h1>
          <p className="text-xs text-white/50 mt-1">
            Hantera öppettider, leveransinställningar, orderhistorik och försäljningsanalys
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/kitchen"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold uppercase tracking-wider transition-colors"
          >
            Köksvy ↗
          </a>
        </div>
      </header>

      {isLoading || !config ? (
        <div className="py-20 text-center text-sm text-white/40">Laddar admindashboard...</div>
      ) : (
        <>
          {/* Quick Stats & Controls Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <TodaySummaryCard />
            <RestaurantControlCard config={config} onConfigChange={loadConfig} />
          </section>

          {/* Config Editors Row */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DeliveryConfigForm config={config} onConfigChange={loadConfig} />
            <OpeningHoursForm config={config} onConfigChange={loadConfig} />
          </section>

          {/* Analytics Section */}
          <section className="pt-4">
            <AdminAnalyticsSection />
          </section>

          {/* Order History Table Section */}
          <section className="pt-4">
            <OrderHistoryTable />
          </section>

          {/* Promo Codes Section */}
          <section className="pt-4">
            <PromoCodesCard />
          </section>
        </>
      )}
    </main>
  );
}
