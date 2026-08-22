/**
 * GET /api/kitchen/orders
 *
 * Returns today's orders (Stockholm timezone start of day).
 * Gated by kitchen auth cookie.
 */

import { NextResponse } from 'next/server';
import { isKitchenAuthenticated } from '@/lib/kitchenAuth';
import { getServerClient } from '@/lib/supabase';
import { stockholmDateString, stockholmStartOfDay } from '@/lib/stockholmTime';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!isKitchenAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  const startOfDayStr = stockholmStartOfDay(stockholmDateString());

  const supabase = getServerClient();
  const { data: rawOrders, error } = await supabase
    .from('orders')
    .select('*')
    .gte('created_at', startOfDayStr)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('[kitchen/orders] Supabase fetch error:', error);
    return NextResponse.json({ error: 'Kunde inte hämta ordrar' }, { status: 500 });
  }

  // Normalize field names & status to lowercase for consistency
  const orders = (rawOrders || []).map((o) => ({
    id: o.id,
    orderNumber: o.order_number,
    createdAt: o.created_at,
    updatedAt: o.updated_at,
    status: String(o.status || 'pending').toLowerCase(),
    customerName: o.customer_name || '',
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    fulfillmentType: o.fulfillment_type || 'pickup',
    deliveryAddress: o.delivery_address,
    deliveryApartment: o.delivery_apartment,
    deliveryPostalCode: o.delivery_postal_code,
    deliveryCity: o.delivery_city,
    items: o.items || [],
    subtotal: o.subtotal || 0,
    deliveryFee: o.delivery_fee || 0,
    total: o.total || 0,
    deliveryNotes: o.delivery_notes,
    allergyNotes: o.allergy_notes,
    printStatus: String(o.print_status || 'none'),
    printError: o.print_error || null,
  }));

  return NextResponse.json({ orders });
}
