/**
 * GET /api/admin/orders-summary
 *
 * Returns today's total orders count and total revenue in SEK (Stockholm timezone start of day).
 * Requires admin authentication cookie.
 */

import { NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';

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
      .select('total, status')
      .gte('created_at', startOfDayStr);

    if (error) {
      console.error('[admin/orders-summary] Supabase error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta ordersummering' }, { status: 500 });
    }

    const validOrders = (orders || []).filter(
      (o) => String(o.status || '').toLowerCase() !== 'cancelled',
    );

    const totalOrders = validOrders.length;
    const totalRevenueKr = validOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    return NextResponse.json({ totalOrders, totalRevenueKr });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid hämting av summering';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
