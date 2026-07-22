/**
 * Fetches all config values from Supabase and returns
 * them as a typed AppConfig object.
 *
 * Called server-side in API routes only.
 * Config values are set by Yasha through the admin UI
 * or directly in the Supabase dashboard.
 */

import { getServerClient } from '@/lib/supabase'
import type { AppConfig } from '@/types/config'

export async function getConfig(): Promise<AppConfig> {
  const supabase = getServerClient()

  const { data, error } = await supabase
    .from('config')
    .select('key, value')

  if (error) {
    throw new Error(`Failed to load config: ${error.message}`)
  }

  // Convert array of {key, value} rows into a lookup object
  const map = Object.fromEntries(data.map(row => [row.key, row.value]))

  return {
    deliveryRadiusKm:         parseFloat(map['delivery_radius_km']),
    deliveryFeeKr:            parseInt(map['delivery_fee_kr']),
    freeDeliveryThresholdKr:  parseInt(map['free_delivery_threshold_kr']),
    minOrderKr:               parseInt(map['min_order_kr']),
    estimatedDeliveryMins:    parseInt(map['estimated_delivery_mins']),
    isOpen:                   map['is_open'] === 'true',
    restaurantLat:            parseFloat(map['restaurant_lat']),
    restaurantLng:            parseFloat(map['restaurant_lng']),
  }
}
