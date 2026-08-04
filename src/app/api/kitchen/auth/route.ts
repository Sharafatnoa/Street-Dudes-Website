/**
 * /api/kitchen/auth
 *
 * GET: Checks if client possesses a valid kitchen_session cookie.
 * POST: Validates PIN and sets a 12-hour httpOnly cookie on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated, setKitchenAuthCookie, verifyKitchenPin } from '@/lib/kitchenAuth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authenticated = isKitchenAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!verifyKitchenPin(pin)) {
      return NextResponse.json({ error: 'Fel PIN-kod' }, { status: 401 });
    }

    setKitchenAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
