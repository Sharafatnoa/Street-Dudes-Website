/** A single row from the Supabase config table */
export type ConfigEntry = {
  key: string;
  value: string;
  description: string;
};

/** Typed config values used throughout the app */
export type AppConfig = {
  deliveryRadiusKm: number;
  deliveryFeeKr: number;
  freeDeliveryThresholdKr: number;
  minOrderKr: number;
  estimatedDeliveryMins: number;
  estimatedPickupMins: number;
  isOpen: boolean;
  isPaused: boolean;
  pauseMessage: string;
  pauseUntil: string;
  deliveryEnabled: boolean;
  pickupEnabled: boolean;
  restaurantLat: number;
  restaurantLng: number;
  weekdayOpen: string;
  weekdayBreakStart: string;
  weekdayBreakEnd: string;
  weekdayClose: string;
  weekendOpen: string;
  weekendClose: string;
};
