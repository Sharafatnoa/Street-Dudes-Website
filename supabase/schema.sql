-- Config table: all dynamic values Yasha can change
-- without touching code
CREATE TABLE config (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  description TEXT NOT NULL
);

INSERT INTO config (key, value, description) VALUES
  ('delivery_radius_km',          '10',          'Maximum delivery distance in kilometres'),
  ('delivery_fee_kr',             '49',          'Standard delivery fee in Swedish kronor'),
  ('free_delivery_threshold_kr',  '400',         'Order value above which delivery is free'),
  ('min_order_kr',                '100',         'Minimum order amount in Swedish kronor'),
  ('estimated_delivery_mins',     '30',          'Estimated delivery time shown to customer'),
  ('is_open',                     'true',        'Whether online ordering is currently active'),
  ('restaurant_lat',              '57.7244832',  'Restaurant latitude coordinate'),
  ('restaurant_lng',              '12.9256065',  'Restaurant longitude coordinate');

-- Orders table: every customer order
CREATE TABLE orders (
  id               UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number     SERIAL      NOT NULL,
  created_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at       TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  status           TEXT        DEFAULT 'PENDING' NOT NULL,
  customer_name    TEXT        NOT NULL,
  customer_phone   TEXT        NOT NULL,
  fulfillment_type TEXT        NOT NULL,
  delivery_address TEXT,
  delivery_lat     FLOAT,
  delivery_lng     FLOAT,
  items            JSONB       NOT NULL,
  subtotal         INTEGER     NOT NULL,
  delivery_fee     INTEGER     DEFAULT 0 NOT NULL,
  total            INTEGER     NOT NULL,
  notes            TEXT
);

-- Allow Supabase Realtime to track all changes on orders
ALTER TABLE orders REPLICA IDENTITY FULL;

-- Row Level Security: anyone can place an order,
-- only the server key can read or update orders
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Customers can place orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Config is readable by anyone (no secrets stored there)
ALTER TABLE config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config is publicly readable"
  ON config FOR SELECT
  USING (true);
