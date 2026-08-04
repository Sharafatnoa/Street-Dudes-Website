/**
 * Custom hook for polling kitchen orders every 5 seconds.
 * Performs order ID diffing to detect new orders and trigger notification callbacks.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Order } from '@/types/order';

type UseKitchenOrdersOptions = {
  onNewOrder?: (newOrder: Order) => void;
  enabled?: boolean;
};

export function useKitchenOrders({ onNewOrder, enabled = true }: UseKitchenOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const prevOrderIdsRef = useRef<Set<string>>(new Set());
  const isInitialFetchRef = useRef(true);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/kitchen/orders', { cache: 'no-store' });
      if (!res.ok) {
        if (res.status === 401) {
          // Auth lost — let parent page handle re-login
        }
        setIsError(true);
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      const fetchedOrders: Order[] = data.orders || [];

      setIsError(false);
      setIsLoading(false);

      // Diffing: check for newly appeared order IDs
      const currentIds = new Set(fetchedOrders.map((o) => o.id));

      if (!isInitialFetchRef.current && onNewOrder) {
        for (const order of fetchedOrders) {
          if (!prevOrderIdsRef.current.has(order.id)) {
            onNewOrder(order);
          }
        }
      }

      prevOrderIdsRef.current = currentIds;
      isInitialFetchRef.current = false;
      setOrders(fetchedOrders);
    } catch {
      setIsError(true);
      setIsLoading(false);
    }
  }, [onNewOrder]);

  useEffect(() => {
    if (!enabled) return;

    fetchOrders();
    const interval = setInterval(fetchOrders, 5000);

    return () => clearInterval(interval);
  }, [fetchOrders, enabled]);

  return {
    orders,
    isLoading,
    isError,
    refetch: fetchOrders,
  };
}
