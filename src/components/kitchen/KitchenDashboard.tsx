/**
 * Main interactive kitchen dashboard container component.
 * Integrates polling hook, header controls, tabs, card status cycling, and printing.
 */

'use client';

import { useState, useCallback, useEffect } from 'react';
import type { Order, OrderStatus } from '@/types/order';
import { useKitchenOrders } from '@/hooks/useKitchenOrders';
import { playNewOrderSound } from '@/lib/soundAlert';
import { KitchenHeader } from './KitchenHeader';
import { KitchenTabs, type KitchenTabType } from './KitchenTabs';
import { OrderCard } from './OrderCard';
import { MenuAvailabilityTab } from './MenuAvailabilityTab';

type KitchenDashboardProps = {
  estimatedDeliveryMins?: number;
  estimatedPickupMins?: number;
};

export function KitchenDashboard({
  estimatedDeliveryMins = 45,
  estimatedPickupMins = 20,
}: KitchenDashboardProps) {
  const [activeTab, setActiveTab] = useState<KitchenTabType>('active');
  const [autoPrint, setAutoPrint] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Load initial pause status
  useEffect(() => {
    async function loadPauseStatus() {
      try {
        const res = await fetch('/api/status', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          setIsPaused(Boolean(data.state === 'PAUSED'));
        }
      } catch {
        // Fallback
      }
    }
    loadPauseStatus();
  }, []);

  const triggerPrint = useCallback((order: Order) => {
    try {
      document.body.setAttribute('data-printing-order-id', order.id);
      window.print();
    } finally {
      document.body.removeAttribute('data-printing-order-id');
    }
  }, []);

  const handleNewOrder = useCallback(
    (newOrder: Order) => {
      playNewOrderSound();
      if (autoPrint) {
        triggerPrint(newOrder);
      }
    },
    [autoPrint, triggerPrint],
  );

  const { orders, isLoading, isError, refetch } = useKitchenOrders({
    onNewOrder: handleNewOrder,
  });

  const activeOrders = orders.filter((o) => ['pending', 'preparing', 'ready'].includes(o.status));
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handleStatusChange = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/kitchen/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        alert('Kunde inte uppdatera orderstatus.');
      } else {
        await refetch();
      }
    } catch {
      alert('Nätverksfel vid uppdatering av orderstatus.');
    }
  };

  const handleTogglePause = async () => {
    const nextPaused = !isPaused;
    setIsPaused(nextPaused);
    try {
      const res = await fetch('/api/kitchen/pause', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPaused: nextPaused }),
      });
      if (!res.ok) {
        setIsPaused(!nextPaused); // Rollback
        alert('Kunde inte ändra pausstatus.');
      }
    } catch {
      setIsPaused(!nextPaused);
      alert('Nätverksfel.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white flex flex-col">
      <KitchenHeader
        isPaused={isPaused}
        autoPrint={autoPrint}
        onTogglePause={handleTogglePause}
        onToggleAutoPrint={() => setAutoPrint(!autoPrint)}
      />

      <KitchenTabs
        activeTab={activeTab}
        activeCount={activeOrders.length}
        completedCount={completedOrders.length}
        onSelectTab={setActiveTab}
      />

      <main className="flex-1 p-4 overflow-y-auto">
        {isLoading && (
          <div className="text-center py-12 text-white/50 text-sm">Hämtar ordrar...</div>
        )}

        {isError && (
          <div className="text-center py-12 text-red-400 text-sm font-bold">
            Kunde inte hämta ordrar. Kontrollera nätverket.
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {activeTab === 'active' && (
              <div>
                {activeOrders.length === 0 ? (
                  <div className="text-center py-16 text-white/40 font-display text-lg uppercase tracking-wider">
                    Inga aktiva ordrar just nu
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        thresholdMins={
                          order.fulfillmentType === 'delivery'
                            ? estimatedDeliveryMins
                            : estimatedPickupMins
                        }
                        onStatusChange={handleStatusChange}
                        onPrint={triggerPrint}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'menu' && <MenuAvailabilityTab />}

            {activeTab === 'completed' && (
              <div>
                {completedOrders.length === 0 ? (
                  <div className="text-center py-16 text-white/40 font-display text-lg uppercase tracking-wider">
                    Inga slutförda ordrar idag
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {completedOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={handleStatusChange}
                        onPrint={triggerPrint}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
