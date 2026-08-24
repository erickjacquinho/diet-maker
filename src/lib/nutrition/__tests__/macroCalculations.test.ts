import { describe, it, expect } from 'vitest';
import {
  calculateKcalFromMacros,
  calculateGPerKg,
  calculateMacroProgress,
  calculateMacroDistributionPct,
  buildMacroMetricCardProps,
  ATWATER_FACTORS,
} from '../macroCalculations';

describe('macroCalculations Unit Tests', () => {
  it('calculates calories according to Atwater factors (4-4-9)', () => {
    // 150g P (600) + 220g C (880) + 60g F (540) = 2020 kcal
    const kcal = calculateKcalFromMacros(150, 220, 60);
    expect(kcal).toBe(2020);

    expect(calculateKcalFromMacros(0, 0, 0)).toBe(0);
    expect(calculateKcalFromMacros(-10, -5, -2)).toBe(0);
    expect(ATWATER_FACTORS.protein).toBe(4);
    expect(ATWATER_FACTORS.carbs).toBe(4);
    expect(ATWATER_FACTORS.fats).toBe(9);
  });

  it('calculates g/kg ratio safely for valid, zero and undefined weights', () => {
    const valid = calculateGPerKg(150, 75);
    expect(valid).toEqual({ value: 2, formatted: '2.00' });

    expect(calculateGPerKg(150, 0)).toBeNull();
    expect(calculateGPerKg(150, undefined)).toBeNull();
    expect(calculateGPerKg(150, -80)).toBeNull();
  });

  it('handles progress status for empty / initial diet state (0g current) when target exists', () => {
    const result = calculateMacroProgress(0, 2020, 'kcal');
    expect(result.status).toBe('empty');
    expect(result.percentage).toBe(0);
    expect(result.diff).toBe(-2020);
    expect(result.badgeText).toBe('Faltam 2020 kcal');
    expect(result.badgeTone).toBe('warning');
    expect(result.hasTarget).toBe(true);
  });

  it('handles no_target state when target is 0 or undefined', () => {
    const result = calculateMacroProgress(0, 0, 'g');
    expect(result.status).toBe('no_target');
    expect(result.percentage).toBe(0);
    expect(result.diff).toBe(0);
    expect(result.badgeText).toBe('Sem meta');
    expect(result.badgeTone).toBe('default');
    expect(result.hasTarget).toBe(false);

    const cardProps = buildMacroMetricCardProps({
      label: 'Proteínas',
      current: 0,
      target: 0,
      unit: 'g',
      macroColor: 'protein',
      weightKg: 80,
    });

    expect(cardProps.hasTarget).toBe(false);
    expect(cardProps.statusBadgeText).toBe('Sem meta');
    expect(cardProps.statusBadgeVariant).toBe('default');
    expect(cardProps.targetValue).toBe('');
  });

  it('handles progress status within 5% tolerance as on_target', () => {
    // 1950 is within 5% of 2000 (1900-2100)
    const result = calculateMacroProgress(1950, 2000, 'kcal');
    expect(result.status).toBe('on_target');
    expect(result.badgeText).toBe('Na meta ✓');
    expect(result.badgeTone).toBe('emerald');
    expect(result.hasTarget).toBe(true);
  });

  it('handles fat tolerance using absolute 2g margin', () => {
    // 59g fat with target 60g is on target
    const result = calculateMacroProgress(59, 60, 'g', true);
    expect(result.status).toBe('on_target');
    expect(result.badgeText).toBe('Na meta ✓');
    expect(result.hasTarget).toBe(true);
  });

  it('handles surplus status when exceeding target beyond tolerance', () => {
    const result = calculateMacroProgress(250, 200, 'g');
    expect(result.status).toBe('surplus');
    expect(result.percentage).toBe(100);
    expect(result.diff).toBe(50);
    expect(result.badgeText).toBe('+50g');
    expect(result.badgeTone).toBe('rose');
    expect(result.hasTarget).toBe(true);
  });

  it('builds card props correctly for macro cards and calories card', () => {
    const protCard = buildMacroMetricCardProps({
      label: 'Proteínas',
      current: 0,
      target: 150,
      unit: 'g',
      macroColor: 'protein',
      weightKg: 79,
    });

    expect(protCard.label).toBe('Proteínas');
    expect(protCard.currentValue).toBe('0g');
    expect(protCard.targetValue).toBe('150g');
    expect(protCard.statusBadgeText).toBe('Faltam 150g');
    expect(protCard.statusBadgeVariant).toBe('warning');
    expect(protCard.gPerKgRatio).toBe('0.00 g/kg');
    expect(protCard.gPerKgMeta).toBe('1.9');
    expect(protCard.macroColor).toBe('protein');
    expect(protCard.hasTarget).toBe(true);

    const kcalCard = buildMacroMetricCardProps({
      label: 'Calorias',
      current: 0,
      target: 2020,
      unit: 'kcal',
      macroColor: 'blue',
    });

    expect(kcalCard.label).toBe('Calorias');
    expect(kcalCard.currentValue).toBe('0');
    expect(kcalCard.targetValue).toBe('2020 kcal');
    expect(kcalCard.statusBadgeText).toBe('Faltam 2020 kcal');
    expect(kcalCard.gPerKgRatio).toBeUndefined();
    expect(kcalCard.hasTarget).toBe(true);
  });

  it('calculates caloric distribution (% VET) correctly', () => {
    // 150g P (600 kcal), 250g C (1000 kcal), 50g F (450 kcal) = 2050 kcal total
    // P: 600/2050 = 29.27% -> 29%
    // C: 1000/2050 = 48.78% -> 49%
    // F: 450/2050 = 21.95% -> 22%
    const dist = calculateMacroDistributionPct(150, 250, 50);
    expect(dist.totalKcal).toBe(2050);
    expect(dist.proteinKcal).toBe(600);
    expect(dist.carbsKcal).toBe(1000);
    expect(dist.fatsKcal).toBe(450);
    expect(dist.proteinPct).toBe(29);
    expect(dist.carbsPct).toBe(49);
    expect(dist.fatsPct).toBe(22);

    // Empty / zero targets
    const emptyDist = calculateMacroDistributionPct(0, 0, 0);
    expect(emptyDist.totalKcal).toBe(0);
    expect(emptyDist.proteinPct).toBe(0);
    expect(emptyDist.carbsPct).toBe(0);
    expect(emptyDist.fatsPct).toBe(0);
  });
});
