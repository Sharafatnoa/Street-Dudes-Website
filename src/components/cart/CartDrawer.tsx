/**
 * CartDrawer component renders a slide-in drawer showing cart contents.
 * Opens from the right side of the screen.
 * Closes when user clicks the overlay or X button.
 *
 * @param props - CartDrawerProps containing isOpen boolean and onClose callback.
 *
 * WHY: Provides quick cart management and checkout navigation with fully opaque panel.
 */

'use client'

import { useCart } from '@/context/CartContext'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import CartItem from './CartItem'

type CartDrawerProps = {
  isOpen: boolean
  onClose: () => void
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cart } = useCart()
  const t = useTranslations()
  const router = useRouter()

  function handleCheckout() {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {/* Dark overlay behind the drawer */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div
        style={{ backdropFilter: 'none' }}
        className={`fixed top-0 right-0 h-full w-full sm:max-w-sm bg-[#0f0f0f] border-l border-white/10 z-50 flex flex-col transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-xl text-brand-gold uppercase tracking-widest font-bold">
            {t('cart.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
            aria-label={t('cart.close')}
          >
            ×
          </button>
        </div>

        {/* Cart items or empty state */}
        <div className="flex-1 overflow-y-auto p-4">
          {cart.items.length === 0 ? (
            <p className="text-white/40 text-center mt-8 text-sm uppercase tracking-widest">
              {t('cart.empty')}
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {cart.items.map(item => (
                <CartItem key={item.cartItemId} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer with total and checkout button */}
        {cart.items.length > 0 && (
          <div className="p-4 border-t border-white/10">
            <div className="flex justify-between items-center mb-4">
              <span className="text-white/60 text-sm uppercase tracking-widest">
                {t('cart.subtotal')}
              </span>
              <span className="font-display text-xl text-brand-gold font-bold">
                {cart.subtotal} kr
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full py-3 bg-brand-gold text-brand-black font-display text-lg uppercase tracking-widest rounded-sm hover:bg-yellow-400 transition-colors font-bold"
            >
              {t('cart.checkout')}
            </button>
          </div>
        )}
      </div>
    </>
  )
}
