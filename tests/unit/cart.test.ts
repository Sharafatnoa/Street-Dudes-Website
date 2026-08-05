import {
  addItemToCart,
  addSimpleItemToCart,
  removeItemFromCart,
  updateItemQuantity,
  clearCart,
  calculateItemTotalPrice,
  areCartItemsIdentical,
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

describe('areCartItemsIdentical', () => {
  const baseItem: AddToCartInput = {
    menuItemId: 'cheese-smash',
    name: 'Cheese Smash',
    basePrice: 89,
    proteinSwap: null,
    riceSwap: null,
    removedIngredients: ['Picklad gurka'],
    addedSauce: true,
    addons: [{ menuItemId: 'puck', name: 'Extra Burgarpuck', price: 30 }],
    specialInstructions: 'Ingen lök tack',
  };

  it('returns true for two identical items', () => {
    expect(areCartItemsIdentical(baseItem, { ...baseItem })).toBe(true);
  });

  it('returns false for different protein swap', () => {
    const item2: AddToCartInput = {
      ...baseItem,
      proteinSwap: { id: 'kyckling', name: 'Kyckling', priceDelta: 10 },
    };
    expect(areCartItemsIdentical(baseItem, item2)).toBe(false);
  });

  it('returns true for removed ingredients in different order', () => {
    const item1: AddToCartInput = { ...baseItem, removedIngredients: ['Gurka', 'Lök'] };
    const item2: AddToCartInput = { ...baseItem, removedIngredients: ['Lök', 'Gurka'] };
    expect(areCartItemsIdentical(item1, item2)).toBe(true);
  });

  it('returns false for different removed ingredients', () => {
    const item1: AddToCartInput = { ...baseItem, removedIngredients: ['Gurka'] };
    const item2: AddToCartInput = { ...baseItem, removedIngredients: ['Tomat'] };
    expect(areCartItemsIdentical(item1, item2)).toBe(false);
  });

  it('returns false when special instructions differ', () => {
    const item2: AddToCartInput = { ...baseItem, specialInstructions: 'Extra krispig' };
    expect(areCartItemsIdentical(baseItem, item2)).toBe(false);
  });

  it('returns false when one has an addon the other does not', () => {
    const item2: AddToCartInput = { ...baseItem, addons: [] };
    expect(areCartItemsIdentical(baseItem, item2)).toBe(false);
  });
});

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

  it('merges identical customized items into single line with incremented quantity', () => {
    const cart1 = addItemToCart(EMPTY_CART, testInput);
    const cart2 = addItemToCart(cart1, testInput);
    expect(cart2.items).toHaveLength(1);
    expect(cart2.items[0].quantity).toBe(2);
    expect(cart2.subtotal).toBe(198);
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
