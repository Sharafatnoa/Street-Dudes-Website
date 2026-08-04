/** All possible states an order can be in */
export type OrderStatus =
  | 'PENDING' // Received, waiting for kitchen to confirm
  | 'CONFIRMED' // Kitchen accepted the order
  | 'PREPARING' // Food is being prepared
  | 'READY' // Ready for pickup or delivery
  | 'DELIVERED' // Completed
  | 'CANCELLED'; // Rejected or cancelled

/** A single item inside an order */
export type OrderItem = {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
};

/** A complete order record from the database */
export type Order = {
  id: string;
  orderNumber: number;
  createdAt: string;
  updatedAt: string;
  status: OrderStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress: string | null;
  deliveryApartment: string | null;
  deliveryPostalCode: string | null;
  deliveryCity: string | null;
  deliveryLat: number | null;
  deliveryLng: number | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  deliveryNotes: string | null;
  allergyNotes: string | null;
};

/** Input shape when creating a new order */
export type CreateOrderInput = {
  customerName: string;
  customerPhone: string;
  fulfillmentType: 'delivery' | 'pickup';
  deliveryAddress?: string;
  items: OrderItem[];
  notes?: string;
};

/** A protein swap the customer selected */
export type SelectedProteinSwap = {
  id: string;
  name: string;
  priceDelta: number;
};

/** A rice swap the customer selected */
export type SelectedRiceSwap = {
  id: string;
  name: string;
  priceDelta: number;
};

/** An addon the customer added (Extra Burgarpuck etc.) */
export type SelectedAddon = {
  menuItemId: string;
  name: string;
  price: number;
};

/** A single item in the customer's cart with all customizations */
export type CartItem = {
  cartItemId: string; // Unique ID for this cart entry
  menuItemId: string;
  name: string;
  basePrice: number; // Price before customizations
  proteinSwap: SelectedProteinSwap | null; // Meat alternative if chosen
  riceSwap?: SelectedRiceSwap | null; // Rice alternative if chosen
  removedIngredients: string[]; // Ingredients customer removed (free)
  addedSauce: boolean; // Whether +Sås +10kr was added
  addons: SelectedAddon[]; // Extra items added (Extra Burgarpuck etc.)
  specialInstructions: string; // Allergy notes and preferences
  totalPrice: number; // basePrice + all extras
  quantity: number;
};

/** The complete cart state */
export type Cart = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
};

/** Empty cart — used as initial state */
export const EMPTY_CART: Cart = {
  items: [],
  itemCount: 0,
  subtotal: 0,
};

/** Input when adding item from customization modal */
export type AddToCartInput = {
  menuItemId: string;
  name: string;
  basePrice: number;
  proteinSwap: SelectedProteinSwap | null;
  riceSwap?: SelectedRiceSwap | null;
  removedIngredients: string[];
  addedSauce: boolean;
  addons: SelectedAddon[];
  specialInstructions: string;
};
