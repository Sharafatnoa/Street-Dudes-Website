/**
 * Formats customized order item details into readable summary strings.
 * Used by OrderCard.tsx and CheckoutSummary.tsx for consistent display.
 */

import type { CartItem } from '@/types/order';

export type CustomizationSummary = {
  proteinSwap?: string;
  riceSwap?: string;
  removed?: string;
  addedSauce?: string;
  addons: string[];
  instructions?: string;
};

export function formatItemSummary(item: CartItem): CustomizationSummary {
  const addons = (item.addons || []).map((a) => `${a.name}${a.price > 0 ? ` +${a.price} kr` : ''}`);

  return {
    proteinSwap: item.proteinSwap
      ? `${item.proteinSwap.name}${item.proteinSwap.priceDelta > 0 ? ` +${item.proteinSwap.priceDelta} kr` : ''}`
      : undefined,
    riceSwap: item.riceSwap
      ? `Byt ris: ${item.riceSwap.name}${item.riceSwap.priceDelta > 0 ? ` +${item.riceSwap.priceDelta} kr` : ''}`
      : undefined,
    removed:
      item.removedIngredients && item.removedIngredients.length > 0
        ? `Utan: ${item.removedIngredients.join(', ')}`
        : undefined,
    addedSauce: item.addedSauce ? '+Sås +10 kr' : undefined,
    addons,
    instructions: item.specialInstructions?.trim() || undefined,
  };
}
