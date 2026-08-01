/**
 * Displays the order summary on the checkout page.
 * Shows all cart items with their customizations,
 * subtotal, delivery fee, and total.
 * Reads from CartContext — no props needed.
 */

'use client';

import { useCart } from '@/context/CartContext';
import { useTranslations } from 'next-intl';

type CheckoutSummaryProps = {
  deliveryFee?: number;
  estimatedMins?: number;
  fulfillmentType?: 'delivery' | 'pickup';
};

export default function CheckoutSummary({
  deliveryFee = 0,
  estimatedMins,
  fulfillmentType = 'pickup',
}: CheckoutSummaryProps) {
  const { cart } = useCart();
  const t = useTranslations();
  const total = cart.subtotal + deliveryFee;

  return (
    <div
      className="bg-[#111] border border-white/10
                    rounded p-5 sticky top-24"
    >
      <h2
        className="font-display text-brand-gold text-lg
                     uppercase tracking-widest mb-4"
      >
        {t('cart.title')}
      </h2>

      {/* Item list */}
      <div className="flex flex-col gap-3 mb-4">
        {cart.items.map((item) => (
          <div
            key={item.cartItemId}
            className="pb-3 border-b border-white/8
                          last:border-0 last:pb-0"
          >
            {/* Item name + quantity + price */}
            <div className="flex justify-between items-start gap-2">
              <span
                className="font-display text-white text-sm
                                uppercase tracking-wide"
              >
                {item.quantity}× {item.name}
              </span>
              <span
                className="font-display text-brand-gold
                                text-sm shrink-0"
              >
                {item.totalPrice * item.quantity} kr
              </span>
            </div>

            {/* Customization details */}
            <div className="mt-1 flex flex-col gap-0.5">
              {item.proteinSwap && (
                <span className="text-xs text-brand-gold/70">
                  ({item.proteinSwap.name} +{item.proteinSwap.priceDelta} kr)
                </span>
              )}
              {item.removedIngredients.length > 0 && (
                <span className="text-xs text-white/40">
                  Utan: {item.removedIngredients.join(', ')}
                </span>
              )}
              {item.addedSauce && <span className="text-xs text-white/50">+Sås +10 kr</span>}
              {item.addons.map((addon) => (
                <span key={addon.menuItemId} className="text-xs text-white/50">
                  {addon.name} +{addon.price} kr
                </span>
              ))}
              {item.specialInstructions && (
                <span className="text-xs text-white/35 italic">
                  &quot;{item.specialInstructions}&quot;
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div
        className="flex flex-col gap-2 pt-3
                      border-t border-white/10"
      >
        <div className="flex justify-between text-sm">
          <span className="text-white/50">{t('cart.subtotal')}</span>
          <span className="text-white">{cart.subtotal} kr</span>
        </div>

        {fulfillmentType === 'delivery' && (
          <div className="flex justify-between text-sm">
            <span className="text-white/50">Leveransavgift</span>
            <span className={deliveryFee === 0 ? 'text-green-400' : 'text-white'}>
              {deliveryFee === 0 ? 'Gratis' : `${deliveryFee} kr`}
            </span>
          </div>
        )}

        <div
          className="flex justify-between items-center
                        pt-2 border-t border-white/10 mt-1"
        >
          <span
            className="font-display text-white uppercase
                           tracking-wide"
          >
            {t('modal.total')}
          </span>
          <span className="font-display text-brand-gold text-2xl">{total} kr</span>
        </div>

        {/* Estimated time */}
        {estimatedMins && (
          <div
            className="mt-3 flex items-center gap-2
                          text-white/40 text-xs"
          >
            <span>🕐</span>
            <span>
              {fulfillmentType === 'delivery'
                ? `Beräknad leveranstid: ${estimatedMins}–${estimatedMins + 10} min`
                : `Klar för upphämtning om: ${estimatedMins}–${estimatedMins + 5} min`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
