import { describe, expect, it } from 'vitest';
import { BackupApplicationError, parseBackupEnvelope } from '@/lib/application/backup-application';
import { createBackupEnvelope, createEmptyBackupFixture } from '../fixtures/backup';

function expectBackupError(action: () => unknown, code: BackupApplicationError['code']): void {
  try {
    action();
    throw new Error(`Expected ${code}`);
  } catch (error) {
    expect(error).toBeInstanceOf(BackupApplicationError);
    expect((error as BackupApplicationError).code).toBe(code);
  }
}

const localAccount = { accountId: 'local-account', schemaVersion: '4' } as const;

function normalizeLegacyEnvelope(envelope: ReturnType<typeof createBackupEnvelope>) {
  return {
    ...envelope,
    schemaVersion: '5',
    account: envelope.account.map((account) => ({ ...account, phone: account.phone ?? null })),
  };
}

describe('backup envelope validation', () => {
  it('accepts a complete snapshot and preserves all logical tables', () => {
    const envelope = createBackupEnvelope();
    expect(parseBackupEnvelope(JSON.stringify(envelope), localAccount)).toEqual(normalizeLegacyEnvelope(envelope));
  });

  it('keeps favorites and accepts older envelopes without them', () => {
    const envelope = createBackupEnvelope({ favorites: ['taco-arroz-cozido', 'food-custom'] });
    expect(parseBackupEnvelope(JSON.stringify(envelope), localAccount).favorites).toEqual(envelope.favorites);

    const { favorites: _favorites, ...legacyEnvelope } = envelope;
    expect(parseBackupEnvelope(JSON.stringify(legacyEnvelope), localAccount).favorites).toEqual([]);
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, favorites: [42] }), localAccount), 'BACKUP_FORMAT_INVALID');
  });

  it('accepts valid empty collections without creating domain defaults', () => {
    const envelope = createBackupEnvelope(createEmptyBackupFixture());
    const parsed = parseBackupEnvelope(JSON.stringify(envelope), localAccount);
    expect(parsed.account).toHaveLength(1);
    expect(parsed.patients).toEqual([]);
    expect(parsed.dietPlans).toEqual([]);
    expect(parsed.recipes).toEqual([]);
    expect(parsed.readyMeals).toEqual([]);
  });

  it('accepts nullable clinical circumference fields exported as null', () => {
    const envelope = createBackupEnvelope({
      bodyAssessments: [{
        ...createBackupEnvelope().bodyAssessments[0],
        leftArmCm: null,
        rightArmCm: null,
        leftDistalThighCm: null,
        rightDistalThighCm: null,
        leftCalfCm: null,
        rightCalfCm: null,
      }],
    });

    expect(parseBackupEnvelope(JSON.stringify(envelope), localAccount)).toEqual(normalizeLegacyEnvelope(envelope));
  });

  it('rejects malformed JSON, non-object JSON and incomplete envelopes', () => {
    expectBackupError(() => parseBackupEnvelope('', localAccount), 'BACKUP_FORMAT_INVALID');
    expectBackupError(() => parseBackupEnvelope('DROP TABLE accounts;', localAccount), 'BACKUP_FORMAT_INVALID');
    expectBackupError(() => parseBackupEnvelope('[]', localAccount), 'BACKUP_FORMAT_INVALID');
    const { patients: omittedPatients, ...incomplete } = createBackupEnvelope();
    void omittedPatients;
    expectBackupError(() => parseBackupEnvelope(JSON.stringify(incomplete), localAccount), 'BACKUP_FORMAT_INVALID');
  });

  it('rejects an unknown application or unsupported version before persistence', () => {
    expectBackupError(() => parseBackupEnvelope(JSON.stringify(createBackupEnvelope({})), { ...localAccount, accountId: 'other-account' }), 'BACKUP_APP_MISMATCH');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), appId: 'other-app' }), localAccount), 'BACKUP_APP_MISMATCH');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), formatVersion: 2 }), localAccount), 'BACKUP_VERSION_UNSUPPORTED');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), schemaVersion: '6' }), localAccount), 'BACKUP_VERSION_UNSUPPORTED');
  });

  it('rejects unknown envelope and row keys in format version one', () => {
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), futureField: true }), localAccount), 'BACKUP_FORMAT_INVALID');
    const withUnknownRow = createBackupEnvelope();
    const patient = { ...withUnknownRow.patients[0], futureField: true };
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...withUnknownRow, patients: [patient] }), localAccount), 'BACKUP_FORMAT_INVALID');
  });

  it('rejects invalid header and row types', () => {
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), exportedAt: 'not-a-date' }), localAccount), 'BACKUP_FORMAT_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), patients: {} }), localAccount), 'BACKUP_FORMAT_INVALID');
    const invalidPatient = { ...createBackupEnvelope().patients[0], age: '32' };
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...createBackupEnvelope(), patients: [invalidPatient] }), localAccount), 'BACKUP_FORMAT_INVALID');
  });

  it('rejects duplicate IDs and duplicate composite identities', () => {
    const envelope = createBackupEnvelope();
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, patients: [envelope.patients[0], envelope.patients[0]] }), localAccount), 'BACKUP_RELATION_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, bodyAssessments: [envelope.bodyAssessments[0], envelope.bodyAssessments[0]] }), localAccount), 'BACKUP_RELATION_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, nextFollowUps: [envelope.nextFollowUps[0], envelope.nextFollowUps[0]] }), localAccount), 'BACKUP_RELATION_INVALID');
  });

  it('rejects divergent account scopes, missing parents and invalid diet chains', () => {
    const envelope = createBackupEnvelope();
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, patients: [{ ...envelope.patients[0], accountId: 'other-account' }] }), localAccount), 'BACKUP_RELATION_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, bodyAssessments: [{ ...envelope.bodyAssessments[0], patientId: 'missing-patient' }] }), localAccount), 'BACKUP_RELATION_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, dietMeals: [{ ...envelope.dietMeals[0], variationId: 'missing-variation' }] }), localAccount), 'BACKUP_RELATION_INVALID');
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, dietItemSnapshots: [{ ...envelope.dietItemSnapshots[0], dietMealItemId: 'missing-item' }] }), localAccount), 'BACKUP_RELATION_INVALID');
  });

  it('rejects more than one active diet for a patient', () => {
    const envelope = createBackupEnvelope();
    const secondActive = { ...envelope.dietPlans[0], id: 'diet-active-duplicate' };
    expectBackupError(() => parseBackupEnvelope(JSON.stringify({ ...envelope, dietPlans: [...envelope.dietPlans, secondActive] }), localAccount), 'BACKUP_RELATION_INVALID');
  });
});
