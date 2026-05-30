// FUTURE: Phase 2 order endpoints will be handled here (e.g. POST to create an order).
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Order API placeholder - Phase 2 reserved' });
}
