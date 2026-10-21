CREATE TABLE IF NOT EXISTS banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  eyebrow text NOT NULL DEFAULT '',
  title text NOT NULL,
  subtitle text NOT NULL DEFAULT '',
  link_url text NOT NULL DEFAULT '#equipamentos',
  link_text text NOT NULL DEFAULT 'VER EQUIPAMENTOS & PREÇOS',
  image_filename text,
  badge_text text NOT NULL DEFAULT '',
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS banners_active_order_idx ON banners(active, sort_order, created_at DESC);
