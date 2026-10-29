import { describe, expect, it } from 'vitest';
import {
  parseCreatePatientRequest, parsePatientDto, parsePatientSearchRequest, parsePatientUpdateRequest,
} from '@/lib/contracts/patients';

const id = '11111111-1111-4111-8111-111111111111';

describe('patient contracts', () => {
  it('rejects client-controlled fields (mass assignment)', () => {
    for (const extra of ['accountId', 'version', 'displayCode', 'createdAt', 'archivedAt', 'id']) {
      expect(() => parseCreatePatientRequest({ id, patient: { name: 'A', [extra]: 'x' } })).toThrow();
    }
    expect(() => parseCreatePatientRequest({ id, patient: { name: 'A' }, accountId: id })).toThrow();
    expect(() => parsePatientUpdateRequest({ patient: { name: 'A' }, version: 3 })).toThrow();
  });

  it('requires a UUID for the stable ID and bounded search paging', () => {
    expect(() => parseCreatePatientRequest({ id: 'abc', patient: { name: 'A' } })).toThrow();
    expect(parseCreatePatientRequest({ id: id.toUpperCase(), patient: { name: 'A' } }).id).toBe(id);
    expect(() => parsePatientSearchRequest({ query: '', pageIndex: 0, pageSize: 500 })).toThrow();
    expect(() => parsePatientSearchRequest({ query: '', pageIndex: -1, pageSize: 10 })).toThrow();
  });

  it('drops internal fields from the output DTO', () => {
    const dto = parsePatientDto({
      id, displayCode: 'P-0001', name: 'A', gender: 'F', defaultMacroTargets: {}, createdAt: 'x', updatedAt: 'x',
      version: 1, accountId: 'secret', sensitive: Buffer.alloc(3), sensitive_key_version: 1,
    });
    expect(JSON.stringify(dto)).not.toMatch(/accountId|secret|sensitive/);
  });
});
