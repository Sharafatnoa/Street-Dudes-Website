/**
 * Server-side authentication helpers for the kitchen dashboard.
 * Compares PIN against process.env.KITCHEN_PIN and manages httpOnly auth cookies.
 * NEVER import this file in client components.
 */

import { cookies } from 'next/headers';

const COOKIE_NAME = 'kitchen_session';
const DEFAULT_PIN = '1234';

function getExpectedToken(): string {
  const pin = process.env.KITCHEN_PIN || DEFAULT_PIN;
  return Buffer.from(`${pin}_kitchen_dashboard_auth`).toString('base64');
}

/**
 * Validates the submitted PIN against KITCHEN_PIN environment variable.
 */
export function verifyKitchenPin(pin: string): boolean {
  const expectedPin = process.env.KITCHEN_PIN || DEFAULT_PIN;
  return pin.trim() === expectedPin.trim();
}

/**
 * Checks if the current request has a valid kitchen session cookie.
 */
export function isKitchenAuthenticated(): boolean {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;
    return token === getExpectedToken();
  } catch {
    return false;
  }
}

/**
 * Sets the httpOnly kitchen auth cookie (12-hour duration).
 */
export function setKitchenAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, getExpectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60, // 12 hours
    path: '/',
  });
}
