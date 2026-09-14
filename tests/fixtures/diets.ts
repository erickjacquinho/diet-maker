/**
 * Deterministic diet documents shared by domain, application and adapter tests.
 * These fixtures deliberately do not read browser storage, the clock or random
 * sources; callers can clone and adapt them at the seam under test.
 */

import { createDecimalString } from '@/lib/domain/diets/diet-model';

export const tacoSnapshotFixture = {
  sourceType: 'SYSTEM_TACO' as const,
  sourceId: 'taco-arroz-tipo-1-cozido',
  sourceVersion: 'TACO-4.0',
  displayName: 'Arroz, tipo 1, cozido',
  description: 'Arroz branco cozido',
  measurementBasis: 'PER_100G' as const,
  foodState: 'COOKED' as const,
  referenceQuantity: createDecimalString('100'),
  referenceUnit: 'g' as const,
  referenceNutrients: {
    protein: createDecimalString('2.5'),
    carbs: createDecimalString('28.1'),
    fat: createDecimalString('0.2'),
    fiber: createDecimalString('1.6'),
    energyKcal: createDecimalString('128'),
  },
  prescribedQuantity: createDecimalString('100'),
  prescribedUnit: 'g' as const,
  prescribedNutrients: {
    protein: createDecimalString('2.5'),
    carbs: createDecimalString('28.1'),
    fat: createDecimalString('0.2'),
    fiber: createDecimalString('1.6'),
    energyKcal: createDecimalString('128'),
  },
  energySource: 'REFERENCE' as const,
  calculationVersion: 'taco-decimal-v1',
  conversionSnapshot: { schemaVersion: 1, conversions: [] },
  compositionSnapshot: {
    schemaVersion: 1,
    source: 'TACO',
    originalPreparation: 'cozido',
    normalizedPreparation: 'cozido',
  },
};

const simpleMeal = {
  id: 'meal-simple-breakfast',
  position: 0,
  name: 'Café da manhã',
  time: '08:00',
  options: [
    {
      id: 'option-simple-breakfast-primary',
      position: 0,
      label: 'Variação 1',
      countsTowardTotals: true,
      items: [
        {
          id: 'item-simple-rice',
          position: 0,
          role: 'PRIMARY' as const,
          name: 'Arroz, tipo 1, cozido',
          snapshot: tacoSnapshotFixture,
        },
      ],
    },
  ],
};

export const simpleDraftFixture = {
  draftId: 'draft-simple-a',
  contextKey: 'account-a|patient-a|nova',
  accountId: 'account-a',
  patientId: 'patient-a',
  routeDietId: 'nova',
  payloadSchemaVersion: 1,
  draftRevision: 3,
  state: 'EDITABLE' as const,
  createdAt: '2026-08-30T10:00:00.000Z',
  updatedAt: '2026-08-30T10:03:00.000Z',
  payload: {
    name: 'Plano simples',
    mode: 'SIMPLE' as const,
    weightReferenceKg: createDecimalString('64'),
    variations: [
      {
        id: 'variation-simple',
        position: 0,
        kind: 'SIMPLE' as const,
        name: 'Plano diário',
        inputMode: 'GRAMS' as const,
        assignedDays: [],
      targets: { protein: createDecimalString('120'), carbs: createDecimalString('180'), fat: createDecimalString('55'), energyKcal: createDecimalString('1655') },
        meals: [simpleMeal],
      },
    ],
  },
};

export const cycleDraftFixture = {
  ...simpleDraftFixture,
  draftId: 'draft-cycle-a',
  contextKey: 'account-a|patient-a|nova',
  payload: {
    ...simpleDraftFixture.payload,
    name: 'Ciclo semanal',
    mode: 'CARB_CYCLING' as const,
    variations: [
      {
        id: 'variation-high',
        position: 0,
        kind: 'HIGH' as const,
        name: 'Dia alto',
        inputMode: 'GRAMS' as const,
        assignedDays: ['MON', 'WED', 'FRI'] as const,
        targets: { protein: createDecimalString('125'), carbs: createDecimalString('240'), fat: createDecimalString('60'), energyKcal: createDecimalString('2000') },
        meals: [simpleMeal],
      },
      {
        id: 'variation-low',
        position: 1,
        kind: 'LOW' as const,
        name: 'Dia baixo',
        inputMode: 'G_PER_KG' as const,
        assignedDays: ['TUE', 'THU', 'SAT', 'SUN'] as const,
        targets: { protein: createDecimalString('125'), carbs: createDecimalString('100'), fat: createDecimalString('60'), energyKcal: createDecimalString('1440') },
        gPerKg: { protein: createDecimalString('1.95'), carbs: createDecimalString('1.56'), fat: createDecimalString('0.94') },
        meals: [],
      },
    ],
  },
};

export const mealWithAlternativeAndSubstituteFixture = {
  ...simpleMeal,
  id: 'meal-options',
  options: [
    ...simpleMeal.options,
    {
      id: 'option-simple-breakfast-alternative',
      position: 1,
      label: 'Variação 2',
      countsTowardTotals: false,
      items: [
        {
          id: 'item-simple-substitute',
          position: 0,
          role: 'SUBSTITUTE' as const,
          parentItemId: 'item-simple-rice',
          name: 'Batata inglesa, cozida',
          snapshot: { ...tacoSnapshotFixture, sourceId: 'taco-batata-cozida', displayName: 'Batata inglesa, cozida' },
        },
      ],
    },
  ],
};

export const activeDietFixture = {
  id: 'diet-active-a',
  accountId: 'account-a',
  patientId: 'patient-a',
  name: 'Prescrição vigente',
  mode: 'SIMPLE' as const,
  status: 'ACTIVE' as const,
  version: 2,
  weightReferenceKg: createDecimalString('64'),
  createdAt: '2026-08-28T09:00:00.000Z',
  updatedAt: '2026-08-30T10:03:00.000Z',
  activatedAt: '2026-08-30T10:03:00.000Z',
  supersededAt: null,
  variations: simpleDraftFixture.payload.variations,
};

export const historicalDietFixture = {
  ...activeDietFixture,
  id: 'diet-history-a',
  name: 'Prescrição histórica',
  status: 'SNAPSHOT' as const,
  version: 1,
  updatedAt: '2026-08-27T10:03:00.000Z',
  activatedAt: '2026-08-27T10:03:00.000Z',
  supersededAt: '2026-08-30T10:03:00.000Z',
};

export const incompatibleScopeFixture = {
  accountId: 'account-b',
  patientId: 'patient-b',
  routeDietId: activeDietFixture.id,
};

export const dietFixtures = {
  simpleDraft: simpleDraftFixture,
  cycleDraft: cycleDraftFixture,
  tacoSnapshot: tacoSnapshotFixture,
  activeDiet: activeDietFixture,
  historicalDiet: historicalDietFixture,
  mealWithAlternativeAndSubstitute: mealWithAlternativeAndSubstituteFixture,
  incompatibleScope: incompatibleScopeFixture,
} as const;
