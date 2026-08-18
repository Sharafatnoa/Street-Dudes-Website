/**
 * GET /api/admin/analytics/volume
 *
 * Daily order volume aggregation over date range (default last 30 days).
 * Aggregated in Stockholm timezone.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STOCKHOLM_TZ = 'Europe/Stockholm';

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    const nowStockholm = toZonedTime(new Date(), STOCKHOLM_TZ);

    const fromDate = fromParam ? parseISO(fromParam) : subDays(nowStockholm, 30);
    const toDate = toParam ? parseISO(toParam) : nowStockholm;

    const fromIso = formatInTimeZone(
      startOfDay(fromDate),
      STOCKHOLM_TZ,
      "yyyy-MM-dd'T'HH:mm:ssXXX",
    );
    const toIso = formatInTimeZone(endOfDay(toDate), STOCKHOLM_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");

    const supabase = getServerClient();
    const { data: rawOrders, error } = await supabase
      .from('orders')
      .select('created_at')
      .gte('created_at', fromIso)
      .lte('created_at', toIso);

    if (error) {
      console.error('[analytics/volume] Supabase error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta ordervolym' }, { status: 500 });
    }

    const countsByDate: Record<string, number> = {};

    // Pre-fill all dates in range with 0
    const intervalDays = eachDayOfInterval({
      start: startOfDay(fromDate),
      end: startOfDay(toDate),
    });

    for (const d of intervalDays) {
      const dateKey = formatInTimeZone(d, STOCKHOLM_TZ, 'yyyy-MM-dd');
      countsByDate[dateKey] = 0;
    }

    // Count orders per date
    for (const order of rawOrders || []) {
      if (!order.created_at) continue;
      const orderDateKey = formatInTimeZone(new Date(order.created_at), STOCKHOLM_TZ, 'yyyy-MM-dd');
      countsByDate[orderDateKey] = (countsByDate[orderDateKey] || 0) + 1;
    }

    const data = Object.entries(countsByDate).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json(
      { data },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid analys av ordervolym';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
