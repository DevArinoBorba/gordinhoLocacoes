CREATE EXTENSION IF NOT EXISTS btree_gist;
CREATE TABLE equipment (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, description text NOT NULL DEFAULT '', category text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE units (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), equipment_id uuid NOT NULL REFERENCES equipment(id), code text NOT NULL UNIQUE, serial text NOT NULL DEFAULT '', state text NOT NULL DEFAULT 'available' CHECK(state IN ('available','maintenance','retired'))
);
CREATE TABLE customers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, document text NOT NULL UNIQUE, phone text NOT NULL, address text NOT NULL, whatsapp_consent boolean NOT NULL DEFAULT false,
 CHECK(document ~ '^(\d{11}|\d{14})$')
);
CREATE TABLE reservations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), request_id uuid NOT NULL UNIQUE, unit_id uuid NOT NULL REFERENCES units(id), customer_id uuid NOT NULL REFERENCES customers(id),
 starts_at timestamptz NOT NULL, ends_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','active','completed','cancelled')),
 notes text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), CHECK(ends_at > starts_at),
 CONSTRAINT no_unit_overlap EXCLUDE USING gist (unit_id WITH =, tstzrange(starts_at,ends_at,'[)') WITH &&) WHERE(status IN ('pending','confirmed','active','completed'))
);
CREATE INDEX reservations_customer_idx ON reservations(customer_id);
CREATE INDEX units_equipment_idx ON units(equipment_id);
CREATE TABLE notification_outbox (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), reservation_id uuid NOT NULL REFERENCES reservations(id), event text NOT NULL,
 status text NOT NULL DEFAULT 'disabled' CHECK(status IN ('disabled','pending','sent','failed')), attempts integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(), sent_at timestamptz, last_error text, UNIQUE(reservation_id,event)
);
CREATE TABLE reservation_history (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, reservation_id uuid NOT NULL REFERENCES reservations(id), previous_status text, next_status text NOT NULL, actor text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
