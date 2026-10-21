import { Pool } from 'pg';

const supabaseUrl = 'postgresql://postgres:Arino%402000421@db.hpaysycuyoeehvrzrdlv.supabase.co:5432/postgres';
const pool = new Pool({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });

async function inspect() {
  console.log('--- Inspecting Old Equipment on Supabase ---');

  const oldEq = (await pool.query(`
    SELECT id, name, category, photo_filename, created_at 
    FROM equipment 
    WHERE photo_filename IS NULL OR photo_filename = ''
    ORDER BY name
  `)).rows;

  console.log(`Found ${oldEq.length} old equipment items without photo:`);
  for (const eq of oldEq) {
    console.log(` - [${eq.id}] ${eq.name} (${eq.category})`);
  }

  const oldEqIds = oldEq.map(e => e.id);

  if (oldEqIds.length === 0) {
    console.log('No old equipment found!');
    await pool.end();
    return;
  }

  const units = (await pool.query(`
    SELECT u.id, u.equipment_id, u.code, e.name 
    FROM units u
    JOIN equipment e ON u.equipment_id = e.id
    WHERE e.id = ANY($1)
  `, [oldEqIds])).rows;
  console.log(`Found ${units.length} units linked to old equipment.`);

  const unitIds = units.map(u => u.id);

  let reservations = [];
  if (unitIds.length > 0) {
    reservations = (await pool.query(`
      SELECT r.id, r.unit_id, r.status, r.created_at
      FROM reservations r
      WHERE r.unit_id = ANY($1)
    `, [unitIds])).rows;
  }
  console.log(`Found ${reservations.length} reservations linked to units of old equipment.`);

  const resIds = reservations.map(r => r.id);
  let historyCount = 0;
  if (resIds.length > 0) {
    const histRes = await pool.query(`
      SELECT count(*) FROM reservation_history WHERE reservation_id = ANY($1)
    `, [resIds]);
    historyCount = parseInt(histRes.rows[0].count, 10);
  }
  console.log(`Found ${historyCount} reservation_history rows.`);

  const newEq = (await pool.query(`
    SELECT id, name, photo_filename FROM equipment 
    WHERE photo_filename IS NOT NULL AND photo_filename != ''
    ORDER BY name
  `)).rows;
  console.log(`\nNew equipment with photos that WILL BE PRESERVED: ${newEq.length}`);
  for (const eq of newEq) {
    console.log(` + [${eq.id}] ${eq.name} -> ${eq.photo_filename}`);
  }

  await pool.end();
}

inspect().catch(err => {
  console.error(err);
  process.exit(1);
});
