/** A pair of GPS coordinates */
export type Coordinates = {
  lat: number;
  lng: number;
};

/** Result returned by the delivery validation API */
export type DeliveryValidation = {
  eligible: boolean;
  distanceKm: number;
  deliveryFee: number;
  isFreeDelivery: boolean;
  message: string;
};
