/**
 * Navbar shown only on the order page.
 * Includes cart icon button linking to order page cart drawer.
 * Separate from the main Navbar to keep Phase 1 clean.
 *
 * @param props - OrderNavbarProps containing onCartOpen callback.
 *
 * WHY: Provides top bar branding and cart trigger on the ordering interface.
 */

'use client';

import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import Link from 'next/link';

type OrderNavbarProps = {
  onCartOpen: () => void;
};

export default function OrderNavbar({ onCartOpen }: OrderNavbarProps) {
  const { cart } = useCart();
  const t = useTranslations();

  return (
    <nav className="fixed top-0 left-0 right-0 z-30 bg-brand-black border-b border-brand-gold/20 flex items-center justify-between px-6 h-16">
      {/* Logo — links back to menu homepage */}
      <Link
        href="/"
        className="font-display text-brand-gold text-xl tracking-widest uppercase font-bold"
      >
        STREET DUDES
      </Link>

      {/* Right side controls */}
      <div className="flex items-center gap-4">
        <LanguageToggle />

        {/* Cart button with item count badge */}
        <button
          onClick={onCartOpen}
          className="relative p-2 text-white/70 hover:text-white transition-colors"
          aria-label={t('cart.openCart')}
        >
          <span className="text-xl">🛍️</span>
          {cart.itemCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-brand-gold text-brand-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center font-display">
              {cart.itemCount}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
}
