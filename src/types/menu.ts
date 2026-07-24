/**
 * Types for the Street Dudes menu system.
 * Every item has a type that controls where it appears.
 */

/** Controls where a menu item appears */
export type MenuItemType =
  | 'main'       // Shows on menu with customization modal
  | 'sauce_dip'  // Shows on menu, goes straight to cart (20kr dip cups)
  | 'addon'      // Hidden from menu, only appears inside customization modal

/** A protein swap option inside the customization modal */
export type ProteinSwap = {
  id: string
  name: string
  priceDelta: number  // 0 = free swap, positive = extra cost in kr
}

/** Customization options available for a menu item */
export type ItemCustomization = {
  proteinSwaps: ProteinSwap[]  // Meat alternatives
  ingredients: string[]         // Removable ingredients
  addonIds: string[]            // IDs of addon items available for this item
  hasSauceAddon: boolean        // Whether +Sås +10kr option appears
}

/** A single item on the menu */
export type MenuItem = {
  id: string
  nameKey: string
  descriptionKey: string
  price: number
  type: MenuItemType
  badge?: 'favorite' | 'levelup'
  customization: ItemCustomization
}

/** A category grouping menu items */
export type MenuCategory = {
  id: string
  labelKey: string
  items: MenuItem[]
}
