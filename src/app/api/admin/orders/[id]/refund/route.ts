/**
 * PATCH /api/admin/orders/[id]/refund
 *
 * Handles partial and full refunds for an order.
 * Enforces server-side validation, idempotency check (no double refunds), and amount bounds.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { executeRefund } from '@/lib/refund';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: { id: string };
};

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const orderId = params?.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order-ID saknas' }, { status: 400 });
    }

    const body = await req.json();
    const { type, amountKr, reason } = body || {};

    if (!reason || typeof reason !== 'string' || !reason.trim()) {
      return NextResponse.json({ error: 'Orsak för återbetalning krävs' }, { status: 400 });
    }

    if (type !== 'partial' && type !== 'full') {
      return NextResponse.json({ error: 'Ogiltig återbetalningstyp' }, { status: 400 });
    }

    const supabase = getServerClient();
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, total, refund_status')
      .eq('id', orderId)
      .single();

    if (fetchError || !order) {
      return NextResponse.json({ error: 'Order hittades inte' }, { status: 404 });
    }

    // Idempotency guard: prevent double refunds
    const currentRefundStatus = String(order.refund_status || 'none').toLowerCase();
    if (currentRefundStatus !== 'none') {
      return NextResponse.json({ error: 'Denna order har redan återbetalats' }, { status: 400 });
    }

    const orderTotal = Number(order.total || 0);

    let refundStatus: 'partial' | 'full';
    let computedAmountKr: number;

    if (type === 'full') {
      refundStatus = 'full';
      // Derived server-side from order total
      computedAmountKr = orderTotal;
    } else {
      refundStatus = 'partial';
      const parsedAmount = Number(amountKr);
      if (isNaN(parsedAmount) || parsedAmount <= 0 || parsedAmount > orderTotal) {
        return NextResponse.json(
          {
            error: `Ogiltigt återbetalningsbelopp. Beloppet måste vara större än 0 och högst orderns totala belopp (${orderTotal} kr).`,
          },
          { status: 400 },
        );
      }
      computedAmountKr = Math.round(parsedAmount);
    }

    const result = await executeRefund({
      orderId: order.id,
      refundStatus,
      refundAmountKr: computedAmountKr,
      refundReason: reason.trim(),
    });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Misslyckades att genomföra återbetalning';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
