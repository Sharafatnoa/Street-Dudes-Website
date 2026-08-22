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
import { parseISO } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import {
  stockholmDateString,
  stockholmDateStringDaysAgo,
  stockholmStartOfDay,
  stockholmEndOfDay,
  STOCKHOLM_TZ,
} from '@/lib/stockholmTime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const fromParam = searchParams.get('from');
    const toParam = searchParams.get('to');

    let fromDateStr: string;
    if (fromParam) {
      parseISO(fromParam); // validate
      fromDateStr = fromParam;
    } else {
      fromDateStr = stockholmDateStringDaysAgo(30);
    }

    let toDateStr: string;
    if (toParam) {
      parseISO(toParam); // validate
      toDateStr = toParam;
    } else {
      toDateStr = stockholmDateString();
    }

    const fromIso = stockholmStartOfDay(fromDateStr);
    const toIso = stockholmEndOfDay(toDateStr);

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

    // Pre-fill all dates in range with 0 using plain UTC date arithmetic
    const [fy, fm, fd] = fromDateStr.split('-').map(Number);
    const [ty, tm, td] = toDateStr.split('-').map(Number);
    const cursor = new Date(Date.UTC(fy, fm - 1, fd));
    const end = new Date(Date.UTC(ty, tm - 1, td));
    while (cursor <= end) {
      const dateKey = formatInTimeZone(cursor, 'UTC', 'yyyy-MM-dd');
      countsByDate[dateKey] = 0;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
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
