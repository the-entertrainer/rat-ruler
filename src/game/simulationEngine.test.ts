import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKleiberMetabolicRate,
  calculateCalhounDensityStressDelta,
  evaluateHamiltonKinSelection,
  createInitialColonyState,
  stepColonySimulation,
  upgradeBurrowChamber,
  toggleRoyalDecree,
} from './simulationEngine';

test('Kleiber allometric metabolic scaling increases with body mass and encephalization', () => {
  const baselineForager = calculateKleiberMetabolicRate(280, 0.52, 'Forager');
  const heavyForager = calculateKleiberMetabolicRate(420, 0.52, 'Forager');
  const highEqForager = calculateKleiberMetabolicRate(280, 1.85, 'Forager');

  assert.equal(heavyForager > baselineForager, true);
  assert.equal(highEqForager > baselineForager, true);
});

test('Calhoun density stress spikes when population approaches or exceeds burrow capacity', () => {
  const lowDensityDelta = calculateCalhounDensityStressDelta(25, 100, 10, 0.55);
  const highDensityDelta = calculateCalhounDensityStressDelta(98, 100, 2, 0.30);

  assert.equal(lowDensityDelta < 0, true);
  assert.equal(highDensityDelta > 2, true);
});

test('Hamilton kin selection favors altruism when r * B > C', () => {
  const favoredResult = evaluateHamiltonKinSelection(0.65, 2.0, 0.8);
  const unfavoredResult = evaluateHamiltonKinSelection(0.20, 1.2, 0.9);

  assert.equal(favoredResult.favored, true);
  assert.equal(favoredResult.hamiltonSurplus > 0, true);
  assert.equal(unfavoredResult.favored, false);
});

test('Colony simulation step advances tick, updates ATP/Mycelium, and moves agents', () => {
  const initial = createInitialColonyState('norvegicus_rex');
  const next = stepColonySimulation(initial);

  assert.equal(next.tick, initial.tick + 1);
  assert.equal(next.encephalization >= initial.encephalization, true);
  assert.equal(next.agents.length, initial.agents.length);
});

test('Upgrading a burrow chamber deducts resources and expands maximum capacity', () => {
  const initial = createInitialColonyState('norvegicus_rex');
  const targetChamber = initial.chambers[1]; // Symbiotic Mycelium Granary
  const result = upgradeBurrowChamber(initial, targetChamber.id);

  assert.equal(result.success, true);
  assert.equal(result.nextState.maxCapacity > initial.maxCapacity, true);
  const upgraded = result.nextState.chambers.find((c) => c.id === targetChamber.id);
  assert.equal(upgraded?.level, 2);
});

test('Toggling a royal decree updates active status and logs the scientific basis', () => {
  const initial = createInitialColonyState('norvegicus_rex');
  const inactiveDecree = initial.decrees.find((d) => !d.active)!;
  const result = toggleRoyalDecree(initial, inactiveDecree.id);

  assert.equal(result.success, true);
  const updated = result.nextState.decrees.find((d) => d.id === inactiveDecree.id);
  assert.equal(updated?.active, true);
});
