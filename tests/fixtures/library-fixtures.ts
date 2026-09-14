export const libraryAccounts = {
  primary: { id: 'account-a', displayName: 'Conta A' },
  secondary: { id: 'account-b', displayName: 'Conta B' },
} as const;

export const customFoodInput = {
  name: 'Iogurte proteico',
  description: 'Produto usado na fixture da biblioteca',
  brand: 'NutriLab',
  measurementBasis: 'PER_100G' as const,
  foodState: 'AS_SOLD' as const,
  servingReference: { quantity: '170', unit: 'g' as const },
  referenceNutrients: {
    protein: '10.25',
    carbs: '8.40',
    fat: '2.10',
    fiber: '0.00',
    energyKcal: '91',
  },
  energySource: 'REFERENCE' as const,
  calculationVersion: 'library-v1',
};

export const invalidCustomFoodInput = {
  ...customFoodInput,
  name: ' ',
  referenceNutrients: { ...customFoodInput.referenceNutrients, protein: 'NaN' },
};

export const recipeInput = {
  name: 'Café proteico',
  category: 'Café da Manhã',
  instructions: 'Misturar e servir.',
  yieldPortions: '2',
  ingredients: [],
};

export const readyMealInput = {
  name: 'Café da manhã padrão',
  description: 'Template de fixture',
  suggestedTime: '08:00',
  items: [],
};

export const legacyLibraryKeys = [
  'nutridiet_custom_foods',
  'nutridiet_recipes',
  'nutridiet_ready_meals',
] as const;
