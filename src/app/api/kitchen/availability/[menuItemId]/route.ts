/**
 * PATCH /api/kitchen/availability/[menuItemId]
 *
 * Updates item_availability table to mark a menu item as available or sold out.
 * Body: { isAvailable: boolean }
 * Gated by kitchen auth cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated } from '@/lib/kitchenAuth';
import { getServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PATCH(req: NextRequest, { params }: { params: { menuItemId: string } }) {
  if (!isKitchenAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  const { menuItemId } = params;
  if (!menuItemId) {
    return NextResponse.json({ error: 'Saknar menu_item_id' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const isAvailable = Boolean(body.isAvailable);

    const supabase = getServerClient();
    const { error } = await supabase.from('item_availability').upsert(
      {
        menu_item_id: menuItemId,
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'menu_item_id' },
    );

    if (error) {
      console.error('[kitchen/availability] Upsert error:', error);
      return NextResponse.json({ error: 'Kunde inte uppdatera tillgänglighet' }, { status: 500 });
    }

    return NextResponse.json({ success: true, menuItemId, isAvailable });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
