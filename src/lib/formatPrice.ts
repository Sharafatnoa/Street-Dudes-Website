/**
 * Formats a numeric price into a localized currency string in SEK.
 *
 * @param price - The numeric price to format.
 * @param priceLabel - Optional custom pricing label prefix (e.g. "2 för").
 * @returns The formatted currency string.
 *
 * WHY: Standardizes price presentation across the website.
 */
export function formatPrice(price: number, priceLabel?: string): string {
  const formatted = `${price} kr`;
  return priceLabel ? `${priceLabel} ${formatted}` : formatted;
}
