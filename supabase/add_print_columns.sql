-- Kitchen print queue columns for the external ESC/POS bridge service.
-- Run this manually in the Supabase SQL Editor.
-- Do NOT execute programmatically — schema changes are always manual.

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS print_status TEXT NOT NULL DEFAULT 'none'
    CHECK (print_status IN ('none','pending','printing','printed','failed')),
  ADD COLUMN IF NOT EXISTS print_requested_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS print_completed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS print_attempts INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS print_error TEXT;

-- Lets the bridge subscribe to changes on this table via Supabase Realtime.
-- NOTE: This will error harmlessly if the table is already in the publication
-- (e.g. "relation 'orders' is already member of publication"). That's fine.
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
