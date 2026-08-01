/**
 * Types for the checkout form state and submission.
 */

import type { CartItem } from './order';

/** Form data collected from the customer */
export type CheckoutFormData = {
  fulfillmentType: 'delivery' | 'pickup';
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  // Split address fields
  streetAddress: string; // Bohustgatan 12
  apartment: string; // Lägenhet 1302 (optional)
  postalCode: string; // 504 35
  city: string; // Borås (pre-filled)
  // Coordinates from GPS or validation
  deliveryLat: number | null;
  deliveryLng: number | null;
  // Separate note fields
  deliveryNotes: string; // Leave at door etc.
  allergyNotes: string; // Peanut allergy etc.
};

/** Delivery validation result shown to customer */
export type DeliveryCheckResult = {
  eligible: boolean;
  distanceKm: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  message: string;
};

/** Complete checkout submission payload */
export type CheckoutSubmission = {
  formData: CheckoutFormData;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
};

/** Initial empty form state */
export const EMPTY_FORM: CheckoutFormData = {
  fulfillmentType: 'delivery',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  streetAddress: '',
  apartment: '',
  postalCode: '',
  city: 'Borås',
  deliveryLat: null,
  deliveryLng: null,
  deliveryNotes: '',
  allergyNotes: '',
};

/**
 * Builds the full address string from split fields for geocoding.
 * Filters out empty parts so the geocoder gets a clean query.
 */
export function buildFullAddress(form: CheckoutFormData): string {
  const parts = [
    form.streetAddress,
    form.apartment,
    `${form.postalCode} ${form.city}`.trim(),
    'Sverige',
  ].filter(Boolean);
  return parts.join(', ');
}
