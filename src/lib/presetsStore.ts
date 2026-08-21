'use client';

import { getStorageItem, setStorageItem } from './storage';
import type { MacroMode } from './presetUtils';

export interface DietPreset {
  id: string;
  title: string;
  category: string;
  targetKcal: number;
  proteinG: number;
  carbsG: number;
  fatsG: number;
  proteinMode?: MacroMode;
  proteinValue?: number;
  carbsMode?: MacroMode;
  carbsValue?: number;
  fatsMode?: MacroMode;
  fatsValue?: number;
  referenceWeight?: number;
  mealsCount: number;
  description: string;
}

const PRESETS_KEY = 'nutridiet_presets';

export function getPresetsFromStorage(): DietPreset[] {
  return getStorageItem<DietPreset[]>(PRESETS_KEY, []);
}

export function savePresetToStorage(preset: Omit<DietPreset, 'id'> & { id?: string }): DietPreset {
  const current = getPresetsFromStorage();
  const id = preset.id || `preset-${Date.now()}`;
  const presetToSave: DietPreset = {
    ...preset,
    id,
    title: preset.title.trim(),
    description: preset.description.trim(),
  };

  const existingIndex = current.findIndex((p) => p.id === id);
  const updated = existingIndex >= 0
    ? current.map((p) => (p.id === id ? presetToSave : p))
    : [presetToSave, ...current];

  setStorageItem(PRESETS_KEY, updated);
  return presetToSave;
}

export function deletePresetFromStorage(id: string): void {
  const current = getPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  setStorageItem(PRESETS_KEY, updated);
}
