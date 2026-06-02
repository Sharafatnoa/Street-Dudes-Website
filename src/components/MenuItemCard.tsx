import React from 'react';
import { useTranslations } from 'next-intl';
import { MenuItem } from '@/types/menu';
import { formatPrice } from '@/lib/formatPrice';
import { Badge } from './ui/Badge';

/**
 * Props for the MenuItemCard component.
 */
export type MenuItemCardProps = {
  item: MenuItem;
};

/**
 * MenuItemCard displays a single menu item including name, description, price, and badges.
 *
 * @param props - Component props including the menu item data.
 *
 * WHY: Renders customized dish previews utilizing next-intl and Badge components cleanly.
 */
export function MenuItemCard({ item }: MenuItemCardProps) {
  const t = useTranslations();

  // Retrieve translation fields dynamically
  const name = t(item.nameKey);
  const description = t(item.descriptionKey);
  const priceLabel = item.priceLabelKey ? t(item.priceLabelKey) : undefined;

  let borderClass = 'border-[rgba(255,255,255,0.07)]';
  if (item.badge === 'favorite') {
    borderClass = 'border-[rgba(245,165,0,0.40)]';
  } else if (item.badge === 'levelup') {
    borderClass = 'border-[rgba(245,165,0,0.30)]';
  }

  return (
    <div
      className={`p-5 border ${borderClass} rounded-[4px] bg-[#111111] text-white shadow-xl flex flex-col justify-between gap-3 relative transition-transform hover:scale-[1.01] duration-200`}
    >
      <div className="flex justify-between items-start gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-bold tracking-wide text-[#F5A500] font-display uppercase">
              {name}
            </h3>
            {item.badge && <Badge variant={item.badge} label={t(`menu.badges.${item.badge}`)} />}
          </div>
          <p className="mt-2 text-xs uppercase tracking-wide text-white/45">
            {description
              .split(',')
              .map((ingredient) => ingredient.trim())
              .join(' · ')}
          </p>
        </div>
        {item.price !== undefined && item.price > 0 && (
          <span className="text-lg font-bold font-display text-[#F5A500] whitespace-nowrap">
            {item.isAddon ? `+${item.price} kr` : formatPrice(item.price, priceLabel)}
          </span>
        )}
      </div>
    </div>
  );
}
