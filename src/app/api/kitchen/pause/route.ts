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
    const { error: pauseError } = await supabase
      .from('config')
      .update({ value: isPaused ? 'true' : 'false' })
      .eq('key', 'is_paused');

    if (pauseError) {
      console.error('[kitchen/pause] Update is_paused error:', pauseError);
      return NextResponse.json({ error: 'Kunde inte uppdatera pausstatus' }, { status: 500 });
    }

    if (typeof body.pauseMessage === 'string') {
      const { error: msgError } = await supabase
        .from('config')
        .update({ value: pauseMessage })
        .eq('key', 'pause_message');

      if (msgError) {
        console.error('[kitchen/pause] Update pause_message error:', msgError);
      }
    }

    return NextResponse.json({ success: true, isPaused, pauseMessage });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
