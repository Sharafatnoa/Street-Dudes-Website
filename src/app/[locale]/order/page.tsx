'use client'

import { useState } from 'react'
import MenuPage from '@/components/menu/MenuPage'
import OrderNavbar from '@/components/layout/OrderNavbar'
import FloatingCartBar from '@/components/cart/FloatingCartBar'
import CartDrawer from '@/components/cart/CartDrawer'

export default function OrderPage() {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <OrderNavbar onCartOpen={() => setCartOpen(true)} />
      <main className="min-h-screen bg-brand-black pt-16 pb-24">
        {/* pb-24 gives space so content is not hidden behind the bar */}
        <MenuPage interactive={true} />
      </main>
      <FloatingCartBar onOpen={() => setCartOpen(true)} />
      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
    </>
  )
}
