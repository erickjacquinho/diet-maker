import { describe, expect, it } from 'vitest';
import type { PatientViewModel } from '@/lib/patientViewModel';
import { buildPatientListRows, filterPatients } from '@/lib/patientListView';

function createFixture(size: number): PatientViewModel[] {
  return Array.from({ length: size }, (_, index) => ({
    id: `performance-patient-${index}`,
    accountId: 'performance-account',
    version: 1,
    archivedAt: null,
    code: `P-${String(index + 1).padStart(4, '0')}`,
    name: `Paciente ${String(index).padStart(4, '0')}`,
    age: 30,
    gender: 'Não informado',
    heightCm: 170,
    weightKg: 70,
    targetKcal: 2000,
    targetProtein: 140,
    targetCarbs: 220,
    targetFats: 60,
    objective: index % 2 === 0 ? 'Manutenção' : 'Cutting',
    lastConsultation: '',
    initials: 'PA',
    nextEvent: null,
    lastActivity: null,
  }));
}

describe('patient flow performance fixture', () => {
  it('lists and filters hundreds of patients under the one-second target', () => {
    const patients = createFixture(500);
    const start = performance.now();
    const filtered = filterPatients(patients, 'Paciente 04');
    const rows = buildPatientListRows(filtered, '2026-08-30');
    const elapsedMs = performance.now() - start;

    console.info(`[patient-flow-performance] 500 pacientes: ${elapsedMs.toFixed(2)}ms`);
    expect(rows.length).toBeGreaterThan(0);
    expect(elapsedMs).toBeLessThan(1000);
  });
});
