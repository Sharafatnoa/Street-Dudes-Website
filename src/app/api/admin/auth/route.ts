/**
 * /api/admin/auth
 *
 * GET: Checks if client possesses a valid admin_session cookie.
 * POST: Validates PIN against ADMIN_PIN and sets a 12-hour httpOnly cookie on success.
 */

import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated, setAdminAuthCookie, verifyAdminPin } from '@/lib/adminAuth';

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
    const body = await req.json();
    const pin = typeof body.pin === 'string' ? body.pin : '';

    if (!verifyAdminPin(pin)) {
      return NextResponse.json({ error: 'Fel PIN-kod' }, { status: 401 });
    }

    setAdminAuthCookie();
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Ogiltig begäran' }, { status: 400 });
  }
}
