import { calculateDistanceKm } from '@/lib/haversine'

describe('calculateDistanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    const point = { lat: 57.7244832, lng: 12.9256065 }
    expect(calculateDistanceKm(point, point)).toBe(0)
  })

  it('calculates distance between restaurant and nearby point', () => {
    // Restaurant: Alingsåsvägen 40, Borås
    const restaurant = { lat: 57.7244832, lng: 12.9256065 }
    // Point ~5km away
    const nearby = { lat: 57.7700, lng: 12.9400 }
    const distance = calculateDistanceKm(restaurant, nearby)
    expect(distance).toBeGreaterThan(4)
    expect(distance).toBeLessThan(7)
  })

  it('correctly identifies a point outside 10km radius', () => {
    const restaurant = { lat: 57.7244832, lng: 12.9256065 }
    // Gothenburg city centre — about 60km away
    const farAway = { lat: 57.7089, lng: 11.9746 }
    const distance = calculateDistanceKm(restaurant, farAway)
    expect(distance).toBeGreaterThan(10)
  })
})
