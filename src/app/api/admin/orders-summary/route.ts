/**
 * GET /api/admin/orders-summary
 *
 * Returns today's order count, gross revenue, total refunded amount, and net revenue in SEK (Stockholm start of day).
 * Requires admin authentication cookie.
 */

import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STOCKHOLM_TZ = 'Europe/Stockholm';

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const nowStockholm = toZonedTime(new Date(), STOCKHOLM_TZ);
    const startOfDayStr = formatInTimeZone(
      startOfDay(nowStockholm),
      STOCKHOLM_TZ,
      "yyyy-MM-dd'T'HH:mm:ssXXX",
    );

    const supabase = getServerClient();
    const { data: orders, error } = await supabase
      .from('orders')
      .select('total, status, refund_amount_kr')
      .gte('created_at', startOfDayStr);

    if (error) {
      console.error('[admin/orders-summary] Supabase error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta ordersummering' }, { status: 500 });
    }

    const validOrders = (orders || []).filter(
      (o) => String(o.status || '').toLowerCase() !== 'cancelled',
    );

    const totalOrders = validOrders.length;
    const grossRevenueKr = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const totalRefundedKr = validOrders.reduce(
      (sum, o) => sum + Number(o.refund_amount_kr || 0),
      0,
    );
    const netRevenueKr = grossRevenueKr - totalRefundedKr;

    return NextResponse.json(
      {
        totalOrders,
        grossRevenueKr,
        totalRefundedKr,
        netRevenueKr,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid hämting av summering';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
