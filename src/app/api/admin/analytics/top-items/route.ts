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
import { parseISO } from 'date-fns';
import {
  stockholmDateString,
  stockholmDateStringDaysAgo,
  stockholmStartOfDay,
  stockholmEndOfDay,
} from '@/lib/stockholmTime';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    return NextResponse.json(
      { data: sortedItems },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid analys av populära rätter';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
