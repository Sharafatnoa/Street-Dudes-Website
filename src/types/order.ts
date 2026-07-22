/** All possible states an order can be in */
export type OrderStatus =
  | 'PENDING'     // Received, waiting for kitchen to confirm
  | 'CONFIRMED'   // Kitchen accepted the order
  | 'PREPARING'   // Food is being prepared
  | 'READY'       // Ready for pickup or delivery
  | 'DELIVERED'   // Completed
  | 'CANCELLED'   // Rejected or cancelled

/** A single item inside an order */
export type OrderItem = {
  menuItemId: string
  name: string
  price: number
  quantity: number
}

/** A complete order record from the database */
export type Order = {
  id: string
  orderNumber: number
  createdAt: string
  updatedAt: string
  status: OrderStatus
  customerName: string
  customerPhone: string
  fulfillmentType: 'delivery' | 'pickup'
  deliveryAddress: string | null
  deliveryLat: number | null
  deliveryLng: number | null
  items: OrderItem[]
  subtotal: number
  deliveryFee: number
  total: number
  notes: string | null
}

/** Input shape when creating a new order */
export type CreateOrderInput = {
  customerName: string
  customerPhone: string
  fulfillmentType: 'delivery' | 'pickup'
  deliveryAddress?: string
  items: OrderItem[]
  notes?: string
}
