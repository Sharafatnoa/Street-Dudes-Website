import {
  addItemToCart,
  addSimpleItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  calculateItemTotalPrice,
} from '@/lib/cart';
import { EMPTY_CART } from '@/types/order';
import type { AddToCartInput } from '@/types/order';

const testInput: AddToCartInput = {
  menuItemId: 'truffle-smash',
  name: 'Truffle Smash',
  basePrice: 99,
  proteinSwap: null,
  removedIngredients: [],
  addedSauce: false,
  addons: [],
  specialInstructions: '',
};

describe('cart functions', () => {
  it('calculates total price with protein swap, sauce, and addons', () => {
    const total = calculateItemTotalPrice(99, 10, true, [49]);
    expect(total).toBe(168); // 99 + 10 + 10 + 49
  });

  it('calculates total price with protein swap, rice swap, sauce, and addons', () => {
    const total = calculateItemTotalPrice(99, 10, true, [49], 5);
    expect(total).toBe(173); // 99 + 10 + 10 + 49 + 5
  });

  it('adds a customized item to an empty cart', () => {
    const cart = addItemToCart(EMPTY_CART, testInput);
    expect(cart.items).toHaveLength(1);
    expect(cart.items[0].quantity).toBe(1);
    expect(cart.items[0].totalPrice).toBe(99);
    expect(cart.subtotal).toBe(99);
    expect(cart.itemCount).toBe(1);
  });

  it('adds simple item directly to cart and increments quantity on repeat', () => {
    const cart = addSimpleItemToCart(EMPTY_CART, 'jalapenemajo', 'Jalapeñomajonnäs', 20);
    expect(cart.items).toHaveLength(1);
    expect(cart.subtotal).toBe(20);

    const cart2 = addSimpleItemToCart(cart, 'jalapenemajo', 'Jalapeñomajonnäs', 20);
    expect(cart2.items[0].quantity).toBe(2);
    expect(cart2.subtotal).toBe(40);
  });

  it('removes an item by cartItemId', () => {
    const cart = addItemToCart(EMPTY_CART, testInput);
    const cartItemId = cart.items[0].cartItemId;
    const emptyCart = removeItemFromCart(cart, cartItemId);
    expect(emptyCart.items).toHaveLength(0);
    expect(emptyCart.subtotal).toBe(0);
  });

  it('updates item quantity', () => {
    const cart = addItemToCart(EMPTY_CART, testInput);
    const cartItemId = cart.items[0].cartItemId;
    const updated = updateItemQuantity(cart, cartItemId, 3);
    expect(updated.items[0].quantity).toBe(3);
    expect(updated.subtotal).toBe(297);
  });

  it('removes item when quantity is set to 0', () => {
    const cart = addItemToCart(EMPTY_CART, testInput);
    const cartItemId = cart.items[0].cartItemId;
    const updated = updateItemQuantity(cart, cartItemId, 0);
    expect(updated.items).toHaveLength(0);
  });

  it('clears the entire cart', () => {
    const cart = addItemToCart(EMPTY_CART, testInput);
    const cleared = clearCart();
    expect(cleared.items).toHaveLength(0);
    expect(cleared.subtotal).toBe(0);
    expect(cleared.itemCount).toBe(0);
  });
});
