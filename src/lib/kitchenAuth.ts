/**
 * Server-side authentication helpers for the kitchen dashboard.
 * Compares PIN against process.env.KITCHEN_PIN and manages httpOnly auth cookies.
 *
 * Security invariants:
 *   - An unset KITCHEN_PIN locks the dashboard, it does not open it.
 *   - Session tokens are HMAC-signed and carry an expiry; they cannot be forged
 *     without AUTH_SECRET.
 *   - Token comparison uses crypto.timingSafeEqual to prevent timing attacks.
 *
 * NEVER import this file in client components.
 */

import { cookies } from 'next/headers';
import { createHmac, timingSafeEqual } from 'node:crypto';

const COOKIE_NAME = 'kitchen_session';
const AREA = 'kitchen';
const SESSION_DURATION_S = 12 * 60 * 60; // 12 hours

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns AUTH_SECRET or null if it is missing/blank.
 * Every caller must treat null as "refuse the operation".
 */
function getSecret(): string | null {
  const s = process.env.AUTH_SECRET;
  if (!s || s.trim() === '') {
    console.error('[kitchenAuth] AUTH_SECRET is not set -- refusing all auth operations');
    return null;
  }
  return s;
}

/** Produces `${expiresAtMs}.${hmac}` */
function createToken(secret: string): string {
  const expiresAtMs = Date.now() + SESSION_DURATION_S * 1000;
  const hmac = createHmac('sha256', secret).update(`${AREA}:${expiresAtMs}`).digest('hex');
  return `${expiresAtMs}.${hmac}`;
}

/**
 * Validates a token string.
 * Returns true only when the token is well-formed, not expired, and the HMAC
 * matches when compared in constant time.
 */
function validateToken(token: string, secret: string): boolean {
  const dotIndex = token.indexOf('.');
  if (dotIndex === -1) return false;

  const expiresAtStr = token.slice(0, dotIndex);
  const providedHmac = token.slice(dotIndex + 1);

  const expiresAtMs = Number(expiresAtStr);
  if (!Number.isFinite(expiresAtMs)) return false;
  if (Date.now() > expiresAtMs) return false;

  const expectedHmac = createHmac('sha256', secret).update(`${AREA}:${expiresAtStr}`).digest('hex');

  // crypto.timingSafeEqual requires equal-length buffers.
  const a = Buffer.from(providedHmac);
  const b = Buffer.from(expectedHmac);
  if (a.length !== b.length) return false;

  return timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Validates the submitted PIN against KITCHEN_PIN environment variable.
 * If the env var is unset, rejects every input.
 */
export function verifyKitchenPin(pin: string): boolean {
  // An unset PIN must lock the dashboard, not open it. The previous code
  // fell back to a hardcoded default, which meant a missing env var silently
  // published customer data behind a guessable PIN.
  const configuredPin = process.env.KITCHEN_PIN;
  if (!configuredPin || configuredPin.trim() === '') {
    console.error('[kitchenAuth] KITCHEN_PIN is not set -- refusing all logins');
    return false;
  }
  return pin.trim() === configuredPin.trim();
}

/**
 * Checks if the current request has a valid kitchen session cookie.
 */
export function isKitchenAuthenticated(): boolean {
  try {
    const secret = getSecret();
    if (!secret) return false;

    const cookieStore = cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return false;

    return validateToken(token, secret);
  } catch {
    return false;
  }
}

/**
 * Sets the httpOnly kitchen auth cookie (12-hour duration).
 * Callers must ensure PIN was verified before calling this.
 */
export function setKitchenAuthCookie(): void {
  const secret = getSecret();
  if (!secret) {
    throw new Error('AUTH_SECRET is not configured; cannot issue session cookie');
  }

  const cookieStore = cookies();
  cookieStore.set(COOKIE_NAME, createToken(secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_S,
    path: '/',
  });
}
