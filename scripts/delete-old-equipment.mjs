import { Pool } from 'pg';

const supabaseUrl = 'postgresql://postgres:Arino%402000421@db.hpaysycuyoeehvrzrdlv.supabase.co:5432/postgres';
const pool = new Pool({ connectionString: supabaseUrl, ssl: { rejectUnauthorized: false } });

async function removeOldEquipment() {
  console.log('--- Removing Old Equipment Without Photos from Supabase ---');

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Identify old equipment IDs
    const oldEqRes = await client.query(`
      SELECT id, name, category 
      FROM equipment 
      WHERE photo_filename IS NULL OR photo_filename = ''
      ORDER BY name
    `);
    const oldEquipment = oldEqRes.rows;
    console.log(`Found ${oldEquipment.length} equipment items to remove:`);
    for (const eq of oldEquipment) {
      console.log(`  - [${eq.id}] ${eq.name}`);
    }

    if (oldEquipment.length === 0) {
      console.log('No equipment without photo found. Nothing to remove.');
      await client.query('ROLLBACK');
      return;
    }

    const oldEqIds = oldEquipment.map(e => e.id);

    // 2. Identify linked units
    const unitsRes = await client.query(`
      SELECT id FROM units WHERE equipment_id = ANY($1)
    `, [oldEqIds]);
    const unitIds = unitsRes.rows.map(u => u.id);
    console.log(`Found ${unitIds.length} units associated with old equipment.`);

    // 3. Identify linked reservations
    let resIds = [];
    if (unitIds.length > 0) {
      const reservationsRes = await client.query(`
        SELECT id FROM reservations WHERE unit_id = ANY($1)
      `, [unitIds]);
      resIds = reservationsRes.rows.map(r => r.id);
      console.log(`Found ${resIds.length} reservations associated with old equipment units.`);
    }

    // 4. Delete reservation_history
    if (resIds.length > 0) {
      const delHistRes = await client.query(`
        DELETE FROM reservation_history WHERE reservation_id = ANY($1)
      `, [resIds]);
      console.log(`Deleted ${delHistRes.rowCount} reservation_history rows.`);

      // 5. Delete reservations
      const delResRes = await client.query(`
        DELETE FROM reservations WHERE id = ANY($1)
      `, [resIds]);
      console.log(`Deleted ${delResRes.rowCount} reservations.`);
    }

    // 6. Delete units
    if (unitIds.length > 0) {
      const delUnitsRes = await client.query(`
        DELETE FROM units WHERE id = ANY($1)
      `, [unitIds]);
      console.log(`Deleted ${delUnitsRes.rowCount} units.`);
    }

    // 7. Delete equipment
    const delEqRes = await client.query(`
      DELETE FROM equipment WHERE id = ANY($1)
    `, [oldEqIds]);
    console.log(`Deleted ${delEqRes.rowCount} equipment items.`);

    await client.query('COMMIT');
    console.log('✓ Transaction committed successfully.');

    // 8. Verification
    const remainingRes = await client.query(`
      SELECT id, name, photo_filename FROM equipment ORDER BY name
    `);
    console.log(`\nRemaining equipment in database: ${remainingRes.rows.length}`);
    for (const eq of remainingRes.rows) {
      console.log(`  + [${eq.id}] ${eq.name} (photo: ${eq.photo_filename})`);
    }

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error during deletion, rolled back:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

removeOldEquipment().catch(err => {
  console.error('Process failed:', err);
  process.exit(1);
});
