/**
 * /api/admin/auth
 *
 * GET: Checks if client possesses a valid admin_session cookie.
 * POST: Validates PIN against ADMIN_PIN and sets a 12-hour httpOnly cookie on success.
 *       Rate-limited by IP via Supabase auth_attempts table.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, setAdminAuthCookie, verifyAdminPin } from '@/lib/adminAuth';
import { checkRateLimit, getCallerIdentifier, recordAttempt } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const authenticated = isAdminAuthenticated();
  return NextResponse.json(
    { authenticated },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0, must-revalidate',
      },
    },
  );
}

export async function POST(req: NextRequest) {
  try {
    const identifier = getCallerIdentifier(req);

    // Rate limit check — must happen before PIN verification so brute-force
    // attempts are rejected without touching the PIN comparison.
    const rateResult = await checkRateLimit(identifier, 'admin');
    if (!rateResult.allowed) {
      return NextResponse.json(
        { error: 'För många försök. Försök igen om 15 minuter.' },
        { status: 429 },
      );
    }

    const body = await req.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!verifyAdminPin(pin)) {
      await recordAttempt(identifier, 'admin', false);
      return NextResponse.json({ error: 'Fel PIN-kod' }, { status: 401 });
    }

    await recordAttempt(identifier, 'admin', true);
    setAdminAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
