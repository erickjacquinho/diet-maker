import type { FoodItem } from '@/lib/tacoStore';

export interface CustomFoodFormData {
  name: string;
  portion: string;
  unit: string;
  preparo: string;
  category: string;
  proteinG: string;
  carbsG: string;
  fatsG: string;
  fiberG: string;
  isFavorite: boolean;
}

export interface CustomFoodPayload {
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fiberG: number;
  isFavorite: boolean;
}

export const UNITS = ['g', 'ml', 'un', 'scoop', 'fatia', 'colher (sopa)', 'colher (chá)', 'xícara', 'porção'];
export const CATEGORIES = [
  'Carnes, Pescados & Ovos',
  'Verduras & Legumes',
  'Frutas',
  'Cereais & Tubérculos',
  'Leguminosas',
  'Leite & Derivados',
  'Gorduras, Nozes & Sementes',
  'Doces, Bebidas & Processados',
  'Suplementos',
  'Manipulados & Produtos',
];

export const EMPTY_FORM: CustomFoodFormData = {
  name: '',
  portion: '',
  unit: 'g',
  preparo: 'inNatura',
  category: 'Suplementos',
  proteinG: '',
  carbsG: '',
  fatsG: '',
  fiberG: '',
  isFavorite: false,
};

export function formFromFood(food: FoodItem | null): CustomFoodFormData {
  if (!food) return { ...EMPTY_FORM };

  const match = food.name.match(/^(.*?)(?:\s*\((.*?)\))?$/);
  const cleanName = match?.[1]?.trim() || food.name;
  const portionMatch = match?.[2]?.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  const parsedUnit = portionMatch?.[2] || match?.[2] || 'g';

  return {
    name: cleanName,
    portion: portionMatch?.[1] || '',
    unit: UNITS.includes(parsedUnit) ? parsedUnit : 'g',
    preparo: food.preparo || 'Personalizado',
    category: CATEGORIES.includes(food.category) ? food.category : 'Suplementos',
    proteinG: String(food.proteinG ?? ''),
    carbsG: String(food.carbsG ?? ''),
    fatsG: String(food.fatsG ?? ''),
    fiberG: String(food.fiberG ?? ''),
    isFavorite: food.isFavorite || false,
  };
}
