import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPatientsFromStorage,
  savePatientToStorage,
  getPatientById,
  updatePatientInStorage,
  deletePatientFromStorage,
  getPatientAssessmentsFromStorage,
  savePatientAssessmentToStorage,
  recordPatientActivity,
  Patient,
} from '../patientsStore';

describe('Patient Domain Seam: patientsStore', () => {
  beforeEach(() => { localStorage.clear(); });
  it('returns empty array when localStorage is empty', () => {
    expect(getPatientsFromStorage()).toEqual([]);
  });
  it('saves a new patient and generates correct initials and id', () => {
    const saved = savePatientToStorage({
      name: 'Maria Silva', age: 32, gender: 'Feminino', heightCm: 165, weightKg: 62,
      targetKcal: 1800, targetProtein: 110, targetCarbs: 200, targetFats: 50, objective: 'Emagrecimento',
    });
    expect(saved.id).toMatch(/^pat-\d+.*$/);
    expect(saved.initials).toBe('MS');
    expect(saved.name).toBe('Maria Silva');
    expect(saved.lastConsultation).toBeDefined();
    expect(getPatientsFromStorage()).toEqual([saved]);
  });
  it('generates initials for single-word names', () => {
    const saved = savePatientToStorage({
      name: 'Leonardo', age: 28, gender: 'Masculino', heightCm: 178, weightKg: 75,
      targetKcal: 2200, targetProtein: 140, targetCarbs: 250, targetFats: 65, objective: 'Hipertrofia',
    });
    expect(saved.initials).toBe('LE');
  });
  it('retrieves patient by ID correctly', () => {
    const created = savePatientToStorage({
      name: 'Ana Costa', age: 45, gender: 'Feminino', heightCm: 160, weightKg: 58,
      targetKcal: 1600, targetProtein: 95, targetCarbs: 180, targetFats: 45, objective: 'Manutenção',
    });
    expect(getPatientById(created.id)).toEqual(created);
    expect(getPatientById('non-existent-id')).toBeNull();
  });
  it('updates an existing patient and updates initials if name changed', () => {
    const created = savePatientToStorage({
      name: 'Carlos Eduardo', age: 30, gender: 'Masculino', heightCm: 180, weightKg: 85,
      targetKcal: 2400, targetProtein: 160, targetCarbs: 260, targetFats: 70, objective: 'Hipertrofia',
    });
    const result = updatePatientInStorage({ ...created, name: 'Carlos Eduardo Santos', weightKg: 83 });
    expect(result.initials).toBe('CS');
    expect(result.weightKg).toBe(83);
    expect(getPatientById(created.id)?.initials).toBe('CS');
    expect(getPatientById(created.id)?.weightKg).toBe(83);
  });
  it('deletes a patient from storage', () => {
    const p1 = savePatientToStorage({
      name: 'Paciente Um', age: 25, gender: 'Feminino', heightCm: 160, weightKg: 55,
      targetKcal: 1500, targetProtein: 90, targetCarbs: 160, targetFats: 45, objective: 'Saúde',
    });
    const p2 = savePatientToStorage({
      name: 'Paciente Dois', age: 30, gender: 'Masculino', heightCm: 175, weightKg: 70,
      targetKcal: 2000, targetProtein: 120, targetCarbs: 220, targetFats: 60, objective: 'Manutenção',
    });
    deletePatientFromStorage(p1.id);
    expect(getPatientsFromStorage()).toHaveLength(1);
    expect(getPatientsFromStorage()[0].id).toBe(p2.id);
  });
  it('keeps next event backward compatible and persists last clinical activity', () => {
    const saved = savePatientToStorage({
      name: 'Paciente Agenda', age: 34, gender: 'Feminino', heightCm: 168, weightKg: 70,
      targetKcal: 1900, targetProtein: 120, targetCarbs: 210, targetFats: 60, objective: 'Manutenção',
    });
    expect(saved.nextEvent).toBeNull();
    expect(saved.lastActivity).toBeNull();
    const updated = updatePatientInStorage({ ...saved, nextEvent: { date: '2026-08-20', type: 'assessment-update' } });
    expect(getPatientById(updated.id)?.nextEvent).toEqual({ date: '2026-08-20', type: 'assessment-update' });
    expect(recordPatientActivity(updated.id, 'diet', '2026-08-03T12:00:00.000Z')?.lastActivity).toEqual({
      at: '2026-08-03T12:00:00.000Z', type: 'diet',
    });
  });
  it('persists physical assessments and updates the patient activity source', () => {
    const saved = savePatientToStorage({
      name: 'Paciente Avaliação', age: 41, gender: 'Masculino', heightCm: 180, weightKg: 86,
      targetKcal: 2300, targetProtein: 160, targetCarbs: 250, targetFats: 70, objective: 'Hipertrofia',
    });
    const assessment = {
      id: 'assessment-1', date: '2026-08-03', weightKg: 85, bodyFatPercent: 18, muscleMassKg: 42, waistCm: 84,
    };
    expect(savePatientAssessmentToStorage(saved.id, assessment)).toEqual([assessment]);
    expect(getPatientAssessmentsFromStorage(saved.id)).toEqual([assessment]);
    expect(getPatientById(saved.id)?.lastActivity?.type).toBe('assessment');
  });
});
