import { describe, expect, it } from 'vitest';
import {
  getPatientInitials,
  normalizePatientInput,
  validatePatientInput,
  assertPatientVersion,
  isPatientActive,
  type PatientInput,
} from '@/lib/domain/patient';
import { normalizeObjectiveLabel } from '@/lib/domain/objective-option';

const validInput: PatientInput = {
  name: ' Ana  Lima ',
  age: 32,
  gender: ' Feminino ',
  heightCm: 165,
  weightKg: 62,
  phone: '(11) 3333-4444',
  whatsapp: '(11) 99999-0000',
  currentObjective: ' Recomposição Corporal ',
  defaultMacroTargets: { proteinG: 110, carbsG: 200, fatsG: 55, kcal: 1755 },
};

describe('patient domain invariants', () => {
  it('normalizes textual fields, contacts and derives initials without persisting them', () => {
    const normalized = normalizePatientInput(validInput);

    expect(normalized.name).toBe('Ana Lima');
    expect(normalized.gender).toBe('Feminino');
    expect(normalized.phone).toBe('1133334444');
    expect(normalized.whatsapp).toBe('11999990000');
    expect(normalized.currentObjective).toBe('Recomposição Corporal');
    expect(getPatientInitials(normalized.name)).toBe('AL');
  });

  it('returns field findings for empty names, invalid dimensions and negative targets', () => {
    const result = validatePatientInput({
      ...validInput,
      name: '   ',
      age: -1,
      heightCm: 0,
      weightKg: -2,
      defaultMacroTargets: { proteinG: -1, carbsG: 0, fatsG: 0, kcal: 0 },
    });

    expect(result.valid).toBe(false);
    expect(result.fieldErrors).toEqual(expect.objectContaining({
      name: expect.any(String),
      age: expect.any(String),
      heightCm: expect.any(String),
      weightKg: expect.any(String),
      'defaultMacroTargets.proteinG': expect.any(String),
    }));
  });

  it('compares objective labels case-insensitively after trimming', () => {
    expect(normalizeObjectiveLabel('  PREPARAÇÃO para Maratona ')).toEqual({
      label: 'PREPARAÇÃO para Maratona',
      normalizedLabel: 'preparação para maratona',
    });
  });

  it('keeps archive state explicit and rejects stale versions', () => {
    const patient = { version: 4, archivedAt: null };

    expect(isPatientActive(patient)).toBe(true);
    expect(() => assertPatientVersion(patient, 4)).not.toThrow();
    expect(() => assertPatientVersion(patient, 3)).toThrow('versão');
    expect(isPatientActive({ archivedAt: '2026-08-30T00:00:00.000Z' })).toBe(false);
  });
});
