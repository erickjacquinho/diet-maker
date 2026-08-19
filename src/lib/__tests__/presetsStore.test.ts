import { describe, it, expect, beforeEach } from 'vitest';
import {
  getPresetsFromStorage,
  savePresetToStorage,
  deletePresetFromStorage,
} from '../presetsStore';

describe('presetsStore', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty list by default', () => {
    expect(getPresetsFromStorage()).toEqual([]);
  });

  it('saves and retrieves presets', () => {
    const saved = savePresetToStorage({
      title: 'Bulking Limpo',
      category: 'Hipertrofia',
      targetKcal: 3000,
      proteinG: 180,
      carbsG: 400,
      fatsG: 70,
      mealsCount: 5,
      description: 'Dieta hipercalórica limpa',
    });

    expect(saved.id).toBeDefined();
    expect(saved.title).toBe('Bulking Limpo');

    const all = getPresetsFromStorage();
    expect(all).toHaveLength(1);
    expect(all[0].id).toBe(saved.id);
  });

  it('updates existing preset when id matches', () => {
    const preset = savePresetToStorage({
      title: 'Low Carb',
      category: 'Emagrecimento',
      targetKcal: 1800,
      proteinG: 140,
      carbsG: 100,
      fatsG: 80,
      mealsCount: 4,
      description: 'Dieta restrita em carboidratos',
    });

    const updated = savePresetToStorage({
      id: preset.id,
      title: 'Low Carb Avançado',
      category: 'Emagrecimento',
      targetKcal: 1700,
      proteinG: 150,
      carbsG: 80,
      fatsG: 80,
      mealsCount: 4,
      description: 'Nova descrição',
    });

    expect(updated.id).toBe(preset.id);
    expect(updated.title).toBe('Low Carb Avançado');

    const all = getPresetsFromStorage();
    expect(all).toHaveLength(1);
    expect(all[0].title).toBe('Low Carb Avançado');
  });

  it('deletes a preset by id', () => {
    const preset = savePresetToStorage({
      title: 'To Delete',
      category: 'Teste',
      targetKcal: 2000,
      proteinG: 100,
      carbsG: 200,
      fatsG: 50,
      mealsCount: 3,
      description: 'Desc',
    });

    expect(getPresetsFromStorage()).toHaveLength(1);

    deletePresetFromStorage(preset.id);
    expect(getPresetsFromStorage()).toHaveLength(0);
  });
});
