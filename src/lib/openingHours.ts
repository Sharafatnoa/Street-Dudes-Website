/**
 * Determines whether the restaurant is currently
 * accepting online orders based on:
 * - Current time in Stockholm timezone
 * - Day of week (weekday vs weekend)
 * - Configured opening hours from Supabase config
 * - Manual pause state
 * - Manual is_open override
 *
 * Always uses Stockholm time regardless of where
 * the server is running. Sweden observes CET/CEST
 * which is UTC+1 in winter and UTC+2 in summer.
 */

import { toZonedTime } from 'date-fns-tz'
import type { AppConfig } from '@/types/config'

const STOCKHOLM_TIMEZONE = 'Europe/Stockholm'

export type RestaurantState = 'OPEN' | 'BREAK' | 'CLOSED' | 'PAUSED'

export type RestaurantStatus = {
  state: RestaurantState
  message: string
  nextOpenTime: string | null
  estimatedDeliveryMins: number
  estimatedPickupMins: number
}

/**
 * Parses a time string "HH:MM" into hours and minutes.
 */
function parseTime(time: string): { hours: number; minutes: number } {
  const [hours, minutes] = time.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Converts a time string "HH:MM" to total minutes since midnight.
 * Used for easy time comparisons.
 */
function timeToMinutes(time: string): number {
  const { hours, minutes } = parseTime(time)
  return hours * 60 + minutes
}

/**
 * Formats a time string "HH:MM" for display to customers.
 * Example: "11:00" → "11:00"
 */
function formatTime(time: string): string {
  return time
}

/**
 * Returns true if today is a weekend day (Saturday or Sunday).
 * Uses Stockholm local time.
 */
function isWeekend(stockholmDate: Date): boolean {
  const day = stockholmDate.getDay()
  return day === 0 || day === 6 // 0 = Sunday, 6 = Saturday
}

/**
 * Gets the current time in Stockholm as total minutes since midnight.
 */
function getCurrentMinutes(stockholmDate: Date): number {
  return stockholmDate.getHours() * 60 + stockholmDate.getMinutes()
}

/**
 * Determines the current restaurant status based on
 * config values and current Stockholm time.
 *
 * Call this in every API route that handles orders
 * and on the order page to show the correct status.
 */
export function getRestaurantStatus(config: AppConfig): RestaurantStatus {
  // Manual override — restaurant closed by admin
  if (!config.isOpen) {
    return {
      state: 'CLOSED',
      message: 'Vi är stängda för tillfället.',
      nextOpenTime: null,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // Manual pause — temporarily not accepting orders
  if (config.isPaused) {
    const message = config.pauseMessage ||
      'Vi tar en kort paus och tar inte emot beställningar just nu.'

    return {
      state: 'PAUSED',
      message,
      nextOpenTime: config.pauseUntil || null,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // Get current Stockholm time
  const now = toZonedTime(new Date(), STOCKHOLM_TIMEZONE)
  const currentMinutes = getCurrentMinutes(now)
  const weekend = isWeekend(now)

  if (weekend) {
    // Weekend — single session, no break
    const openMinutes = timeToMinutes(config.weekendOpen)
    const closeMinutes = timeToMinutes(config.weekendClose)

    if (currentMinutes < openMinutes) {
      return {
        state: 'CLOSED',
        message: `Vi öppnar idag kl ${formatTime(config.weekendOpen)}`,
        nextOpenTime: config.weekendOpen,
        estimatedDeliveryMins: config.estimatedDeliveryMins,
        estimatedPickupMins: config.estimatedPickupMins,
      }
    }

    if (currentMinutes >= closeMinutes) {
      return {
        state: 'CLOSED',
        message: 'Vi är stängda för idag. Vi öppnar imorgon!',
        nextOpenTime: null,
        estimatedDeliveryMins: config.estimatedDeliveryMins,
        estimatedPickupMins: config.estimatedPickupMins,
      }
    }

    return {
      state: 'OPEN',
      message: `Öppet · Stänger kl ${formatTime(config.weekendClose)}`,
      nextOpenTime: null,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // Weekday — two sessions with a break
  const openMinutes = timeToMinutes(config.weekdayOpen)
  const breakStartMinutes = timeToMinutes(config.weekdayBreakStart)
  const breakEndMinutes = timeToMinutes(config.weekdayBreakEnd)
  const closeMinutes = timeToMinutes(config.weekdayClose)

  // Before opening
  if (currentMinutes < openMinutes) {
    return {
      state: 'CLOSED',
      message: `Vi öppnar idag kl ${formatTime(config.weekdayOpen)}`,
      nextOpenTime: config.weekdayOpen,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // First session — open before break
  if (currentMinutes >= openMinutes && currentMinutes < breakStartMinutes) {
    return {
      state: 'OPEN',
      message: `Öppet · Rast kl ${formatTime(config.weekdayBreakStart)}`,
      nextOpenTime: null,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // Break time
  if (currentMinutes >= breakStartMinutes && currentMinutes < breakEndMinutes) {
    return {
      state: 'BREAK',
      message: `Lunchrast · Vi öppnar igen kl ${formatTime(config.weekdayBreakEnd)}`,
      nextOpenTime: config.weekdayBreakEnd,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // Second session — open after break
  if (currentMinutes >= breakEndMinutes && currentMinutes < closeMinutes) {
    return {
      state: 'OPEN',
      message: `Öppet · Stänger kl ${formatTime(config.weekdayClose)}`,
      nextOpenTime: null,
      estimatedDeliveryMins: config.estimatedDeliveryMins,
      estimatedPickupMins: config.estimatedPickupMins,
    }
  }

  // After closing
  return {
    state: 'CLOSED',
    message: 'Vi är stängda för idag. Vi öppnar imorgon kl ' +
      formatTime(config.weekdayOpen),
    nextOpenTime: null,
    estimatedDeliveryMins: config.estimatedDeliveryMins,
    estimatedPickupMins: config.estimatedPickupMins,
  }
}

/**
 * Returns true if the restaurant is currently
 * accepting orders. Use this for quick checks
 * in API routes before processing requests.
 */
export function isAcceptingOrders(config: AppConfig): boolean {
  const status = getRestaurantStatus(config)
  return status.state === 'OPEN'
}
