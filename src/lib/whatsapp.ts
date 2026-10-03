import { getItemGrams, getItemMacros, type DietMeal, type FullDietPlan } from './legacy-diet-types';
import { calculateMealTotals } from './macroCalculations';
import { projectMealGroups, type ActiveMealVariationIds } from './mealVariations';
import { formatDateOnly, serializeDateOnly } from './date-only';

const BRAZIL_COUNTRY_CODE = '55';
const MAX_LOCAL_DIGITS = 11;

export interface WhatsAppDietExportOptions {
  includeNutrition: boolean;
  includeMealTimes: boolean;
  selectedVariationIds: string[];
}

export function buildDietWhatsAppText(
  patientName: string,
  dietPlan: FullDietPlan,
  currentMeals: DietMeal[],
  currentTotals: { kcal: number },
  options: WhatsAppDietExportOptions,
  activeMealVariationIds: ActiveMealVariationIds = {},
): string {
  let msg = `*Plano Alimentar - ${patientName}*\nPrescrito: ${formatDateOnly(serializeDateOnly(new Date()))}\n\n`;
  const sections = dietPlan.mode === 'carb_cycling'
    ? dietPlan.carbCyclingVariations
      .filter((variation) => options.selectedVariationIds.includes(variation.id))
      .map((variation) => {
        const meals = projectMealGroups(variation.meals, 'carb_cycling', variation.id, activeMealVariationIds);
        return { name: variation.name, meals, totalKcal: calculateMealTotals(meals.flatMap((meal) => meal.items)).kcal };
      })
    : [{ name: '', meals: currentMeals, totalKcal: currentTotals.kcal }];

  sections.forEach((section) => {
    if (section.name) msg += `*${section.name}*\n`;
    section.meals.forEach((meal) => {
      const mealTotals = options.includeNutrition
        ? meal.items.reduce((totals, item) => {
          const macros = getItemMacros(item);
          return {
            protein: totals.protein + macros.protein,
            carbs: totals.carbs + macros.carbs,
            fats: totals.fats + macros.fats,
            kcal: totals.kcal + macros.kcal,
          };
        }, { protein: 0, carbs: 0, fats: 0, kcal: 0 })
        : null;
      msg += `*${meal.name}${options.includeMealTimes && meal.time ? ` (${meal.time})` : ''}${mealTotals ? ` | Carbo: ${Math.round(mealTotals.carbs)}g` : ''}*\n`;
      meal.items.forEach((item) => {
        msg += `• ${item.name} (${getItemGrams(item)}g)\n`;
      });
      if (mealTotals) {
        msg += `*Totais da refeição:* P: ${Math.round(mealTotals.protein)}g | G: ${Math.round(mealTotals.fats)}g | ${Math.round(mealTotals.kcal)} kcal\n`;
      }
      msg += '\n';
    });
    if (options.includeNutrition) {
      msg += `*Total do dia${section.name ? ` - ${section.name}` : ''}:* ${Math.round(section.totalKcal)} kcal\n\n`;
    }
  });
  return msg;
}

function getDigits(value: string | undefined): string {
  return value?.replace(/\D/g, '') ?? '';
}

function getLocalDigits(value: string | undefined): string {
  const digits = getDigits(value);
  const withoutCountryCode = digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length > MAX_LOCAL_DIGITS
    ? digits.slice(BRAZIL_COUNTRY_CODE.length)
    : digits;

  return withoutCountryCode.slice(0, MAX_LOCAL_DIGITS);
}

function getWhatsappPhoneNumber(value: string | undefined): string | null {
  const digits = getDigits(value);
  const localDigits = digits.startsWith(BRAZIL_COUNTRY_CODE) && digits.length > MAX_LOCAL_DIGITS
    ? digits.slice(BRAZIL_COUNTRY_CODE.length)
    : digits;

  if (localDigits.length !== 10 && localDigits.length !== 11) {
    return null;
  }

  return `${BRAZIL_COUNTRY_CODE}${localDigits}`;
}

/**
 * Formats a Brazilian WhatsApp number while the user types.
 * The visible value intentionally stays local; the country code is added when opening WhatsApp.
 */
export function formatWhatsappContact(value: string | undefined): string {
  const localDigits = getLocalDigits(value);
  if (!localDigits) return '';

  if (localDigits.length <= 2) {
    return `(${localDigits}`;
  }

  const areaCode = localDigits.slice(0, 2);
  const subscriber = localDigits.slice(2);
  const prefixLength = localDigits.length > 10 ? 5 : 4;
  const prefix = subscriber.slice(0, prefixLength);
  const suffix = subscriber.slice(prefixLength);

  return `(${areaCode}) ${prefix}${suffix ? `-${suffix}` : ''}`;
}

/**
 * Returns a direct WhatsApp Web URL for a valid Brazilian landline or mobile number.
 * Accepts both local numbers and values that already include country code 55.
 */
export function getWhatsappUrl(value: string | undefined): string | null {
  const phoneNumber = getWhatsappPhoneNumber(value);
  return phoneNumber ? `https://web.whatsapp.com/send?phone=${phoneNumber}` : null;
}
