/**
 * Tests for the opening hours logic.
 * We mock the current time to test each scenario.
 */

import { getRestaurantStatus, isAcceptingOrders } from '@/lib/openingHours'
import type { AppConfig } from '@/types/config'

// Base config used across all tests
const baseConfig: AppConfig = {
  deliveryRadiusKm: 10,
  deliveryFeeKr: 49,
  freeDeliveryThresholdKr: 400,
  minOrderKr: 100,
  estimatedDeliveryMins: 30,
  estimatedPickupMins: 15,
  isOpen: true,
  isPaused: false,
  pauseMessage: '',
  pauseUntil: '',
  deliveryEnabled: true,
  pickupEnabled: true,
  restaurantLat: 57.7244832,
  restaurantLng: 12.9256065,
  weekdayOpen: '11:00',
  weekdayBreakStart: '14:30',
  weekdayBreakEnd: '16:00',
  weekdayClose: '20:00',
  weekendOpen: '12:00',
  weekendClose: '20:00',
}

// Helper to mock Stockholm time
function mockStockholmTime(isoString: string) {
  jest.useFakeTimers()
  jest.setSystemTime(new Date(isoString))
}

afterEach(() => {
  jest.useRealTimers()
})

describe('getRestaurantStatus', () => {
  it('returns CLOSED when is_open is false', () => {
    const config = { ...baseConfig, isOpen: false }
    const status = getRestaurantStatus(config)
    expect(status.state).toBe('CLOSED')
  })

  it('returns PAUSED when isPaused is true', () => {
    const config = { ...baseConfig, isPaused: true }
    const status = getRestaurantStatus(config)
    expect(status.state).toBe('PAUSED')
  })

  it('returns CLOSED before opening on a weekday', () => {
    // Monday 10:00 Stockholm time
    mockStockholmTime('2026-07-20T08:00:00Z') // UTC = 10:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('CLOSED')
    expect(status.nextOpenTime).toBe('11:00')
  })

  it('returns OPEN during first weekday session', () => {
    // Monday 12:00 Stockholm time
    mockStockholmTime('2026-07-20T10:00:00Z') // UTC = 12:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('OPEN')
  })

  it('returns BREAK during lunch break', () => {
    // Monday 15:00 Stockholm time
    mockStockholmTime('2026-07-20T13:00:00Z') // UTC = 15:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('BREAK')
    expect(status.nextOpenTime).toBe('16:00')
  })

  it('returns OPEN during second weekday session', () => {
    // Monday 17:00 Stockholm time
    mockStockholmTime('2026-07-20T15:00:00Z') // UTC = 17:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('OPEN')
  })

  it('returns CLOSED after closing time on weekday', () => {
    // Monday 21:00 Stockholm time
    mockStockholmTime('2026-07-20T19:00:00Z') // UTC = 21:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('CLOSED')
  })

  it('returns CLOSED before opening on weekend', () => {
    // Saturday 10:00 Stockholm time
    mockStockholmTime('2026-07-18T08:00:00Z') // UTC = 10:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('CLOSED')
    expect(status.nextOpenTime).toBe('12:00')
  })

  it('returns OPEN during weekend hours', () => {
    // Saturday 14:00 Stockholm time
    mockStockholmTime('2026-07-18T12:00:00Z') // UTC = 14:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('OPEN')
  })

  it('returns CLOSED after weekend closing time', () => {
    // Saturday 21:00 Stockholm time
    mockStockholmTime('2026-07-18T19:00:00Z') // UTC = 21:00 CEST
    const status = getRestaurantStatus(baseConfig)
    expect(status.state).toBe('CLOSED')
  })
})

describe('isAcceptingOrders', () => {
  it('returns true when restaurant is OPEN', () => {
    // Monday 12:00 Stockholm time
    mockStockholmTime('2026-07-20T10:00:00Z')
    expect(isAcceptingOrders(baseConfig)).toBe(true)
  })

  it('returns false when restaurant is CLOSED', () => {
    // Monday 09:00 Stockholm time
    mockStockholmTime('2026-07-20T07:00:00Z')
    expect(isAcceptingOrders(baseConfig)).toBe(false)
  })

  it('returns false when restaurant is on BREAK', () => {
    // Monday 15:00 Stockholm time
    mockStockholmTime('2026-07-20T13:00:00Z')
    expect(isAcceptingOrders(baseConfig)).toBe(false)
  })

  it('returns false when restaurant is PAUSED', () => {
    const config = { ...baseConfig, isPaused: true }
    expect(isAcceptingOrders(config)).toBe(false)
  })
})
