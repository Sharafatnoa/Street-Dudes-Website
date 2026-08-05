/**
 * CartItem component displays a single item in the cart drawer.
 * Shows item name, customization details (protein swaps, removed ingredients,
 * extra sauces, addons, special instructions), price, and quantity controls.
 *
 * @param props - CartItemProps containing the CartItem object.
 *
 * WHY: Enables reviewing and updating quantity of customized cart items within the drawer.
 */

'use client';

import { useCart } from '@/context/CartContext';
import type { CartItem as CartItemType } from '@/types/order';

type CartItemProps = {
  item: CartItemType;
};

export default function CartItem({ item }: CartItemProps) {
  const { updateQuantity } = useCart();

  return (
    <div className="flex items-start justify-between py-3 border-b border-white/10 gap-3">
      <div className="flex-1">
        {/* Item name */}
        <p className="text-white text-sm font-display uppercase tracking-wide font-bold">
          {item.selectedVariant ? `${item.name} (${item.selectedVariant.name})` : item.name}
        </p>

        {/* Customization Details */}
        <div className="text-xs text-white/60 flex flex-col gap-0.5 mt-1">
          {/* Protein Swap */}
          {item.proteinSwap && (
            <p className="text-brand-gold">
              ({item.proteinSwap.name}{' '}
              {item.proteinSwap.priceDelta > 0 ? `+${item.proteinSwap.priceDelta} kr` : ''})
            </p>
          )}

          {/* Rice Swap */}
          {item.riceSwap && (
            <p className="text-brand-gold">
              (Byt ris: {item.riceSwap.name}{' '}
              {item.riceSwap.priceDelta > 0 ? `+${item.riceSwap.priceDelta} kr` : ''})
            </p>
          )}

          {/* Removed Ingredients */}
          {item.removedIngredients.length > 0 && (
            <p className="text-red-400/80">Utan: {item.removedIngredients.join(', ')}</p>
          )}

          {/* Added Sauce */}
          {item.addedSauce && <p className="text-brand-gold">+Sås +10 kr</p>}

          {/* Addons */}
          {item.addons.map((addon) => (
            <p key={addon.menuItemId} className="text-white/80">
              {addon.name} +{addon.price} kr
            </p>
          ))}

          {/* Special Instructions */}
          {item.specialInstructions && (
            <p className="italic text-white/40 mt-0.5">&quot;{item.specialInstructions}&quot;</p>
          )}
        </div>

        {/* Item Total Price */}
        <p className="text-brand-gold font-display text-base mt-2 font-bold">
          {item.totalPrice * item.quantity} kr
        </p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2 shrink-0 mt-1">
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}
          className="w-7 h-7 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-colors text-lg flex items-center justify-center leading-none"
          aria-label="Minska antal"
        >
          −
        </button>
        <span className="text-white font-display text-base w-4 text-center">{item.quantity}</span>
        <button
          onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
          className="w-7 h-7 bg-brand-gold text-brand-black rounded-sm hover:bg-yellow-400 transition-colors text-lg flex items-center justify-center leading-none font-bold"
          aria-label="Öka antal"
        >
          +
        </button>
      </div>
    </div>
  );
}
