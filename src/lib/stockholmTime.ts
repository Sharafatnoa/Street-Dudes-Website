/**
 * Shared helpers for computing Stockholm-timezone day boundaries.
 *
 * The previous code applied the UTC offset twice:
 *   formatInTimeZone(startOfDay(toZonedTime(now, tz)), tz, ...)
 * toZonedTime shifts the Date's internal instant so it *reads* as local time,
 * then formatInTimeZone shifts it again — producing a cutoff that is one UTC
 * offset too late. Orders created between real Stockholm midnight and the
 * bogus cutoff were invisible to the kitchen dashboard and admin summary.
 *
 * These helpers use fromZonedTime (the inverse of toZonedTime) to go from
 * wall-clock time to the real UTC instant exactly once.
 */

import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';

export const STOCKHOLM_TZ = 'Europe/Stockholm';

/**
 * The calendar date as it currently reads on a clock in Stockholm,
 * e.g. "2026-08-23".
 */
export function stockholmDateString(instant: Date = new Date()): string {
  return formatInTimeZone(instant, STOCKHOLM_TZ, 'yyyy-MM-dd');
}

/**
 * The real UTC instant of 00:00 Stockholm time on the given calendar date.
 *
 * fromZonedTime is the inverse of toZonedTime: it takes wall-clock time in
 * a zone and returns the actual instant. The previous code used
 * toZonedTime and then formatted with the zone again, applying the offset
 * twice and pushing every "today" filter one offset late.
 */
export function stockholmStartOfDay(dateStr: string): string {
  return fromZonedTime(`${dateStr}T00:00:00.000`, STOCKHOLM_TZ).toISOString();
}

/** The real UTC instant of 23:59:59.999 Stockholm time on the given date. */
export function stockholmEndOfDay(dateStr: string): string {
  return fromZonedTime(`${dateStr}T23:59:59.999`, STOCKHOLM_TZ).toISOString();
}

/**
 * The Stockholm calendar date N days before today, e.g. for a 7-day range.
 *
 * Arithmetic is done on the plain calendar date in UTC rather than by
 * subtracting 24h blocks from an instant, so a DST transition inside the
 * range cannot shift the result onto the wrong day.
 */
export function stockholmDateStringDaysAgo(days: number): string {
  const [year, month, day] = stockholmDateString().split('-').map(Number);
  const shifted = new Date(Date.UTC(year, month - 1, day - days));
  return formatInTimeZone(shifted, 'UTC', 'yyyy-MM-dd');
}
