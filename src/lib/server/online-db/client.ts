import 'server-only';

import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let pool: Pool | undefined;
let database: NodePgDatabase<typeof schema> | undefined;

export function getOnlineDatabase(): NodePgDatabase<typeof schema> {
  if (database) return database;

  const connectionString = process.env.ONLINE_DATABASE_URL;
  if (!connectionString) throw new Error('ONLINE_DATABASE_URL is required.');

  const url = new URL(connectionString);
  const local = ['127.0.0.1', 'localhost', '::1'].includes(url.hostname) && url.port === '54322';
  let ssl: boolean | { ca: Buffer; rejectUnauthorized: true } = false;
  if (!local) {
    const encodedCa = process.env.ONLINE_DATABASE_SSL_CA_B64;
    const ca = encodedCa ? Buffer.from(encodedCa, 'base64') : Buffer.alloc(0);
    if (
      !encodedCa
      || !ca.length
      || ca.toString('base64') !== encodedCa
      || !ca.toString('utf8').includes('-----BEGIN CERTIFICATE-----')
    ) {
      throw new Error('ONLINE_DATABASE_SSL_CA_B64 must be a base64-encoded PEM certificate for remote connections.');
    }
    ssl = { ca, rejectUnauthorized: true };
  }
  pool = new Pool({
    connectionString,
    max: 1,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 10_000,
    maxLifetimeSeconds: 300,
    ssl,
    application_name: 'diet-maker-server',
  });
  database = drizzle({ client: pool, schema });
  return database;
}

export async function closeOnlineDatabase(): Promise<void> {
  const currentPool = pool;
  pool = undefined;
  database = undefined;
  await currentPool?.end();
}
