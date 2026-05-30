/**
 * Menu System Type Definitions for Street Dudes.
 * Defines the core schemas for dishes, category collections, and full menus.
 */

export type MenuItemBadge = 'favorite' | 'levelup';

export type MenuItem = {
  id: string;
  nameKey: string; // The localization dot-notation lookup key for the dish name
  descriptionKey: string; // The localization dot-notation lookup key for the dish description
  price: number; // Numeric price in Swedish Krona (SEK)
  badge?: MenuItemBadge; // Optional promotional highlight tags
  priceLabelKey?: string; // Optional custom pricing prefix label key (e.g. 2 för)
};

export type MenuCategory = {
  id: string;
  labelKey: string; // The localization dot-notation lookup key for the category name
  items: MenuItem[]; // Collection of menu items falling under this category
};

export type MenuData = {
  categories: MenuCategory[]; // The full structured menu data layout
};
