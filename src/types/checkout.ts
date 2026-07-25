/**
 * Types for the checkout form state and submission.
 */

import type { CartItem } from './order'

/** Form data collected from the customer */
export type CheckoutFormData = {
  fulfillmentType: 'delivery' | 'pickup'
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryAddress: string
  deliveryLat: number | null
  deliveryLng: number | null
  notes: string
}

/** Delivery validation result shown to customer */
export type DeliveryCheckResult = {
  eligible: boolean
  distanceKm: number
  deliveryFee: number
  isFreeDelivery: boolean
  message: string
}

/** Complete checkout submission payload */
export type CheckoutSubmission = {
  formData: CheckoutFormData
  items: CartItem[]
  subtotal: number
  deliveryFee: number
  total: number
}

/** Initial empty form state */
export const EMPTY_FORM: CheckoutFormData = {
  fulfillmentType: 'delivery',
  customerName: '',
  customerEmail: '',
  customerPhone: '',
  deliveryAddress: '',
  deliveryLat: null,
  deliveryLng: null,
  notes: '',
}
