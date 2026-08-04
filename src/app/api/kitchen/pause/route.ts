/**
 * PATCH /api/kitchen/pause
 *
 * Toggles restaurant pause status in Supabase config table.
 * Body: { isPaused: boolean, pauseMessage?: string }
 * Gated by kitchen auth cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated } from '@/lib/kitchenAuth';
import { getServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest) {
  if (!isKitchenAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const isPaused = Boolean(body.isPaused);
    const pauseMessage =
      typeof body.pauseMessage === 'string'
        ? body.pauseMessage
        : 'Vi tar en kort paus och tar inte emot beställningar just nu.';

    const supabase = getServerClient();
    const { error } = await supabase
      .from('config')
      .update({
        is_paused: isPaused,
        pause_message: pauseMessage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', 1);

    if (error) {
      console.error('[kitchen/pause] Update error:', error);
      return NextResponse.json({ error: 'Kunde inte uppdatera pausstatus' }, { status: 500 });
    }

    return NextResponse.json({ success: true, isPaused, pauseMessage });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
