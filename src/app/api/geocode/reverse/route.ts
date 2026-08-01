/**
 * POST /api/geocode/reverse
 *
 * Converts GPS coordinates to structured address fields.
 * Called when customer taps "Use my location".
 * Server-side so the geocoding key stays secret.
 *
 * Request body: { lat: number, lng: number }
 * Response: { streetAddress, postalCode, city, imprecise }
 *   imprecise: true when Google could only resolve a Plus Code /
 *   approximate area — the client should prompt manual entry.
 */

import { NextRequest, NextResponse } from 'next/server';
import { reverseGeocodeCoordinates } from '@/lib/geocode';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json();

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ error: 'Ogiltiga koordinater' }, { status: 400 });
    }

    const result = await reverseGeocodeCoordinates(lat, lng);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 422 });
    }

    // Return parsed fields directly — client uses them without further parsing
    return NextResponse.json(result.parsed);
  } catch (error) {
    console.error('Reverse geocode error:', error);
    return NextResponse.json({ error: 'Kunde inte hämta adress' }, { status: 500 });
  }
}
