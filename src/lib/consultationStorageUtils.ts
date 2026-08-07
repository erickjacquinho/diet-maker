import { calculatePresetCalories } from './presetUtils';
import type {
  BodyAssessment,
  ConsultationRecord,
  HistoricalDiet,
} from './patientsStore';

const PATIENT_DIETS_KEY_PREFIX = 'nutridiet_diets_';

export function normalizeDateKey(value: string): string {
  const decoded = decodeURIComponent(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(decoded)) return decoded;

  const parts = decoded.split(/[/-]/).map((part) => part.trim());
  if (parts.length !== 3) return decoded;

  const [first, second, third] = parts;
  if (third.length === 4) {
    return `${third}-${second.padStart(2, '0')}-${first.padStart(2, '0')}`;
  }

  return decoded;
}

export function normalizePairedBodyMeasurements(assessment: BodyAssessment): BodyAssessment {
  const normalized = { ...assessment };
  const pairs: Array<[keyof BodyAssessment, keyof BodyAssessment]> = [
    ['leftArmCm', 'rightArmCm'],
    ['leftProximalThighCm', 'rightProximalThighCm'],
    ['leftDistalThighCm', 'rightDistalThighCm'],
    ['leftCalfCm', 'rightCalfCm'],
  ];

  for (const [leftKey, rightKey] of pairs) {
    const leftVal = normalized[leftKey] as number | undefined;
    const rightVal = normalized[rightKey] as number | undefined;

    const hasLeft = leftVal !== undefined && !Number.isNaN(leftVal) && leftVal > 0;
    const hasRight = rightVal !== undefined && !Number.isNaN(rightVal) && rightVal > 0;

    if (hasLeft && !hasRight) {
      (normalized[rightKey] as number) = leftVal;
    } else if (!hasLeft && hasRight) {
      (normalized[leftKey] as number) = rightVal;
    }
  }

  return normalized;
}

export function getConsultationRecordHelper(
  patientId: string,
  rawDateParam: string,
  getPatientAssessmentsFromStorage: (id: string) => BodyAssessment[],
): ConsultationRecord {
  const normalizedDate = decodeURIComponent(rawDateParam).replace(/-/g, '/');

  let diet: HistoricalDiet | undefined = undefined;
  let assessment: BodyAssessment | undefined = undefined;

  if (typeof window !== 'undefined') {
    try {
      const savedDietsRaw = localStorage.getItem(`${PATIENT_DIETS_KEY_PREFIX}${patientId}`);
      if (savedDietsRaw) {
        const savedDiets = JSON.parse(savedDietsRaw);
        const match = savedDiets.find((d: any) => d.createdAt === normalizedDate || d.updatedAt === normalizedDate);
        if (match) {
          const simpleMeals = match.simpleMeals || [];
          const meals = simpleMeals.map((m: any) => {
            const items = m.items || [];
            const p = Math.round(items.reduce((a: number, i: any) => a + (Number(i.protein) || 0), 0) * 10) / 10;
            const c = Math.round(items.reduce((a: number, i: any) => a + (Number(i.carbs) || 0), 0) * 10) / 10;
            const f = Math.round(items.reduce((a: number, i: any) => a + (Number(i.fats) || 0), 0) * 10) / 10;
            const kcal = calculatePresetCalories(p, c, f);
            const itemsSummary = items.length > 0
              ? items.map((i: any) => `${i.name} (${i.quantityGrams}g)`).join(', ')
              : undefined;

            return {
              name: m.name || 'Refeição',
              time: m.time || '00:00',
              kcal,
              proteinG: p,
              carbsG: c,
              fatsG: f,
              itemsSummary,
            };
          });

          const totalProteinG = Math.round(meals.reduce((acc: number, m: any) => acc + m.proteinG, 0) * 10) / 10;
          const totalCarbsG = Math.round(meals.reduce((acc: number, m: any) => acc + m.carbsG, 0) * 10) / 10;
          const totalFatsG = Math.round(meals.reduce((acc: number, m: any) => acc + m.fatsG, 0) * 10) / 10;
          const totalKcal = calculatePresetCalories(totalProteinG, totalCarbsG, totalFatsG);

          diet = {
            id: match.id,
            name: match.name || 'Prescrição Alimentar',
            date: normalizedDate,
            targetKcal: totalKcal || Number(match.simpleTargetKcal) || 0,
            proteinG: totalProteinG || Number(match.simpleTargetProtein) || 0,
            carbsG: totalCarbsG || Number(match.simpleTargetCarbs) || 0,
            fatsG: totalFatsG || Number(match.simpleTargetFats) || 0,
            status: 'Ativa',
            meals,
          };
        }
      }

      const savedAssessments = getPatientAssessmentsFromStorage(patientId);
      assessment = savedAssessments.find(
        (item) => normalizeDateKey(item.date) === normalizeDateKey(rawDateParam),
      );
    } catch {
      // Ignore JSON parse errors
    }
  }

  return {
    date: normalizedDate,
    diet,
    assessment,
    notes: 'Sem observações registradas para esta consulta.',
    prescribedSupplements: [],
  };
}
