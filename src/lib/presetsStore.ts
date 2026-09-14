'use client';

import { getEphemeralItem, setEphemeralItem } from './ephemeral-storage';
import type { DietPreset } from './domain/diet-preset';

export type { DietPreset } from './domain/diet-preset';

const PRESETS_KEY = 'nutridiet_presets';

export function getPresetsFromStorage(): DietPreset[] {
  return getEphemeralItem<DietPreset[]>(PRESETS_KEY, []);
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

  setEphemeralItem(PRESETS_KEY, updated);
  return presetToSave;
}

export function deletePresetFromStorage(id: string): void {
  const current = getPresetsFromStorage();
  const updated = current.filter((p) => p.id !== id);
  setEphemeralItem(PRESETS_KEY, updated);
}
