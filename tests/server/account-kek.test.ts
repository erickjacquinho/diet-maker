import { randomBytes } from 'node:crypto';
import { inspect } from 'node:util';
import { describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const material = () => randomBytes(32);
const b64 = (bytes: Buffer) => bytes.toString('base64');

async function load() {
  return import('@/lib/server/crypto/account-kek');
}

describe('loadAccountKeyring', () => {
  it.each([undefined, '', 'V1', 'v0', 'v10000', 'v01', 'latest'])('rejects ACCOUNT_KEK_ACTIVE_ID %j', async (activeId) => {
    const { loadAccountKeyring } = await load();
    const env: Record<string, string | undefined> = { ACCOUNT_KEK_V1: b64(material()) };
    if (activeId !== undefined) env.ACCOUNT_KEK_ACTIVE_ID = activeId;
    expect(() => loadAccountKeyring(env)).toThrow(new Error('ACCOUNT_KEK_ACTIVE_ID must name a key version such as v1.'));
  });

  it('names the missing active key variable', async () => {
    const { loadAccountKeyring } = await load();
    expect(() => loadAccountKeyring({ ACCOUNT_KEK_ACTIVE_ID: 'v2', ACCOUNT_KEK_V1: b64(material()) })).toThrow(
      new Error('ACCOUNT_KEK_V2 is required.'),
    );
  });

  it.each([
    ['not base64', '!!!not-base64!!!'],
    ['wrong length', b64(randomBytes(16))],
    ['non-canonical padding', b64(material()).replace(/=+$/, '') + '=='],
    ['url-safe alphabet', b64(Buffer.alloc(32, 0xfb)).replace(/\+/g, '-').replace(/\//g, '_')],
  ])('rejects a malformed value (%s) without echoing it', async (_label, value) => {
    const { loadAccountKeyring } = await load();
    let message = '';
    try {
      loadAccountKeyring({ ACCOUNT_KEK_ACTIVE_ID: 'v1', ACCOUNT_KEK_V1: value });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe('ACCOUNT_KEK_V1 must be 32 bytes encoded as canonical base64.');
    expect(message).not.toContain(value);
  });

  it('rejects material equal to SERVER_MASTER_KEY without echoing it', async () => {
    const { loadAccountKeyring } = await load();
    const shared = b64(material());
    let message = '';
    try {
      loadAccountKeyring({ ACCOUNT_KEK_ACTIVE_ID: 'v1', ACCOUNT_KEK_V1: shared, SERVER_MASTER_KEY: shared });
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toBe('ACCOUNT_KEK_V1 must differ from SERVER_MASTER_KEY.');
    expect(message).not.toContain(shared);
  });

  it('loads the active key and exposes the exact bytes only through the KeyObject', async () => {
    const { loadAccountKeyring } = await load();
    const bytes = material();
    const ring = loadAccountKeyring({
      ACCOUNT_KEK_ACTIVE_ID: 'v1',
      ACCOUNT_KEK_V1: b64(bytes),
      SERVER_MASTER_KEY: b64(material()),
    });
    expect(ring.activeId).toBe('v1');
    expect(Buffer.from(ring.keys.get('v1')!.export()).equals(bytes)).toBe(true);
    for (const rendered of [JSON.stringify(ring), inspect(ring, { depth: 6 })]) {
      expect(rendered).not.toContain(b64(bytes));
      expect(rendered).not.toContain(bytes.toString('hex'));
    }
  });

  it('loads every valid version and keeps the active one selected', async () => {
    const { loadAccountKeyring } = await load();
    const [one, two] = [material(), material()];
    const ring = loadAccountKeyring({
      ACCOUNT_KEK_ACTIVE_ID: 'v2',
      ACCOUNT_KEK_V1: b64(one),
      ACCOUNT_KEK_V2: b64(two),
    });
    expect(ring.activeId).toBe('v2');
    expect([...ring.keys.keys()].sort()).toEqual(['v1', 'v2']);
    expect(Buffer.from(ring.keys.get('v1')!.export()).equals(one)).toBe(true);
    expect(Buffer.from(ring.keys.get('v2')!.export()).equals(two)).toBe(true);
  });

  it('fails closed when a non-active version is malformed', async () => {
    const { loadAccountKeyring } = await load();
    expect(() =>
      loadAccountKeyring({ ACCOUNT_KEK_ACTIVE_ID: 'v2', ACCOUNT_KEK_V1: 'bad', ACCOUNT_KEK_V2: b64(material()) }),
    ).toThrow(new Error('ACCOUNT_KEK_V1 must be 32 bytes encoded as canonical base64.'));
  });

  it('does not read the environment when the module is imported', async () => {
    vi.resetModules();
    const reads: Array<string | symbol> = [];
    const original = process.env;
    process.env = new Proxy(original, {
      get(target, key, receiver) {
        reads.push(key);
        return Reflect.get(target, key, receiver);
      },
    });
    try {
      await import('@/lib/server/crypto/account-kek');
    } finally {
      process.env = original;
    }
    expect(reads.filter((key) => String(key).startsWith('ACCOUNT_KEK') || key === 'SERVER_MASTER_KEY')).toEqual([]);
  });
});
