/**
 * MenuItemCard displays a single menu item with Option C split bottom bar layout.
 * When interactive is false (homepage), it renders price in bottom bar read-only.
 * When interactive is true (order page), clicking split button triggers customization modal or cart addition.
 * When item is unavailable, renders "Slut för idag" disabled bottom bar.
 *
 * @param props - MenuItemCardProps containing menu item, interactive boolean, and optional isUnavailable boolean.
 *
 * WHY: Delivers premium split-action card UX anchoring price, call-to-action, and real-time inventory status.
 */

'use client';

import { useState } from 'react';
import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/Badge';
import ItemCustomizationModal from './ItemCustomizationModal';
import type { MenuItem } from '@/types/menu';

export type MenuItemCardProps = {
  item: MenuItem;
  interactive?: boolean;
  isUnavailable?: boolean;
};

export default function MenuItemCard({
  item,
  interactive = false,
  isUnavailable = false,
}: MenuItemCardProps) {
  const { addSimpleItem } = useCart();
  const t = useTranslations();
  const [modalOpen, setModalOpen] = useState(false);

  function handleAddClick() {
    if (!interactive || isUnavailable) return;
    if (item.type === 'main') {
      setModalOpen(true);
    } else {
      addSimpleItem(item.id, t(item.nameKey), item.price);
    }
  }

  return (
    <>
      <div className="bg-[#111] border border-white/10 rounded overflow-hidden flex flex-col justify-between">
        {/* Card body */}
        <div className="p-5 flex-1">
          {/* Badge if present */}
          {item.badge && (
            <div className="mb-3">
              <Badge variant={item.badge} label={t(`menu.badges.${item.badge}`)} />
            </div>
          )}

          {/* Item name only — no price in header anymore */}
          <h3 className="font-display text-[#F5A500] uppercase tracking-wide text-xl leading-tight font-bold">
            {t(item.nameKey)}
          </h3>

          {/* Description */}
          <p className="text-xs text-white/45 uppercase tracking-wide mt-2 leading-relaxed">
            {t(item.descriptionKey)
              .split(',')
              .map((s) => s.trim())
              .join(' · ')}
          </p>
        </div>

        {/* Split bottom bar / Unavailable state */}
        {isUnavailable ? (
          <div className="flex items-stretch border-t border-white/10">
            <div className="flex items-center justify-center px-5 py-3 flex-1 border-r border-white/10">
              <span className="font-display text-white/30 text-xl line-through font-bold">
                {item.price} kr
              </span>
            </div>
            <div className="flex items-center justify-center px-5 py-3 flex-1 bg-white/5">
              <span className="font-display text-white/30 text-sm uppercase tracking-widest font-bold">
                Slut för idag
              </span>
            </div>
          </div>
        ) : interactive ? (
          <button
            onClick={handleAddClick}
            className="flex items-stretch border-t border-white/10 hover:border-brand-gold/40 transition-colors group w-full text-left"
            aria-label={`${t('cart.addToCart')} ${t(item.nameKey)}`}
          >
            {/* Left: price */}
            <div className="flex items-center justify-center px-5 py-3 flex-1 border-r border-white/10 group-hover:border-brand-gold/40 transition-colors">
              <span className="font-display text-brand-gold text-xl font-bold">
                {item.price} kr
              </span>
            </div>

            {/* Right: add action */}
            <div className="flex items-center justify-center px-5 py-3 flex-1 bg-brand-gold/0 group-hover:bg-brand-gold transition-colors">
              <span className="font-display text-brand-gold text-sm uppercase tracking-widest font-bold group-hover:text-brand-black transition-colors">
                {item.type === 'main' ? `+ ${t('menu.customize')}` : `+ ${t('cart.addToCart')}`}
              </span>
            </div>
          </button>
        ) : (
          <div className="flex items-center justify-between border-t border-white/10 px-5 py-3">
            <span className="font-display text-brand-gold text-xl font-bold">{item.price} kr</span>
          </div>
        )}
      </div>

      {/* Customization modal — only when interactive, available, and for main items */}
      {interactive && !isUnavailable && item.type === 'main' && (
        <ItemCustomizationModal
          item={item}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

export { MenuItemCard };
