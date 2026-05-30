import React from 'react';
import { useTranslations } from 'next-intl';
import { MenuCategory } from '@/types/menu';
import { MenuItemCard } from './MenuItemCard';

/**
 * Props for the MenuSection component.
 */
export type MenuSectionProps = {
  category: MenuCategory;
};

/**
 * MenuSection renders a specific food category, including section header and matching grid cards.
 *
 * @param props - Component props containing category schema.
 *
 * WHY: Modularly encapsulates item listings by groups and structures heading styles per the design truth.
 */
export function MenuSection({ category }: MenuSectionProps) {
  const t = useTranslations();

  return (
    <section
      id={category.id}
      className="flex flex-col gap-6 scroll-mt-24"
      data-testid={`section-${category.id}`}
    >
      {/* Category Heading with gold left border, Bebas Neue, gold text */}
      <h3 className="text-3xl font-bold border-l-4 border-[#F5A500] pl-3 font-display text-[#F5A500] uppercase tracking-wider">
        {t(category.labelKey)}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {category.items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
