import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({ poolOptions: [] as Array<Record<string, unknown>> }));

vi.mock('server-only', () => ({}));
vi.mock('drizzle-orm/node-postgres', () => ({ drizzle: vi.fn(() => ({})) }));
vi.mock('pg', () => ({
  Pool: class {
    constructor(options: Record<string, unknown>) {
      mocks.poolOptions.push(options);
    }

    async end() {}
  },
}));

import { closeOnlineDatabase, getOnlineDatabase } from '../../src/lib/server/online-db/client';

describe('online database TLS configuration', () => {
  beforeEach(() => {
    mocks.poolOptions.length = 0;
    vi.stubEnv('ONLINE_DATABASE_URL', 'postgresql://online_runtime@pooler.example.com:6543/postgres');
    vi.stubEnv('ONLINE_DATABASE_SSL_CA_B64', '');
  });

  afterEach(async () => {
    await closeOnlineDatabase();
    vi.unstubAllEnvs();
  });

  it('requires a valid CA for remote Postgres and enables certificate verification', () => {
    expect(() => getOnlineDatabase()).toThrow(/ONLINE_DATABASE_SSL_CA_B64/);
    expect(mocks.poolOptions).toHaveLength(0);

    vi.stubEnv('ONLINE_DATABASE_SSL_CA_B64', 'not-base64');
    expect(() => getOnlineDatabase()).toThrow(/ONLINE_DATABASE_SSL_CA_B64/);
    expect(mocks.poolOptions).toHaveLength(0);

    const pem = '-----BEGIN CERTIFICATE-----\nZmFrZQ==\n-----END CERTIFICATE-----\n';
    vi.stubEnv('ONLINE_DATABASE_SSL_CA_B64', Buffer.from(pem).toString('base64'));
    getOnlineDatabase();

    expect(mocks.poolOptions[0].ssl).toEqual({
      ca: Buffer.from(pem),
      rejectUnauthorized: true,
    });
  });

  it('keeps local Supabase connections on the existing non-TLS path', () => {
    vi.stubEnv('ONLINE_DATABASE_URL', 'postgresql://online_runtime@127.0.0.1:54322/postgres');
    getOnlineDatabase();
    expect(mocks.poolOptions[0].ssl).toBe(false);
  });
});
