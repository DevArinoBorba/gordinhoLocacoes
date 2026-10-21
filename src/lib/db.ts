import { Pool } from 'pg';
const globalDb = globalThis as unknown as { rentalPool?: Pool };
export function db() {
  if (!process.env.DATABASE_URL) throw new Error('Configure DATABASE_URL e execute a migração.');
  if (!globalDb.rentalPool) {
    const isRemote = process.env.DATABASE_URL.includes('supabase') || process.env.NODE_ENV === 'production';
    const sanitizedUrl = isRemote
      ? process.env.DATABASE_URL.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '')
      : process.env.DATABASE_URL;
    globalDb.rentalPool = new Pool({
      connectionString: sanitizedUrl,
      max: process.env.NODE_ENV === 'production' ? 3 : 10,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      ssl: isRemote ? { rejectUnauthorized: false } : undefined,
    });
  }
  return globalDb.rentalPool;
}
