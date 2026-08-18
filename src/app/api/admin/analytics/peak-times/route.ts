/**
 * GET /api/admin/analytics/peak-times
 *
 * Aggregates order count grouped by day-of-week and hour-of-day in Stockholm timezone.
 * Returns { byDayOfWeek: { day: string, count: number }[], byHour: { hour: string, count: number }[] }.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, getDay, getHours, parseISO } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const STOCKHOLM_TZ = 'Europe/Stockholm';

const DAY_NAMES = ['Sön', 'Mån', 'Tis', 'Ons', 'Tors', 'Fre', 'Lör'];

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
      console.error('[analytics/peak-times] Supabase error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta högtidstider' }, { status: 500 });
    }

    const dayCounts: number[] = new Array(7).fill(0);
    const hourCounts: number[] = new Array(24).fill(0);

    for (const order of rawOrders || []) {
      if (!order.created_at) continue;
      const zonedDate = toZonedTime(new Date(order.created_at), STOCKHOLM_TZ);
      const dayIndex = getDay(zonedDate); // 0 = Sun, 1 = Mon ...
      const hourIndex = getHours(zonedDate); // 0 .. 23

      dayCounts[dayIndex] += 1;
      hourCounts[hourIndex] += 1;
    }

    // Re-order days starting from Monday (Mån, Tis, Ons, Tors, Fre, Lör, Sön)
    const mondayFirstOrder = [1, 2, 3, 4, 5, 6, 0];
    const byDayOfWeek = mondayFirstOrder.map((dayIdx) => ({
      day: DAY_NAMES[dayIdx],
      count: dayCounts[dayIdx],
    }));

    const byHour = hourCounts.map((count, hour) => ({
      hour: `${String(hour).padStart(2, '0')}:00`,
      count,
    }));

    return NextResponse.json(
      { byDayOfWeek, byHour },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid analys av toppar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
