import React from 'react';
import { useTranslations } from 'next-intl';
import { MENU_DATA } from '@/data/menu';
import { CategoryTabs } from './CategoryTabs';
import { MenuSection } from './MenuSection';
import { OrderButton } from './OrderButton';

/**
 * MenuPage component that assembles dynamic tabs and all menu category sections.
 *
 * WHY: Serves as the unique component responsible for pulling the static MENU_DATA record
 * and mapping categories to child navigation elements.
 */
export function MenuPage() {
  const t = useTranslations();

  // Map category listings to tab navigation labels
  const categoriesList = MENU_DATA.categories.map((category) => ({
    id: category.id,
    label: t(category.labelKey),
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* Category Horizontal Navigation tabs */}
      <CategoryTabs categories={categoriesList} />

      {/* Categories section content list */}
      <div className="max-w-4xl mx-auto px-4 w-full flex flex-col gap-12 mt-6">
        {MENU_DATA.categories.map((category) => (
          <MenuSection key={category.id} category={category} />
        ))}
      </div>

      {/* Call To Action - Order Button */}
      <div className="flex justify-center mt-6 mb-12">
        <OrderButton />
      </div>
    </div>
  );
}
