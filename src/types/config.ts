/** A single row from the Supabase config table */
export type ConfigEntry = {
  key: string
  value: string
  description: string
}

/** Typed config values used throughout the app */
export type AppConfig = {
  deliveryRadiusKm: number
  deliveryFeeKr: number
  freeDeliveryThresholdKr: number
  minOrderKr: number
  estimatedDeliveryMins: number
  isOpen: boolean
  restaurantLat: number
  restaurantLng: number
}
