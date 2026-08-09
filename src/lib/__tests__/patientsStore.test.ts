import { describe, it, expect, beforeEach } from 'vitest';
import {
  savePatientToStorage,
  getPatientById,
  getPatientsFromStorage,
  formatPatientCode,
} from '../patientsStore';

describe('patientsStore NanoID and Code formatting', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('formats patient code correctly with leading zeros', () => {
    expect(formatPatientCode(1)).toBe('P-0001');
    expect(formatPatientCode(42)).toBe('P-0042');
    expect(formatPatientCode(1234)).toBe('P-1234');
  });

  it('creates new patient with 8-character NanoID and medical record code P-0001', () => {
    const patient = savePatientToStorage({
      name: 'João Silva',
      age: 30,
      gender: 'Masculino',
      heightCm: 180,
      weightKg: 80,
      targetKcal: 2000,
      targetProtein: 150,
      targetCarbs: 200,
      targetFats: 60,
      objective: 'Cutting',
    });

    expect(patient.id).toBeDefined();
    expect(patient.id.length).toBe(8);
    expect(patient.code).toBe('P-0001');
  });

  it('retrieves patient by NanoID and by legacyId', () => {
    const created = savePatientToStorage({
      name: 'Maria Oliveira',
      age: 25,
      gender: 'Feminino',
      heightCm: 165,
      weightKg: 60,
      targetKcal: 1800,
      targetProtein: 120,
      targetCarbs: 180,
      targetFats: 50,
      objective: 'Manutenção',
    });

    // Lookup by NanoID
    const foundById = getPatientById(created.id);
    expect(foundById).not.toBeNull();
    expect(foundById?.name).toBe('Maria Oliveira');

    // Mock legacy migration scenario
    const mockLegacyPatients = [
      {
        ...created,
        id: 'pat-17182938123-x9f2',
      },
    ];
    localStorage.setItem('nutridiet_patients', JSON.stringify(mockLegacyPatients));

    const migratedPatients = getPatientsFromStorage();
    expect(migratedPatients[0].id).not.toBe('pat-17182938123-x9f2');
    expect(migratedPatients[0].legacyId).toBe('pat-17182938123-x9f2');

    // Lookup by legacy ID returns the migrated patient
    const foundByLegacy = getPatientById('pat-17182938123-x9f2');
    expect(foundByLegacy).not.toBeNull();
    expect(foundByLegacy?.name).toBe('Maria Oliveira');
  });
});
