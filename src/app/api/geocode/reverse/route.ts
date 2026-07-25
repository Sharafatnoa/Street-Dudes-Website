/**
 * POST /api/geocode/reverse
 *
 * Converts GPS coordinates to a street address.
 * Called when customer taps "Use my location".
 * Server-side so the geocoding key stays secret.
 *
 * Request body: { lat: number, lng: number }
 * Response: { address: string } or { error: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { reverseGeocodeCoordinates } from '@/lib/geocode'

export async function POST(request: NextRequest) {
  try {
    const { lat, lng } = await request.json()

    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json(
        { error: 'Ogiltiga koordinater' },
        { status: 400 }
      )
    }

    const result = await reverseGeocodeCoordinates(lat, lng)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 422 }
      )
    }

    return NextResponse.json({ address: result.address })
  } catch (error) {
    console.error('Reverse geocode error:', error)
    return NextResponse.json(
      { error: 'Kunde inte hämta adress' },
      { status: 500 }
    )
  }
}
