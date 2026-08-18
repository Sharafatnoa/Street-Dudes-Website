/**
 * GET /api/admin/analytics/top-items
 *
 * Aggregates most ordered menu items from the items JSONB payload.
 * Returns array of top 10 items { menuItemId, name, totalQuantity } sorted descending.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, parseISO } from 'date-fns';
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

export const dynamic = 'force-dynamic';

const STOCKHOLM_TZ = 'Europe/Stockholm';

type CartItemPayload = {
  id?: string;
  name?: string;
  quantity?: number;
};

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
      .select('items')
      .gte('created_at', fromIso)
      .lte('created_at', toIso);

    if (error) {
      console.error('[analytics/top-items] Supabase error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta mest populära rätter' }, { status: 500 });
    }

    const itemTotals: Record<string, { menuItemId: string; name: string; totalQuantity: number }> =
      {};

    for (const order of rawOrders || []) {
      const items: CartItemPayload[] = Array.isArray(order.items) ? order.items : [];
      for (const item of items) {
        const name = item.name || 'Okänd rätt';
        const menuItemId = item.id || name;
        const qty = Number(item.quantity || 1);

        if (!itemTotals[menuItemId]) {
          itemTotals[menuItemId] = { menuItemId, name, totalQuantity: 0 };
        }
        itemTotals[menuItemId].totalQuantity += qty;
      }
    }

    const sortedItems = Object.values(itemTotals)
      .sort((a, b) => b.totalQuantity - a.totalQuantity)
      .slice(0, 10);

    return NextResponse.json({ data: sortedItems });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid analys av populära rätter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
