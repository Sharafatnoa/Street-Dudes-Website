/**
 * GET /api/admin/orders
 *
 * Paginated order history query with date range, status, and refundStatus filters.
 * Uses Supabase range/limit for database-level pagination.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getServerClient } from '@/lib/supabase';
import { startOfDay, endOfDay, subDays, parseISO } from 'date-fns';
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
    const statusParam = searchParams.get('status');
    const refundStatusParam = searchParams.get('refundStatus');
    const pageParam = searchParams.get('page');
    const pageSizeParam = searchParams.get('pageSize');

    const page = Math.max(1, parseInt(pageParam || '1', 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(pageSizeParam || '25', 10) || 25));

    const nowStockholm = toZonedTime(new Date(), STOCKHOLM_TZ);

    let fromIso: string;
    if (fromParam) {
      const parsed = parseISO(fromParam);
      fromIso = formatInTimeZone(startOfDay(parsed), STOCKHOLM_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
    } else {
      fromIso = formatInTimeZone(
        startOfDay(subDays(nowStockholm, 7)),
        STOCKHOLM_TZ,
        "yyyy-MM-dd'T'HH:mm:ssXXX",
      );
    }

    let toIso: string;
    if (toParam) {
      const parsed = parseISO(toParam);
      toIso = formatInTimeZone(endOfDay(parsed), STOCKHOLM_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
    } else {
      toIso = formatInTimeZone(endOfDay(nowStockholm), STOCKHOLM_TZ, "yyyy-MM-dd'T'HH:mm:ssXXX");
    }

    const supabase = getServerClient();
    let query = supabase
      .from('orders')
      .select('*', { count: 'exact' })
      .gte('created_at', fromIso)
      .lte('created_at', toIso);

    if (statusParam && statusParam !== 'all') {
      query = query.eq('status', statusParam.toLowerCase());
    }

    if (refundStatusParam && refundStatusParam !== 'all') {
      if (refundStatusParam === 'refunded') {
        query = query.neq('refund_status', 'none');
      } else {
        query = query.eq('refund_status', refundStatusParam.toLowerCase());
      }
    }

    const startIndex = (page - 1) * pageSize;
    const endIndex = page * pageSize - 1;

    const {
      data: rawOrders,
      count,
      error,
    } = await query.order('created_at', { ascending: false }).range(startIndex, endIndex);

    if (error) {
      console.error('[admin/orders] Supabase fetch error:', error);
      return NextResponse.json({ error: 'Kunde inte hämta orderhistorik' }, { status: 500 });
    }

    const totalCount = count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    const orders = (rawOrders || []).map((o) => ({
      id: o.id,
      orderNumber: o.order_number,
      createdAt: o.created_at,
      status: String(o.status || 'pending').toLowerCase(),
      customerName: o.customer_name || '',
      customerEmail: o.customer_email || '',
      customerPhone: o.customer_phone || '',
      fulfillmentType: o.fulfillment_type || 'pickup',
      deliveryAddress: o.delivery_address,
      deliveryCity: o.delivery_city,
      items: o.items || [],
      subtotal: o.subtotal || 0,
      deliveryFee: o.delivery_fee || 0,
      total: o.total || 0,
      deliveryNotes: o.delivery_notes,
      allergyNotes: o.allergy_notes,
      refundStatus: o.refund_status || 'none',
      refundAmountKr: o.refund_amount_kr || null,
      refundReason: o.refund_reason || null,
      refundedAt: o.refunded_at || null,
    }));

    return NextResponse.json(
      {
        orders,
        totalCount,
        page,
        pageSize,
        totalPages,
      },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Fel vid hämting av ordrar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
