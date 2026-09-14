import { describe, expect, it } from 'vitest';
import { cloneConfirmedFixture, cloneFixture } from '../src/fixture';
import { assertConfirmedFixtureEqual, assertFixtureContainsRequiredCoverage } from './support/fixture-assertions';

describe('deterministic PoC fixture', () => {
  it('contains the scopes and states required by the technical gate', () => {
    const current = cloneConfirmedFixture();

    assertFixtureContainsRequiredCoverage(current);
    expect(current.dietPlans.filter((plan) => plan.status === 'ACTIVE')).toHaveLength(2);
    expect(current.dietPlans.find((plan) => plan.id === 'diet-ana-v2')?.version).toBe(2);
  });

  it('clones to a stable representation without sharing mutable arrays', () => {
    const first = cloneFixture();
    const second = cloneFixture();

    first.accounts[0].displayName = 'altered copy';

    expect(second.accounts[0].displayName).toBe('Consultório Alpha');
    assertConfirmedFixtureEqual(second, cloneConfirmedFixture());
  });
});
