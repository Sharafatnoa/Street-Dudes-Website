/**
 * /api/kitchen/auth
 *
 * GET: Checks if client possesses a valid kitchen_session cookie.
 * POST: Validates PIN and sets a 12-hour httpOnly cookie on success.
 *       Rate-limited by IP via Supabase auth_attempts table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isKitchenAuthenticated, setKitchenAuthCookie, verifyKitchenPin } from '@/lib/kitchenAuth';
import { checkRateLimit, getCallerIdentifier, recordAttempt } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

export async function GET() {
  const authenticated = isKitchenAuthenticated();
  return NextResponse.json({ authenticated });
}

export async function POST(req: NextRequest) {
  try {
    const identifier = getCallerIdentifier(req);

    // Rate limit check — must happen before PIN verification so brute-force
    // attempts are rejected without touching the PIN comparison.
    const rateResult = await checkRateLimit(identifier, 'kitchen');
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'För många försök. Försök igen om 15 minuter.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!verifyKitchenPin(pin)) {
      await recordAttempt(identifier, 'kitchen', false);
      return NextResponse.json({ error: 'Fel PIN-kod' }, { status: 401 });
    }

    await recordAttempt(identifier, 'kitchen', true);
    setKitchenAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
