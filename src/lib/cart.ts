import type {
  Cart,
  CartItem,
  AddToCartInput,
  SelectedProteinSwap,
  SelectedRiceSwap,
  SelectedVariantSwap,
  SelectedAddon,
} from '@/types/order';
import { EMPTY_CART } from '@/types/order';

const SAUCE_ADDON_PRICE = 10; // kr

export type ComparableCartItem = {
  menuItemId: string;
  proteinSwap?: SelectedProteinSwap | null;
  riceSwap?: SelectedRiceSwap | null;
  selectedVariant?: SelectedVariantSwap | null;
  removedIngredients: string[];
  addedSauce: boolean;
  addons: SelectedAddon[];
  specialInstructions: string;
};

/**
 * Checks if two string arrays contain the exact same elements regardless of order.
 */
function areStringArraysEqual(arrA: string[], arrB: string[]): boolean {
  if (arrA.length !== arrB.length) return false;
  const sortedA = [...arrA].sort();
  const sortedB = [...arrB].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * Checks if two addon arrays contain the exact same selected addons regardless of order.
 */
function areAddonsEqual(addonsA: SelectedAddon[], addonsB: SelectedAddon[]): boolean {
  if (addonsA.length !== addonsB.length) return false;
  const getKey = (addon: SelectedAddon) => `${addon.menuItemId}:${addon.name}:${addon.price}`;
  const sortedA = addonsA.map(getKey).sort();
  const sortedB = addonsB.map(getKey).sort();
  return sortedA.every((val, index) => val === sortedB[index]);
}

/**
 * Determines whether two cart item inputs are identical in menuItemId and all customizations.
 */
export function areCartItemsIdentical(a: ComparableCartItem, b: ComparableCartItem): boolean {
  if (a.menuItemId !== b.menuItemId) return false;
  if ((a.proteinSwap?.id ?? null) !== (b.proteinSwap?.id ?? null)) return false;
  if ((a.riceSwap?.id ?? null) !== (b.riceSwap?.id ?? null)) return false;
  if ((a.selectedVariant?.id ?? null) !== (b.selectedVariant?.id ?? null)) return false;
  if (Boolean(a.addedSauce) !== Boolean(b.addedSauce)) return false;
  if ((a.specialInstructions || '') !== (b.specialInstructions || '')) return false;
  if (!areStringArraysEqual(a.removedIngredients, b.removedIngredients)) return false;
  if (!areAddonsEqual(a.addons, b.addons)) return false;

  return true;
}

/**
 * Calculates the total price for one cart item
 * including protein swap, sauce addon, and other addons.
 */
export function calculateItemTotalPrice(
  basePrice: number,
  proteinSwapDelta: number,
  addedSauce: boolean,
  addonPrices: number[],
  riceSwapDelta: number = 0,
  variantSwapDelta: number = 0,
): number {
  const saucePrice = addedSauce ? SAUCE_ADDON_PRICE : 0;
  const addonsTotal = addonPrices.reduce((sum, price) => sum + price, 0);
  return basePrice + proteinSwapDelta + riceSwapDelta + variantSwapDelta + saucePrice + addonsTotal;
}

/**
 * Adds a customized item to the cart.
 * If an identical item with the same customizations exists,
 * increments its quantity by 1. Otherwise creates a new cart entry.
 */
export function addItemToCart(cart: Cart, input: AddToCartInput): Cart {
  const existing = cart.items.find((item) => areCartItemsIdentical(item, input));

  if (existing) {
    return updateItemQuantity(cart, existing.cartItemId, existing.quantity + 1);
  }

  const proteinDelta = input.proteinSwap?.priceDelta ?? 0;
  const riceDelta = input.riceSwap?.priceDelta ?? 0;
  const variantDelta = input.selectedVariant?.priceDelta ?? 0;
  const addonPrices = input.addons.map((a) => a.price);

  const totalPrice = calculateItemTotalPrice(
    input.basePrice,
    proteinDelta,
    input.addedSauce,
    addonPrices,
    riceDelta,
    variantDelta,
  );

  const newItem: CartItem = {
    cartItemId: `${input.menuItemId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    menuItemId: input.menuItemId,
    name: input.name,
    basePrice: input.basePrice,
    proteinSwap: input.proteinSwap,
    riceSwap: input.riceSwap ?? null,
    selectedVariant: input.selectedVariant ?? null,
    removedIngredients: input.removedIngredients,
    addedSauce: input.addedSauce,
    addons: input.addons,
    specialInstructions: input.specialInstructions,
    totalPrice,
    quantity: 1,
  };

  return recalculateCart([...cart.items, newItem]);
}

/**
 * Adds a simple item (sauce dip, drink) directly to cart
 * without any customization.
 */
export function addSimpleItemToCart(
  cart: Cart,
  menuItemId: string,
  name: string,
  price: number,
): Cart {
  const simpleInput: AddToCartInput = {
    menuItemId,
    name,
    basePrice: price,
    proteinSwap: null,
    riceSwap: null,
    removedIngredients: [],
    addedSauce: false,
    addons: [],
    specialInstructions: '',
  };

  return addItemToCart(cart, simpleInput);
}

/**
 * Removes a cart entry by its unique cartItemId.
 */
export function removeItemFromCart(cart: Cart, cartItemId: string): Cart {
  const updatedItems = cart.items.filter((i) => i.cartItemId !== cartItemId);
  return recalculateCart(updatedItems);
}

/**
 * Updates the quantity of a cart entry.
 * Removes the entry if quantity reaches 0.
 */
export function updateItemQuantity(cart: Cart, cartItemId: string, quantity: number): Cart {
  if (quantity <= 0) {
    return removeItemFromCart(cart, cartItemId);
  }
  const updatedItems = cart.items.map((i) =>
    i.cartItemId === cartItemId ? { ...i, quantity } : i,
  );
  return recalculateCart(updatedItems);
}

/**
 * Clears all items from the cart.
 * Called after a successful order is placed.
 */
export function clearCart(): Cart {
  return EMPTY_CART;
}

/**
 * Recalculates itemCount and subtotal.
 * Always call this after modifying the items array.
 */
function recalculateCart(items: CartItem[]): Cart {
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice * i.quantity, 0);
  return { items, itemCount, subtotal };
}
