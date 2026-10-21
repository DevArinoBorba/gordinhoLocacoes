import { Pool } from 'pg';

try { process.loadEnvFile('.env'); } catch {}
const localUrl = process.env.DATABASE_URL || 'postgresql://locacoes:locacoes123@localhost:20000/locacoes';
const remoteUrl = 'postgresql://postgres.hpaysycuyoeehvrzrdlv:Arino%402000421@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

const localPool = new Pool({ connectionString: localUrl });
const remotePool = new Pool({ connectionString: remoteUrl, ssl: { rejectUnauthorized: false } });

async function migrate() {
  console.log('--- Ingressing Local Data to Supabase ---');

  // 1. Equipment
  console.log('Migrating equipment...');
  const equipment = (await localPool.query('SELECT * FROM equipment')).rows;
  for (const eq of equipment) {
    await remotePool.query(
      `INSERT INTO equipment (id, name, description, category, daily_rate, min_days, deposit_amount, photo_filename, ideal_for, included_items)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         description = EXCLUDED.description,
         category = EXCLUDED.category,
         daily_rate = EXCLUDED.daily_rate,
         min_days = EXCLUDED.min_days,
         deposit_amount = EXCLUDED.deposit_amount,
         photo_filename = EXCLUDED.photo_filename,
         ideal_for = EXCLUDED.ideal_for,
         included_items = EXCLUDED.included_items`,
      [
        eq.id,
        eq.name,
        eq.description,
        eq.category,
        eq.daily_rate,
        eq.min_days,
        eq.deposit_amount,
        eq.photo_filename,
        eq.ideal_for || '',
        eq.included_items || '',
      ]
    );
  }
  console.log(`✓ Equipment: ${equipment.length} rows migrated`);

  // 2. Units
  console.log('Migrating units...');
  const units = (await localPool.query('SELECT * FROM units')).rows;
  for (const u of units) {
    await remotePool.query(
      `INSERT INTO units (id, equipment_id, code, serial, state)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (id) DO UPDATE SET
         equipment_id = EXCLUDED.equipment_id,
         code = EXCLUDED.code,
         serial = EXCLUDED.serial,
         state = EXCLUDED.state`,
      [u.id, u.equipment_id, u.code, u.serial, u.state]
    );
  }
  console.log(`✓ Units: ${units.length} rows migrated`);

  // 3. Customers
  console.log('Migrating customers...');
  const customers = (await localPool.query('SELECT * FROM customers')).rows;
  for (const c of customers) {
    await remotePool.query(
      `INSERT INTO customers (id, name, document, phone, address, whatsapp_consent)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         document = EXCLUDED.document,
         phone = EXCLUDED.phone,
         address = EXCLUDED.address,
         whatsapp_consent = EXCLUDED.whatsapp_consent`,
      [c.id, c.name, c.document, c.phone, c.address, c.whatsapp_consent]
    );
  }
  console.log(`✓ Customers: ${customers.length} rows migrated`);

  // 4. Reservations
  console.log('Migrating reservations...');
  const reservations = (await localPool.query('SELECT * FROM reservations')).rows;
  for (const r of reservations) {
    await remotePool.query(
      `INSERT INTO reservations (id, request_id, unit_id, customer_id, starts_at, ends_at, status, notes, daily_rate, days, subtotal_amount, freight_amount, discount_amount, deposit_amount, total_amount, payment_method, payment_status, customer_snapshot, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
       ON CONFLICT (id) DO UPDATE SET
         request_id = EXCLUDED.request_id,
         unit_id = EXCLUDED.unit_id,
         customer_id = EXCLUDED.customer_id,
         starts_at = EXCLUDED.starts_at,
         ends_at = EXCLUDED.ends_at,
         status = EXCLUDED.status,
         notes = EXCLUDED.notes,
         daily_rate = EXCLUDED.daily_rate,
         days = EXCLUDED.days,
         subtotal_amount = EXCLUDED.subtotal_amount,
         freight_amount = EXCLUDED.freight_amount,
         discount_amount = EXCLUDED.discount_amount,
         deposit_amount = EXCLUDED.deposit_amount,
         total_amount = EXCLUDED.total_amount,
         payment_method = EXCLUDED.payment_method,
         payment_status = EXCLUDED.payment_status,
         customer_snapshot = EXCLUDED.customer_snapshot,
         created_at = EXCLUDED.created_at`,
      [
        r.id,
        r.request_id,
        r.unit_id,
        r.customer_id,
        r.starts_at,
        r.ends_at,
        r.status,
        r.notes,
        r.daily_rate,
        r.days,
        r.subtotal_amount,
        r.freight_amount,
        r.discount_amount,
        r.deposit_amount,
        r.total_amount,
        r.payment_method,
        r.payment_status,
        r.customer_snapshot ? JSON.stringify(r.customer_snapshot) : null,
        r.created_at,
      ]
    );
  }
  console.log(`✓ Reservations: ${reservations.length} rows migrated`);

  // 5. Reservation History
  console.log('Migrating reservation history...');
  const history = (await localPool.query('SELECT * FROM reservation_history')).rows;
  for (const h of history) {
    await remotePool.query(
      `INSERT INTO reservation_history (reservation_id, previous_status, next_status, actor, created_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [h.reservation_id, h.previous_status, h.next_status, h.actor, h.created_at]
    );
  }
  console.log(`✓ Reservation History: ${history.length} rows migrated`);

  // Final verification
  console.log('\n--- Remote Row Verification ---');
  for (const t of ['equipment', 'units', 'customers', 'reservations', 'reservation_history']) {
    const res = await remotePool.query(`SELECT count(*) FROM ${t}`);
    console.log(`Remote ${t}: ${res.rows[0].count} rows`);
  }

  await localPool.end();
  await remotePool.end();
  console.log('\nAll local data successfully synced to Supabase!');
}

migrate().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
