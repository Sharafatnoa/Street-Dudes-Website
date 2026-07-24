'use client'

import { useState } from 'react'
import MenuPage from '@/components/menu/MenuPage'
import OrderNavbar from '@/components/layout/OrderNavbar'
import FloatingCartBar from '@/components/cart/FloatingCartBar'
import CartDrawer from '@/components/cart/CartDrawer'
import RestaurantStatusBanner, { type StatusData } from '@/components/menu/RestaurantStatusBanner'

export default function OrderPage() {
  const [cartOpen, setCartOpen] = useState(false)
  const [isOrderingOpen, setIsOrderingOpen] = useState(true)
  const [unavailableIds, setUnavailableIds] = useState<string[]>([])

  function handleStatusLoad(data: StatusData) {
    setIsOrderingOpen(data.state === 'OPEN')
    setUnavailableIds(data.unavailableItemIds)
  }

  return (
    <>
      <OrderNavbar onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-brand-black pt-16 pb-24">
        {/* pb-24 gives space so content is not hidden behind the bar */}
        <RestaurantStatusBanner onStatusLoad={handleStatusLoad} />
        <MenuPage
          interactive={isOrderingOpen}
          unavailableItemIds={unavailableIds}
        />
      </main>
      <FloatingCartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  )
}
