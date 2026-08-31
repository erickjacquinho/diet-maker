/**
 * Dados sintéticos e imutáveis para os contratos da adequação de componentes.
 * Não representa registros clínicos nem deve ser persistido.
 */
export const componentAdequationFixtures = {
  nutrition: {
    available: { protein: 32.5, carbohydrates: 48, fat: 12, calories: 436 },
    zero: { protein: 0, carbohydrates: 0, fat: 0, calories: 0 },
    absent: { protein: null, carbohydrates: null, fat: null, calories: null },
  },
  labels: {
    long: "Refeição com nome deliberadamente longo para validar overflow sem perda de informação",
    empty: "Nenhum resultado encontrado",
  },
  search: {
    foods: ["Feijão carioca", "Arroz integral", "Abóbora japonesa"],
    recipes: ["Arroz com legumes", "Omelete de forno"],
    readyMeals: ["Café da manhã equilibrado", "Almoço vegetariano"],
  },
  history: {
    snapshotId: "synthetic-snapshot-001",
    patientId: "synthetic-patient-001",
    consultationDate: "2026-01-15",
    expanded: true,
  },
  states: ["empty", "loading", "error", "disabled", "readonly"] as const,
} as const;

export type ComponentAdequationFixtures = typeof componentAdequationFixtures;
