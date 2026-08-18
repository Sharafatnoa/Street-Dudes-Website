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
export const revalidate = 0;

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
    return NextResponse.json(
      { config },
      {
        headers: {
          'Cache-Control': 'no-store, max-age=0, must-revalidate',
        },
      },
    );
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
    // Upsert: creates the row if it doesn't exist yet (INSERT … ON CONFLICT (key)
    // DO UPDATE SET value). This is safe because `key` is already validated against
    // the explicit allowlist above. Prevents the silent-no-op bug where update()
    // matches 0 rows and returns success without writing anything.
    // The config table has a NOT NULL `description` column, so we must supply one
    // for the INSERT case. On conflict the existing description is preserved since
    // Supabase's upsert merges only the supplied columns.
    const DESCRIPTIONS: Record<AllowedConfigKey, string> = {
      delivery_radius_km: 'Maximum delivery distance in kilometres',
      delivery_fee_kr: 'Standard delivery fee in Swedish kronor',
      free_delivery_threshold_kr: 'Order value above which delivery is free',
      min_order_kr: 'Minimum order amount in Swedish kronor',
      weekday_open: 'Weekday opening time',
      weekday_break_start: 'Weekday break start time',
      weekday_break_end: 'Weekday break end time',
      weekday_close: 'Weekday closing time',
      weekend_open: 'Weekend opening time',
      weekend_close: 'Weekend closing time',
      is_paused: 'Whether ordering is temporarily paused',
      pause_message: 'Message shown while ordering is paused',
      online_ordering_enabled: 'Master toggle for online ordering',
    };
    const { error } = await supabase
      .from('config')
      .upsert({ key, value: valString, description: DESCRIPTIONS[key] }, { onConflict: 'key' });

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
