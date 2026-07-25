/**
 * Checkout page.
 * Redirects to /order if cart is empty.
 * Layout: summary on top (mobile), side by side (desktop).
 */

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { useLocale } from 'next-intl'
import CheckoutForm from '@/components/checkout/CheckoutForm'
import CheckoutSummary from '@/components/checkout/CheckoutSummary'

export default function CheckoutPage() {
  const { cart } = useCart()
  const router = useRouter()
  const locale = useLocale()

  // Redirect to order page if cart is empty
  useEffect(() => {
    if (cart.items.length === 0) {
      router.replace(`/${locale}/order`)
    }
  }, [cart.items.length, router, locale])

  if (cart.items.length === 0) return null

  return (
    <div className="min-h-screen bg-brand-black">

      {/* Header */}
      <header className="sticky top-0 z-20 bg-brand-black
                         border-b border-white/10 px-6 py-4
                         flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="text-white/50 hover:text-white
                     transition-colors text-sm
                     flex items-center gap-2"
        >
          ← Tillbaka
        </button>
        <h1 className="font-display text-brand-gold text-xl
                       uppercase tracking-widest">
          Kassa
        </h1>
      </header>

      {/* Content — stacked on mobile, side by side on desktop */}
      <div className="max-w-4xl mx-auto px-4 py-6
                      flex flex-col lg:flex-row gap-6">

        {/* Order summary — top on mobile, right on desktop */}
        <div className="lg:order-2 lg:w-80 lg:shrink-0">
          <CheckoutSummary />
        </div>

        {/* Checkout form — bottom on mobile, left on desktop */}
        <div className="lg:order-1 flex-1">
          <CheckoutForm />
        </div>

      </div>
    </div>
  )
}
