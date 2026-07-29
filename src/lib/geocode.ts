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

/**
 * Converts GPS coordinates to a human-readable
 * street address using Google Maps Reverse Geocoding.
 * Called when customer uses the GPS location button.
 * Server-side only — uses GOOGLE_MAPS_GEOCODING_KEY.
 */

/** Structured address fields parsed from Google address_components */
export type ParsedAddress = {
  streetAddress: string    // route + street_number, e.g. "Bohustgatan 12"
  postalCode: string       // postal_code, e.g. "504 35"
  city: string             // postal_town or locality, e.g. "Borås"
  imprecise: boolean       // true when route is missing (Plus Code / area only)
}

/** A single entry from Google's address_components array */
type AddressComponent = {
  long_name: string
  short_name: string
  types: string[]
}

/**
 * Parses Google Geocoding API address_components into structured fields.
 * Exported for unit testing — contains no I/O.
 *
 * Returns imprecise=true if the result has no route (e.g. Plus Code),
 * which tells the client to skip autofill and show a helpful message.
 */
export function parseAddressComponents(
  components: AddressComponent[]
): ParsedAddress {
  const find = (type: string) =>
    components.find(c => c.types.includes(type))?.long_name ?? ''

  const route       = find('route')
  const streetNo    = find('street_number')
  const postalCode  = find('postal_code')
  // Sweden uses postal_town; locality is a fallback for other regions
  const city        = find('postal_town') || find('locality')

  // Without a route we only have an approximate area — do not autofill
  if (!route) {
    return { streetAddress: '', postalCode: '', city: '', imprecise: true }
  }

  const streetAddress = streetNo
    ? `${route} ${streetNo}`
    : route

  return { streetAddress, postalCode, city, imprecise: false }
}

type ReverseGeocodeResult =
  | { success: true; parsed: ParsedAddress }
  | { success: false; error: string }

export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number
): Promise<ReverseGeocodeResult> {
  const apiKey = process.env.GOOGLE_MAPS_GEOCODING_KEY

  if (!apiKey) {
    return { success: false, error: 'Geocoding not configured' }
  }

  const url =
    `https://maps.googleapis.com/maps/api/geocode/json` +
    `?latlng=${lat},${lng}&key=${apiKey}&language=sv`

  try {
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== 'OK' || !data.results.length) {
      return {
        success: false,
        error: 'Kunde inte hitta din adress. Ange den manuellt.',
      }
    }

    // Parse structured components — never use formatted_address
    // because Google may return a Plus Code there for imprecise results
    const parsed = parseAddressComponents(
      data.results[0].address_components ?? []
    )

    return { success: true, parsed }
  } catch {
    return {
      success: false,
      error: 'Platstjänsten är inte tillgänglig just nu.',
    }
  }
}

