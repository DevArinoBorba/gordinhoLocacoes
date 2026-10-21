ALTER TABLE reservations ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'admin' CHECK(source IN ('admin','public'));
ALTER TABLE reservations ADD COLUMN IF NOT EXISTS customer_snapshot jsonb;
CREATE INDEX IF NOT EXISTS reservations_public_created_idx ON reservations(created_at) WHERE source='public';
CREATE TABLE IF NOT EXISTS public_request_limits (key_hash text PRIMARY KEY, window_start timestamptz NOT NULL, attempts integer NOT NULL);
