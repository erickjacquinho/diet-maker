'use client';

import tacoData from '@/data/taco_database.json';
import { getStorageItem, setStorageItem } from './storage';

export interface FoodItem {
  id: string;
  name: string;
  preparo: string;
  category: string;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  fatG?: number;
  fiberG: number;
  source: 'TACO' | 'CUSTOM';
  isFavorite: boolean;
  isCustom?: boolean;
}

const CUSTOM_FOODS_KEY = 'nutridiet_custom_foods';
const FAVORITES_KEY = 'nutridiet_favorite_foods';

export function getFavoritesFromStorage(): string[] {
  return getStorageItem<string[]>(FAVORITES_KEY, []);
}

export function getCustomFoodsFromStorage(): FoodItem[] {
  return getStorageItem<FoodItem[]>(CUSTOM_FOODS_KEY, []);
}

export function getAllFoods(): FoodItem[] {
  const favorites = new Set(getFavoritesFromStorage());
  const customFoods = getCustomFoodsFromStorage();

  const tacoFoods: FoodItem[] = tacoData.map((item) => ({
    ...item,
    preparo: item.preparo || 'inNatura',
    source: 'TACO' as const,
    isFavorite: favorites.has(item.id),
  }));

  const updatedCustomFoods: FoodItem[] = customFoods.map((item) => ({
    ...item,
    preparo: item.preparo || 'Personalizado',
    source: 'CUSTOM' as const,
    isFavorite: favorites.has(item.id),
  }));

  return [...tacoFoods, ...updatedCustomFoods];
}

export function toggleFavoriteFood(foodId: string): string[] {
  const favorites = new Set(getFavoritesFromStorage());
  if (favorites.has(foodId)) {
    favorites.delete(foodId);
  } else {
    favorites.add(foodId);
  }
  const result = Array.from(favorites);
  setStorageItem(FAVORITES_KEY, result);
  return result;
}

export function addCustomFood(newFood: Omit<FoodItem, 'id' | 'source'> & { isFavorite?: boolean }): FoodItem {
  const customFoods = getCustomFoodsFromStorage();
  const uniqueSuffix = Math.random().toString(36).substring(2, 7);
  const createdId = `custom-${Date.now()}-${uniqueSuffix}`;
  const isFav = newFood.isFavorite ?? false;
  const created: FoodItem = {
    ...newFood,
    preparo: newFood.preparo || 'Personalizado',
    id: createdId,
    source: 'CUSTOM',
    isFavorite: isFav,
  };
  const updated = [created, ...customFoods];
  setStorageItem(CUSTOM_FOODS_KEY, updated);
  if (isFav) {
    const favorites = new Set(getFavoritesFromStorage());
    favorites.add(createdId);
    setStorageItem(FAVORITES_KEY, Array.from(favorites));
  }
  return created;
}

export function updateCustomFood(
  foodId: string,
  updatedData: Partial<Omit<FoodItem, 'id' | 'source'>>
): FoodItem | null {
  const customFoods = getCustomFoodsFromStorage();
  const index = customFoods.findIndex((f) => f.id === foodId);
  if (index === -1) return null;

  const existing = customFoods[index];
  const updated: FoodItem = {
    ...existing,
    ...updatedData,
    source: 'CUSTOM',
    preparo: updatedData.preparo || existing.preparo || 'Personalizado',
  };

  customFoods[index] = updated;
  setStorageItem(CUSTOM_FOODS_KEY, customFoods);

  if (updatedData.isFavorite !== undefined) {
    const favorites = new Set(getFavoritesFromStorage());
    if (updatedData.isFavorite) {
      favorites.add(foodId);
    } else {
      favorites.delete(foodId);
    }
    setStorageItem(FAVORITES_KEY, Array.from(favorites));
  }

  return updated;
}

export function deleteCustomFood(foodId: string): boolean {
  const customFoods = getCustomFoodsFromStorage();
  const index = customFoods.findIndex((f) => f.id === foodId);
  if (index === -1) return false;

  const updated = customFoods.filter((f) => f.id !== foodId);
  setStorageItem(CUSTOM_FOODS_KEY, updated);
  const favorites = new Set(getFavoritesFromStorage());
  favorites.delete(foodId);
  setStorageItem(FAVORITES_KEY, Array.from(favorites));

  return true;
}

const STOP_WORDS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'em', 'com', 'sem', 'e', 'a', 'o', 'as', 'os', 'para', 'por', 'ao', 'aos', 'na', 'no', 'nas', 'nos', 'tipo',
]);

const SYNONYMS: Record<string, string[]> = {
  branco: ['tipo 1', 'tipo 2', 'polido'],
  branca: ['tipo 1', 'tipo 2', 'polida'],
  aipim: ['mandioca', 'macaxeira'],
  macaxeira: ['mandioca', 'aipim'],
  mandioca: ['aipim', 'macaxeira'],
  file: ['peito'],
  bife: ['carne', 'bovina'],
};

export function normalizeSearchText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }
  return dp[m][n];
}

interface TokenMatch {
  matched: boolean;
  score: number;
  matchedInName: boolean;
  wordIndexInName: number;
}

function matchToken(
  token: string,
  nameWords: string[],
  prepWords: string[],
  catWords: string[],
  fullText: string
): TokenMatch {
  // 1. Exact match in food name words (highest priority)
  const nameExactIdx = nameWords.indexOf(token);
  if (nameExactIdx !== -1) {
    return {
      matched: true,
      score: 70 + (nameExactIdx === 0 ? 30 : 0),
      matchedInName: true,
      wordIndexInName: nameExactIdx,
    };
  }

  // 2. Prefix match in food name words (e.g. "frang" -> "frango")
  const namePrefixIdx = nameWords.findIndex((w) => w.startsWith(token));
  if (namePrefixIdx !== -1) {
    return {
      matched: true,
      score: 55 + (namePrefixIdx === 0 ? 25 : 0),
      matchedInName: true,
      wordIndexInName: namePrefixIdx,
    };
  }

  // 3. Exact / Prefix match in preparo words (e.g. "cozido", "grelhado", "cru", "assado")
  const prepIdx = prepWords.findIndex((w) => w === token || w.startsWith(token));
  if (prepIdx !== -1) {
    return {
      matched: true,
      score: 45,
      matchedInName: false,
      wordIndexInName: -1,
    };
  }

  // 4. Synonym match
  if (SYNONYMS[token]) {
    for (const syn of SYNONYMS[token]) {
      const synIdx = nameWords.findIndex((w) => w === syn || w.startsWith(syn));
      if (synIdx !== -1) {
        return {
          matched: true,
          score: 50,
          matchedInName: true,
          wordIndexInName: synIdx,
        };
      }
      if (fullText.includes(syn)) {
        return {
          matched: true,
          score: 40,
          matchedInName: false,
          wordIndexInName: -1,
        };
      }
    }
  }

  // 5. Match in category words
  const catIdx = catWords.findIndex((w) => w === token || w.startsWith(token));
  if (catIdx !== -1) {
    return {
      matched: true,
      score: 25,
      matchedInName: false,
      wordIndexInName: -1,
    };
  }

  // 6. Substring match in name
  const nameNorm = nameWords.join(' ');
  if (nameNorm.includes(token)) {
    return {
      matched: true,
      score: 40,
      matchedInName: true,
      wordIndexInName: 99,
    };
  }

  // 7. Typo tolerance (Levenshtein distance) on name words
  if (token.length >= 4) {
    let bestDist = 999;
    const maxAllowedDist = token.length >= 7 ? 2 : 1;

    for (let i = 0; i < nameWords.length; i++) {
      const w = nameWords[i];
      if (Math.abs(w.length - token.length) <= maxAllowedDist) {
        const dist = levenshteinDistance(token, w);
        if (dist <= maxAllowedDist && dist < bestDist) {
          bestDist = dist;
        }
      }
    }

    if (bestDist <= maxAllowedDist) {
      return {
        matched: true,
        score: Math.max(20, 45 - bestDist * 15),
        matchedInName: true,
        wordIndexInName: 99,
      };
    }
  }

  return {
    matched: false,
    score: 0,
    matchedInName: false,
    wordIndexInName: -1,
  };
}

interface FoodSearchIndex {
  nameNorm: string;
  prepNorm: string;
  catNorm: string;
  fullText: string;
  nameWords: string[];
  prepWords: string[];
  catWords: string[];
}

const foodIndexCache = new WeakMap<FoodItem, FoodSearchIndex>();

export function getFoodSearchIndex(food: FoodItem): FoodSearchIndex {
  let index = foodIndexCache.get(food);
  if (!index) {
    const nameNorm = normalizeSearchText(food.name);
    const prepNorm = normalizeSearchText(food.preparo || '');
    const catNorm = normalizeSearchText(food.category || '');
    const fullText = `${nameNorm} ${prepNorm} ${catNorm}`;
    index = {
      nameNorm,
      prepNorm,
      catNorm,
      fullText,
      nameWords: nameNorm.split(' ').filter(Boolean),
      prepWords: prepNorm.split(' ').filter(Boolean),
      catWords: catNorm.split(' ').filter(Boolean),
    };
    foodIndexCache.set(food, index);
  }
  return index;
}

export function scoreFoodItem(food: FoodItem, query: string): number {
  const normQuery = normalizeSearchText(query);
  if (!normQuery) return 0;

  const rawTokens = normQuery.split(' ').filter(Boolean);
  if (rawTokens.length === 0) return 0;

  const meaningfulTokens = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const tokens = meaningfulTokens.length > 0 ? meaningfulTokens : rawTokens;

  const { nameNorm, prepNorm, catNorm, fullText, nameWords, prepWords, catWords } =
    getFoodSearchIndex(food);

  let totalScore = 0;
  let matchedCount = 0;
  let matchedInNameCount = 0;
  let firstWordMatched = false;
  let lastWordIndex = -1;
  let orderedMatches = 0;

  // Direct exact phrase match in name
  if (nameNorm.includes(normQuery)) {
    totalScore += 300;
    if (nameNorm.startsWith(normQuery)) totalScore += 100;
  } else if (fullText.includes(normQuery)) {
    totalScore += 150;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const match = matchToken(token, nameWords, prepWords, catWords, fullText);

    if (match.matched) {
      matchedCount++;
      totalScore += match.score;

      if (match.matchedInName) {
        matchedInNameCount++;
        if (match.wordIndexInName === 0) {
          firstWordMatched = true;
          totalScore += 40;
        }
        if (match.wordIndexInName > lastWordIndex && match.wordIndexInName !== 99) {
          orderedMatches++;
          lastWordIndex = match.wordIndexInName;
        }
      }
    }
  }

  // Multi-token requirement:
  // For queries with 1 or 2 tokens, ALL tokens must match.
  // For queries with 3+ tokens, at least (N-1) tokens must match.
  const minRequiredMatches = tokens.length <= 2 ? tokens.length : tokens.length - 1;
  if (matchedCount < minRequiredMatches) {
    return 0;
  }

  // Extra boost when ALL tokens matched
  if (matchedCount === tokens.length) {
    totalScore += 120;
  }

  // Extra boost when all tokens matched in the food name
  if (matchedInNameCount === tokens.length) {
    totalScore += 80;
  }

  // Word order bonus
  if (orderedMatches > 1) {
    totalScore += orderedMatches * 20;
  }

  // First word in query matched first word in food name bonus
  if (firstWordMatched) {
    totalScore += 50;
  }

  // Boost for favorites & custom foods
  if (food.isFavorite) totalScore += 25;
  if (food.isCustom || food.source === 'CUSTOM') totalScore += 20;

  // Shorter name precision bonus
  totalScore += Math.max(0, 30 - Math.round(food.name.length / 3));

  return totalScore;
}

export function searchTacoFoods(query: string, foodsPool?: FoodItem[]): FoodItem[] {
  if (!query || !query.trim()) return [];
  const all = foodsPool ?? getAllFoods();
  const scored: Array<{ food: FoodItem; score: number }> = [];

  for (const food of all) {
    const score = scoreFoodItem(food, query);
    if (score > 0) {
      scored.push({ food, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.map((s) => s.food);
}
