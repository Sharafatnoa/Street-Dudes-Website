/**
 * MenuSection renders a specific food category, including section header and matching grid cards.
 * Filters out items with type 'addon' so addons (and categories with only addons) remain hidden.
 * Passes interactive prop and item unavailability status to MenuItemCard.
 *
 * @param props - Component props containing category schema, interactive boolean, and optional unavailableItemIds array.
 *
 * WHY: Modularly encapsulates item listings by groups, supporting read-only or interactive modes.
 */

'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { MenuCategory } from '@/types/menu'
import { MenuItemCard } from './MenuItemCard'

export type MenuSectionProps = {
  category: MenuCategory
  interactive?: boolean
  unavailableItemIds?: string[]
}

export function MenuSection({
  category,
  interactive = false,
  unavailableItemIds = [],
}: MenuSectionProps) {
  const t = useTranslations()

  const visibleItems = category.items.filter(
    item => item.type !== 'addon'
  )

  if (visibleItems.length === 0) return null

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
        {visibleItems.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            interactive={interactive}
            isUnavailable={unavailableItemIds.includes(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

export default MenuSection
