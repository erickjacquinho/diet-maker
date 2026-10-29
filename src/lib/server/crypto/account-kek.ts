import 'server-only';

import { createSecretKey, timingSafeEqual, type KeyObject } from 'node:crypto';

const activeIdPattern = /^v[1-9][0-9]{0,3}$/;
const versionVariablePattern = /^ACCOUNT_KEK_(v[1-9][0-9]{0,3})$/i;
const keyBytes = 32;

function decodeCanonical(value: string | undefined): Buffer | undefined {
  if (!value) return undefined;
  const bytes = Buffer.from(value, 'base64');
  return bytes.length === keyBytes && bytes.toString('base64') === value ? bytes : undefined;
}

export function loadAccountKeyring(env: Readonly<Record<string, string | undefined>> = process.env): {
  activeId: string;
  keys: ReadonlyMap<string, KeyObject>;
} {
  const activeId = env.ACCOUNT_KEK_ACTIVE_ID;
  if (!activeId || !activeIdPattern.test(activeId)) {
    throw new Error('ACCOUNT_KEK_ACTIVE_ID must name a key version such as v1.');
  }
  const activeName = `ACCOUNT_KEK_${activeId.toUpperCase()}`;
  if (!env[activeName]) throw new Error(`${activeName} is required.`);

  const master = decodeCanonical(env.SERVER_MASTER_KEY);
  const keys = new Map<string, KeyObject>();
  for (const name of Object.keys(env).sort()) {
    const match = versionVariablePattern.exec(name);
    if (!match) continue;
    const bytes = decodeCanonical(env[name]);
    if (!bytes) throw new Error(`${name} must be 32 bytes encoded as canonical base64.`);
    if (master && timingSafeEqual(bytes, master)) throw new Error(`${name} must differ from SERVER_MASTER_KEY.`);
    keys.set(match[1].toLowerCase(), createSecretKey(bytes));
  }
  return { activeId, keys };
}
