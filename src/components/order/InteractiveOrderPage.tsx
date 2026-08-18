/**
 * Interactive order page client component.
 * Houses state for cart drawer, status banner, and menu page integration.
 */

'use client';

import { useState } from 'react';
import MenuPage from '@/components/menu/MenuPage';
import OrderNavbar from '@/components/layout/OrderNavbar';
import FloatingCartBar from '@/components/cart/FloatingCartBar';
import CartDrawer from '@/components/cart/CartDrawer';
import RestaurantStatusBanner, { type StatusData } from '@/components/menu/RestaurantStatusBanner';

export function InteractiveOrderPage() {
  const [cartOpen, setCartOpen] = useState(false);
  const [isOrderingOpen, setIsOrderingOpen] = useState(true);
  const [unavailableIds, setUnavailableIds] = useState<string[]>([]);

  function handleStatusLoad(data: StatusData) {
    setIsOrderingOpen(data.state === 'OPEN');
    setUnavailableIds(data.unavailableItemIds);
  }

  return (
    <>
      <OrderNavbar onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-brand-black pt-16 pb-24">
        <RestaurantStatusBanner onStatusLoad={handleStatusLoad} />
        <MenuPage interactive={isOrderingOpen} unavailableItemIds={unavailableIds} />
      </main>
      <FloatingCartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
