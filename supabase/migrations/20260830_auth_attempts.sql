-- auth_attempts: tracks PIN login attempts for IP-based rate limiting.
-- Run this manually in the Supabase SQL Editor before deploying the auth changes.

CREATE TABLE IF NOT EXISTS auth_attempts (
  id BIGSERIAL PRIMARY KEY,
  identifier TEXT NOT NULL,
  area TEXT NOT NULL CHECK (area IN ('kitchen', 'admin')),
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  succeeded BOOLEAN NOT NULL
);

CREATE INDEX IF NOT EXISTS auth_attempts_lookup
  ON auth_attempts (identifier, area, attempted_at DESC);
