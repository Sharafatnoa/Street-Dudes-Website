/**
 * PATCH /api/kitchen/orders/[id]/status
 *
 * Updates the status of an order.
 * Body: { status: OrderStatus }
 * Gated by kitchen auth cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated } from '@/lib/kitchenAuth';
import { getServerClient } from '@/lib/supabase';
import type { OrderStatus } from '@/types/order';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: OrderStatus[] = ['pending', 'preparing', 'ready', 'completed'];

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!isKitchenAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Saknar order-ID' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const newStatus = String(body.status || '').toLowerCase() as OrderStatus;

    if (!VALID_STATUSES.includes(newStatus)) {
      return NextResponse.json(
        { error: `Ogiltig status. Giltiga värden: ${VALID_STATUSES.join(', ')}` },
        { status: 400 },
      );
    }

    const supabase = getServerClient();
    const { data: updated, error } = await supabase
      .from('orders')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error || !updated) {
      console.error('[kitchen/orders/status] Update error:', error);
      return NextResponse.json({ error: 'Kunde inte uppdatera orderstatus' }, { status: 500 });
    }

    const order = {
      id: updated.id,
      orderNumber: updated.order_number,
      createdAt: updated.created_at,
      updatedAt: updated.updated_at,
      status: String(updated.status || 'pending').toLowerCase() as OrderStatus,
      customerName: updated.customer_name || '',
      customerEmail: updated.customer_email || '',
      customerPhone: updated.customer_phone || '',
      fulfillmentType: updated.fulfillment_type || 'pickup',
      deliveryAddress: updated.delivery_address,
      deliveryApartment: updated.delivery_apartment,
      deliveryPostalCode: updated.delivery_postal_code,
      deliveryCity: updated.delivery_city,
      items: updated.items || [],
      subtotal: updated.subtotal || 0,
      deliveryFee: updated.delivery_fee || 0,
      total: updated.total || 0,
      deliveryNotes: updated.delivery_notes,
      allergyNotes: updated.allergy_notes,
    };

    return NextResponse.json({ order });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
