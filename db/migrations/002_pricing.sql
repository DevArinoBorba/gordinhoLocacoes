ALTER TABLE equipment
  ADD COLUMN IF NOT EXISTS daily_rate numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS min_days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) NOT NULL DEFAULT 0.00;

ALTER TABLE reservations
  ADD COLUMN IF NOT EXISTS daily_rate numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS days integer NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS subtotal_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS freight_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS discount_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS deposit_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS total_amount numeric(10,2) NOT NULL DEFAULT 0.00,
  ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'pix' CHECK(payment_method IN ('pix','dinheiro','cartao_credito','cartao_debito','boleto','faturado')),
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending' CHECK(payment_status IN ('pending','paid','partial','waived'));
