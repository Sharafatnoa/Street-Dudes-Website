/**
 * Converts a street address string into GPS coordinates
 * using the Google Maps Geocoding API.
 *
 * Called server-side only — never from the browser.
 * The API key has no HTTP referrer restriction since
 * requests come from the Next.js server, not a browser.
 */

import type { Coordinates } from '@/types/delivery'

const GEOCODING_API_URL = 'https://maps.googleapis.com/maps/api/geocode/json'

type GeocodeResult = {
  success: true
  coordinates: Coordinates
} | {
  success: false
  error: string
}

/**
 * Geocodes an address string to lat/lng coordinates.
 * Appends "Sweden" to improve accuracy for local addresses.
 */
export async function geocodeAddress(
  address: string
): Promise<GeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_KEY

  if (!apiKey) {
    return {
      success: false,
      error: 'Geocoding API key is not configured',
    }
  }

  // Append Sweden to improve accuracy for local addresses
  const query = encodeURIComponent(`${address}, Sverige`)
  const url = `${GEOCODING_API_URL}?address=${query}&key=${apiKey}`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results.length) {
      return {
        success: false,
        error: 'Address not found. Please check the address and try again.',
      }
    }

    const location = data.results[0].geometry.location

    return {
      success: true,
      coordinates: {
        lat: location.lat,
        lng: location.lng,
      },
    }
  } catch {
    return {
      success: false,
      error: 'Could not reach the address lookup service. Try again.',
    }
  }
}
