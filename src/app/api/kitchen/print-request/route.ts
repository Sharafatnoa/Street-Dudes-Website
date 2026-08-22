/**
 * POST /api/kitchen/print-request
 *
 * Manual reprint trigger. Sets print_status back to 'pending' so the
 * external ESC/POS bridge (subscribed via Supabase Realtime) picks it up.
 * Works for ANY order at any time, including already-printed orders
 * and orders from previous days.
 *
 * Body: { orderId: string }
 * Auth: kitchen PIN cookie (same pattern as all /api/kitchen/* routes)
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated } from '@/lib/kitchenAuth';
import { getServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (!isKitchenAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  let body: { orderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }

  const { orderId } = body;
  if (!orderId || typeof orderId !== 'string') {
    return NextResponse.json({ error: 'orderId saknas' }, { status: 400 });
  }

  const supabase = getServerClient();

  // Deliberately NO WHERE guard on current print_status —
  // re-queueing an already-printed order is the entire point.
  const { error } = await supabase
    .from('orders')
    .update({
      print_status: 'pending',
      print_requested_at: new Date().toISOString(),
      print_error: null,
    })
    .eq('id', orderId);

  if (error) {
    console.error('[kitchen/print-request] Supabase update error:', error);
    return NextResponse.json({ error: 'Kunde inte köa utskrift' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
