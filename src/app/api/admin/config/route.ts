/**
 * /api/admin/config
 *
 * GET: Returns all current config settings via getConfig().
 * PATCH: Updates a single config key after validating against an explicit allowlist.
 * Requires admin authentication cookie.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/adminAuth';
import { getConfig } from '@/lib/getConfig';
import { getServerClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const ALLOWED_CONFIG_KEYS = [
  'delivery_radius_km',
  'delivery_fee_kr',
  'free_delivery_threshold_kr',
  'min_order_kr',
  'weekday_open',
  'weekday_break_start',
  'weekday_break_end',
  'weekday_close',
  'weekend_open',
  'weekend_close',
  'is_paused',
  'pause_message',
  'online_ordering_enabled',
] as const;

type AllowedConfigKey = (typeof ALLOWED_CONFIG_KEYS)[number];

function isAllowedConfigKey(key: unknown): key is AllowedConfigKey {
  return typeof key === 'string' && (ALLOWED_CONFIG_KEYS as readonly string[]).includes(key);
}

export async function GET() {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const config = await getConfig();
    return NextResponse.json({ config });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Kunde inte hämta inställningar';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  if (!isAdminAuthenticated()) {
    return NextResponse.json({ error: 'Obehörig' }, { status: 401 });
  }

  try {
    const body: { key?: string; value?: unknown } = await req.json();
    const { key, value } = body || {};

    if (!key || !isAllowedConfigKey(key)) {
      return NextResponse.json(
        { error: 'Ogiltig eller otillåten inställningsnyckel' },
        { status: 400 },
      );
    }

    const valString = value !== undefined && value !== null ? String(value) : '';

    const supabase = getServerClient();
    const { error } = await supabase.from('config').update({ value: valString }).eq('key', key);

    if (error) {
      console.error('[admin/config] Supabase update error:', error);
      return NextResponse.json(
        { error: 'Misslyckades att uppdatera inställning' },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true, key, value: valString });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
