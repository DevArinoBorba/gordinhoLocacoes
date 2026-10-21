import { readFile, readdir } from 'node:fs/promises';
import pg from 'pg';

try {
  process.loadEnvFile('.env');
} catch {}

const supabaseUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL;
if (!supabaseUrl) {
  console.error('Please define SUPABASE_DB_URL or DATABASE_URL in .env');
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString: supabaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function main() {
  const client = await pool.connect();
  try {
    console.log('Connected to Supabase. Applying migrations...');
    await client.query('BEGIN');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');

    const files = (await readdir('db/migrations')).filter((n) => n.endsWith('.sql')).sort();
    for (const name of files) {
      const already = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
      if (already.rowCount) {
        console.log(`Skipping already applied: ${name}`);
        continue;
      }
      const sql = await readFile(`db/migrations/${name}`, 'utf8');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      console.log(`✓ Applied migration: ${name}`);
    }

    await client.query('COMMIT');
    console.log('All migrations applied successfully to Supabase!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Migration error:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
