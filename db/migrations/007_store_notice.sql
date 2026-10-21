CREATE TABLE IF NOT EXISTS store_notice (
  id integer PRIMARY KEY DEFAULT 1,
  enabled boolean NOT NULL DEFAULT true,
  message text NOT NULL DEFAULT 'Catálogo de demonstração · valores e condições sujeitos à confirmação',
  badge_text text NOT NULL DEFAULT 'DEMONSTRAÇÃO',
  link_url text,
  link_text text,
  variant text NOT NULL DEFAULT 'warning',
  animated boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

INSERT INTO store_notice (id, enabled, message, badge_text, link_url, link_text, variant, animated)
VALUES (
  1,
  true,
  'Catálogo de demonstração · valores e condições sujeitos à confirmação',
  'DEMONSTRAÇÃO',
  NULL,
  NULL,
  'warning',
  true
)
ON CONFLICT (id) DO NOTHING;
