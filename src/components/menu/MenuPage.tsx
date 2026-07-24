/**
 * MenuPage component that assembles dynamic tabs and all menu category sections.
 * Supports interactive boolean prop to toggle ordering functionality.
 *
 * @param props - MenuPageProps containing optional interactive boolean.
 *
 * WHY: Serves as the unique component responsible for pulling static MENU_DATA record
 * and rendering read-only (homepage) or interactive (order page) menu sections.
 */

import React from 'react'
import { useTranslations } from 'next-intl'
import { MENU_DATA } from '@/data/menu'
import { CategoryTabs } from '../CategoryTabs'
import { MenuSection } from './MenuSection'
import { OrderButton } from '../OrderButton'

export type MenuPageProps = {
  interactive?: boolean
}

export function MenuPage({ interactive = false }: MenuPageProps) {
  const t = useTranslations()

  // Map category listings to tab navigation labels, filtering out addon-only categories
  const categoriesList = MENU_DATA.categories
    .filter((category) => category.items.some((item) => item.type !== 'addon'))
    .map((category) => ({
      id: category.id,
      label: t(category.labelKey),
    }))

  return (
    <div className="flex flex-col gap-8">
      {/* Category Horizontal Navigation tabs */}
      <CategoryTabs categories={categoriesList} />

      {/* Categories section content list */}
      <div className="max-w-4xl mx-auto px-4 w-full flex flex-col gap-12 mt-6">
        {MENU_DATA.categories.map((category) => (
          <MenuSection key={category.id} category={category} interactive={interactive} />
        ))}
      </div>

      {/* Call To Action - Order Button */}
      <div className="flex justify-center mt-6 mb-12">
        <OrderButton />
      </div>
    </div>
  )
}

export default MenuPage
