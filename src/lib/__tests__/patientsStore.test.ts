import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPatientsFromStorage,
  savePatientToStorage,
  getPatientById,
  updatePatientInStorage,
  deletePatientFromStorage,
  Patient,
} from '../patientsStore';

describe('Patient Domain Seam: patientsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array when localStorage is empty', () => {
    const patients = getPatientsFromStorage();
    expect(patients).toEqual([]);
  });

  it('saves a new patient and generates correct initials and id', () => {
    const inputData = {
      name: 'Maria Silva',
      age: 32,
      gender: 'Feminino',
      heightCm: 165,
      weightKg: 62,
      targetKcal: 1800,
      targetProtein: 110,
      targetCarbs: 200,
      targetFats: 50,
      objective: 'Emagrecimento',
    };

    const saved = savePatientToStorage(inputData);

    expect(saved.id).toMatch(/^pat-\d+.*$/);
    expect(saved.initials).toBe('MS');
    expect(saved.name).toBe('Maria Silva');
    expect(saved.lastConsultation).toBeDefined();

    const inStorage = getPatientsFromStorage();
    expect(inStorage).toHaveLength(1);
    expect(inStorage[0]).toEqual(saved);
  });

  it('generates initials for single-word names', () => {
    const saved = savePatientToStorage({
      name: 'Leonardo',
      age: 28,
      gender: 'Masculino',
      heightCm: 178,
      weightKg: 75,
      targetKcal: 2200,
      targetProtein: 140,
      targetCarbs: 250,
      targetFats: 65,
      objective: 'Hipertrofia',
    });

    expect(saved.initials).toBe('LE');
  });

  it('retrieves patient by ID correctly', () => {
    const created = savePatientToStorage({
      name: 'Ana Costa',
      age: 45,
      gender: 'Feminino',
      heightCm: 160,
      weightKg: 58,
      targetKcal: 1600,
      targetProtein: 95,
      targetCarbs: 180,
      targetFats: 45,
      objective: 'Manutenção',
    });

    const found = getPatientById(created.id);
    expect(found).toEqual(created);

    const notFound = getPatientById('non-existent-id');
    expect(notFound).toBeNull();
  });

  it('updates an existing patient and updates initials if name changed', () => {
    const created = savePatientToStorage({
      name: 'Carlos Eduardo',
      age: 30,
      gender: 'Masculino',
      heightCm: 180,
      weightKg: 85,
      targetKcal: 2400,
      targetProtein: 160,
      targetCarbs: 260,
      targetFats: 70,
      objective: 'Hipertrofia',
    });

    const updatedData: Patient = {
      ...created,
      name: 'Carlos Eduardo Santos',
      weightKg: 83,
    };

    const result = updatePatientInStorage(updatedData);

    expect(result.initials).toBe('CS');
    expect(result.weightKg).toBe(83);

    const fetched = getPatientById(created.id);
    expect(fetched?.initials).toBe('CS');
    expect(fetched?.weightKg).toBe(83);
  });

  it('deletes a patient from storage', () => {
    const p1 = savePatientToStorage({
      name: 'Paciente Um',
      age: 25,
      gender: 'Feminino',
      heightCm: 160,
      weightKg: 55,
      targetKcal: 1500,
      targetProtein: 90,
      targetCarbs: 160,
      targetFats: 45,
      objective: 'Saúde',
    });

    const p2 = savePatientToStorage({
      name: 'Paciente Dois',
      age: 30,
      gender: 'Masculino',
      heightCm: 175,
      weightKg: 70,
      targetKcal: 2000,
      targetProtein: 120,
      targetCarbs: 220,
      targetFats: 60,
      objective: 'Manutenção',
    });

    deletePatientFromStorage(p1.id);

    const list = getPatientsFromStorage();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(p2.id);
  });
});
