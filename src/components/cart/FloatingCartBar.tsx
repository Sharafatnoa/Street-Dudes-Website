/**
 * FloatingCartBar renders a sticky bar fixed to the bottom of the order page.
 * Only appears when cart has at least one item.
 * Shows item count and subtotal.
 * Clicking opens the CartDrawer.
 *
 * @param props - FloatingCartBarProps with onOpen callback.
 *
 * WHY: Provides persistent, high-visibility cart preview and quick drawer trigger while scrolling menu items.
 */

'use client';

import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';

type FloatingCartBarProps = {
  onOpen: () => void;
};

export default function FloatingCartBar({ onOpen }: FloatingCartBarProps) {
  const { cart } = useCart();
  const t = useTranslations();

  // Only render when cart has items
  if (cart.itemCount === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 px-4 pb-4 pt-2 bg-gradient-to-t from-black to-transparent pointer-events-none">
      <button
        onClick={onOpen}
        className="w-full max-w-lg mx-auto flex items-center justify-between px-5 py-4 bg-brand-gold text-brand-black rounded-sm hover:bg-yellow-400 transition-colors pointer-events-auto shadow-lg"
      >
        {/* Left: item count badge + label */}
        <div className="flex items-center gap-3">
          <span className="bg-brand-black/20 text-brand-black font-display text-sm w-7 h-7 rounded-sm flex items-center justify-center font-bold">
            {cart.itemCount}
          </span>
          <span className="font-display text-base uppercase tracking-widest font-bold">
            {t('cart.viewOrder')}
          </span>
        </div>

        {/* Right: subtotal */}
        <span className="font-display text-xl font-bold">{cart.subtotal} kr</span>
      </button>
    </div>
  );
}
