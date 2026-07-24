/**
 * Calculates the distance in kilometres between
 * two GPS coordinates using the Haversine formula.
 *
 * Accurate to within 0.5% for distances under 100km.
 * Used to check if a customer address is within
 * the restaurant delivery radius.
 */

import type { Coordinates } from '@/types/delivery'

const EARTH_RADIUS_KM = 6371

/**
 * Converts degrees to radians.
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Returns the distance in kilometres between
 * two coordinate points.
 */
export function calculateDistanceKm(
  from: Coordinates,
  to: Coordinates
): number {
  const deltaLat = toRadians(to.lat - from.lat)
  const deltaLng = toRadians(to.lng - from.lng)

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(toRadians(from.lat)) *
    Math.cos(toRadians(to.lat)) *
    Math.sin(deltaLng / 2) *
    Math.sin(deltaLng / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return EARTH_RADIUS_KM * c
}
