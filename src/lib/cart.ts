/**
 * Pure functions for cart operations.
 * No React, no side effects — easy to unit test.
 */

import type { Cart, CartItem, AddToCartInput } from '@/types/order';
import { EMPTY_CART } from '@/types/order';

const SAUCE_ADDON_PRICE = 10; // kr

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
): number {
  const saucePrice = addedSauce ? SAUCE_ADDON_PRICE : 0;
  const addonsTotal = addonPrices.reduce((sum, price) => sum + price, 0);
  return basePrice + proteinSwapDelta + riceSwapDelta + saucePrice + addonsTotal;
}

/**
 * Adds a customized item to the cart.
 * Each call creates a new cart entry with a unique ID
 * so two versions of the same item with different
 * customizations appear as separate entries.
 */
export function addItemToCart(cart: Cart, input: AddToCartInput): Cart {
  const proteinDelta = input.proteinSwap?.priceDelta ?? 0;
  const riceDelta = input.riceSwap?.priceDelta ?? 0;
  const addonPrices = input.addons.map((a) => a.price);

  const totalPrice = calculateItemTotalPrice(
    input.basePrice,
    proteinDelta,
    input.addedSauce,
    addonPrices,
    riceDelta,
  );

  const newItem: CartItem = {
    cartItemId: `${input.menuItemId}-${Date.now()}`,
    menuItemId: input.menuItemId,
    name: input.name,
    basePrice: input.basePrice,
    proteinSwap: input.proteinSwap,
    riceSwap: input.riceSwap ?? null,
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
  const existing = cart.items.find((i) => i.menuItemId === menuItemId && i.addons.length === 0);

  if (existing) {
    return updateItemQuantity(cart, existing.cartItemId, existing.quantity + 1);
  }

  const newItem: CartItem = {
    cartItemId: `${menuItemId}-${Date.now()}`,
    menuItemId,
    name,
    basePrice: price,
    proteinSwap: null,
    riceSwap: null,
    removedIngredients: [],
    addedSauce: false,
    addons: [],
    specialInstructions: '',
    totalPrice: price,
    quantity: 1,
  };

  return recalculateCart([...cart.items, newItem]);
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
