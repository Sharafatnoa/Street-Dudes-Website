/**
 * IP-based rate limiting for PIN authentication endpoints.
 *
 * Backed by the Supabase `auth_attempts` table so the counters survive
 * across serverless function instances (Vercel cold starts / multi-instance).
 *
 * Trade-off: if the database lookup itself errors (e.g. transient network
 * issue), we log the error and ALLOW the attempt through. Availability is
 * prioritised over the rate limit because the PIN check itself still applies,
 * and locking staff out of the kitchen mid-service is worse than temporarily
 * losing rate protection.
 */

import { getServerClient } from '@/lib/supabase';

const MAX_ATTEMPTS = 10;
const WINDOW_MINUTES = 15;

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterMinutes: number };

/**
 * Extracts a stable caller identifier from the request.
 * On Vercel the real client IP is the first entry in x-forwarded-for.
 * If no IP can be determined we use the literal string 'unknown'.
 * NOTE: this shares one bucket across all unidentifiable callers, which is
 * deliberate — it is better to rate-limit an unidentifiable caller too
 * aggressively than not at all.
 */
export function getCallerIdentifier(req: Request): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const firstIp = xff.split(',')[0].trim();
    if (firstIp) return firstIp;
  }
  return 'unknown';
}

/**
 * Checks whether the caller has exceeded the rate limit.
 * Returns { allowed: true } or { allowed: false, retryAfterMinutes }.
 */
export async function checkRateLimit(
  identifier: string,
  area: 'kitchen' | 'admin',
): Promise<RateLimitResult> {
  try {
    const supabase = getServerClient();
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000).toISOString();

    const { count, error } = await supabase
      .from('auth_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('identifier', identifier)
      .eq('area', area)
      .eq('succeeded', false)
      .gte('attempted_at', windowStart);

    if (error) {
      // Trade-off: database hiccup should not lock staff out mid-service.
      // The PIN check still protects the endpoint; we only lose rate limiting.
      console.error('[rateLimit] Failed to query auth_attempts:', error);
      return { allowed: true };
    }

    if ((count ?? 0) >= MAX_ATTEMPTS) {
      return { allowed: false, retryAfterMinutes: WINDOW_MINUTES };
    }

    return { allowed: true };
  } catch (err) {
    console.error('[rateLimit] Unexpected error in checkRateLimit:', err);
    return { allowed: true };
  }
}

/**
 * Records an authentication attempt.
 */
export async function recordAttempt(
  identifier: string,
  area: 'kitchen' | 'admin',
  succeeded: boolean,
): Promise<void> {
  try {
    const supabase = getServerClient();

    await supabase.from('auth_attempts').insert({
      identifier,
      area,
      succeeded,
    });

    // On a successful login, clear prior failed rows for this identifier+area
    // so a legitimate user who mistyped a few times starts clean.
    if (succeeded) {
      await supabase
        .from('auth_attempts')
        .delete()
        .eq('identifier', identifier)
        .eq('area', area)
        .eq('succeeded', false);
    }
  } catch (err) {
    // Best-effort — do not break the auth flow over a logging failure.
    console.error('[rateLimit] Failed to record attempt:', err);
  }
}
