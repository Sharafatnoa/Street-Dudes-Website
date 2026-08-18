/**
 * Server-side authentication helpers for the admin dashboard.
 * Compares PIN against process.env.ADMIN_PIN and manages httpOnly auth cookies.
 * NEVER import this file in client components.
 */

import { cookies } from 'next/headers';

const COOKIE_NAME = 'admin_session';
const DEFAULT_PIN = '5678';

function getExpectedToken(): string {
  const pin = process.env.ADMIN_PIN || DEFAULT_PIN;
  return Buffer.from(`${pin.trim()}_admin_dashboard_auth`).toString('base64');
}

/**
 * Validates the submitted PIN against ADMIN_PIN environment variable.
 */
export function verifyAdminPin(pin: string): boolean {
  const expectedPin = process.env.ADMIN_PIN || DEFAULT_PIN;
  return pin.trim() === expectedPin.trim();
}

/**
 * Checks if the current request has a valid admin session cookie.
 */
export function isAdminAuthenticated(): boolean {
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
 * Sets the httpOnly admin auth cookie (12-hour duration).
 */
export function setAdminAuthCookie(): void {
  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, getExpectedToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60, // 12 hours
    path: '/',
  });
}
