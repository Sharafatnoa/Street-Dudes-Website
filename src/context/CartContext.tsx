/**
 * CartContext provides cart state and actions to all
 * components in the app.
 *
 * Cart is stored in sessionStorage so it survives
 * page refreshes but clears when the browser closes.
 * This prevents stale carts from persisting overnight.
 */

'use client';

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import {
  addItemToCart,
  addSimpleItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
} from '@/lib/cart';
import { EMPTY_CART } from '@/types/order';
import type { Cart, AddToCartInput } from '@/types/order';

const SESSION_STORAGE_KEY = 'streetdudes_cart';

type CartContextValue = {
  cart: Cart;
  addCustomizedItem: (input: AddToCartInput) => void;
  addSimpleItem: (menuItemId: string, name: string, price: number) => void;
  removeItem: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  emptyCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

/** Wraps the app and provides cart state to all children */
export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);

  // Load cart from sessionStorage on first render
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (stored) {
        setCart(JSON.parse(stored));
      }
    } catch {
      // If storage is unavailable or corrupted, start fresh
      setCart(EMPTY_CART);
    }
  }, []);

  // Save cart to sessionStorage whenever it changes
  useEffect(() => {
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // Storage unavailable — cart still works in memory
    }
  }, [cart]);

  function addCustomizedItem(input: AddToCartInput) {
    setCart((current) => addItemToCart(current, input));
  }

  function addSimpleItem(menuItemId: string, name: string, price: number) {
    setCart((current) => addSimpleItemToCart(current, menuItemId, name, price));
  }

  function removeItem(cartItemId: string) {
    setCart((current) => removeItemFromCart(current, cartItemId));
  }

  function updateQuantity(cartItemId: string, quantity: number) {
    setCart((current) => updateItemQuantity(current, cartItemId, quantity));
  }

  function emptyCart() {
    setCart(clearCart());
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addCustomizedItem,
        addSimpleItem,
        removeItem,
        updateQuantity,
        emptyCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook to access cart state and actions.
 * Must be used inside a CartProvider.
 */
export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used inside a CartProvider');
  }
  return context;
}
