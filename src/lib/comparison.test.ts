import test from 'node:test';
import assert from 'node:assert/strict';
import { computeComparisonRadii } from './astronomy';
import { getObjectBySlug } from '../data/catalog';

test('Compare Worlds: Earth vs Titan true-scale diameter ratio', () => {
  const earth = getObjectBySlug('earth')!;
  const titan = getObjectBySlug('titan')!;
  assert.ok(earth, 'Earth must exist in catalog');
  assert.ok(titan, 'Titan must exist in catalog');

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    earth.metrics.diameterKm,
    titan.metrics.diameterKm,
    'true-scale'
  );

  // Earth (12,742 km) / Titan (5,149.5 km) ≈ 2.4744
  const expectedRatio = earth.metrics.diameterKm / titan.metrics.diameterKm;
  assert.equal(radiusFractionA, 1.0);
  assert.ok(
    Math.abs(diameterRatio - expectedRatio) < 1e-4,
    `Earth vs Titan diameter ratio should be ${expectedRatio}, got ${diameterRatio}`
  );
  assert.ok(
    Math.abs(radiusFractionB - (1 / expectedRatio)) < 1e-4,
    `Titan radiusFraction should be exact reciprocal, got ${radiusFractionB}`
  );
  assert.ok(diameterRatio > 2.45 && diameterRatio < 2.50);
});

test('Compare Worlds: Earth vs Jupiter true-scale diameter ratio', () => {
  const earth = getObjectBySlug('earth')!;
  const jupiter = getObjectBySlug('jupiter')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    earth.metrics.diameterKm,
    jupiter.metrics.diameterKm,
    'true-scale'
  );

  // Earth / Jupiter ≈ 12,742 / 139,820 ≈ 0.09113
  const expectedRatio = earth.metrics.diameterKm / jupiter.metrics.diameterKm;
  assert.ok(Math.abs(diameterRatio - expectedRatio) < 1e-4);
  assert.equal(radiusFractionB, 1.0, 'Jupiter must be the larger reference world (1.0)');
  assert.ok(Math.abs(radiusFractionA - expectedRatio) < 1e-4);
  assert.ok(radiusFractionA > 0.09 && radiusFractionA < 0.092);
});

test('Compare Worlds: Saturn vs Jupiter true-scale diameter ratio', () => {
  const saturn = getObjectBySlug('saturn')!;
  const jupiter = getObjectBySlug('jupiter')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    saturn.metrics.diameterKm,
    jupiter.metrics.diameterKm,
    'true-scale'
  );

  // Saturn (116,460 km) / Jupiter (139,820 km) ≈ 0.8329
  const expectedRatio = saturn.metrics.diameterKm / jupiter.metrics.diameterKm;
  assert.ok(Math.abs(diameterRatio - expectedRatio) < 1e-4);
  assert.equal(radiusFractionB, 1.0);
  assert.ok(radiusFractionA > 0.83 && radiusFractionA < 0.84);
});

test('Compare Worlds: Moon vs Earth true-scale diameter ratio', () => {
  const moon = getObjectBySlug('moon')!;
  const earth = getObjectBySlug('earth')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    moon.metrics.diameterKm,
    earth.metrics.diameterKm,
    'true-scale'
  );

  // Moon (3,474.8 km) / Earth (12,742 km) ≈ 0.2727 (approx 1/3.67)
  const expectedRatio = moon.metrics.diameterKm / earth.metrics.diameterKm;
  assert.ok(Math.abs(diameterRatio - expectedRatio) < 1e-4);
  assert.equal(radiusFractionB, 1.0);
  assert.ok(radiusFractionA > 0.27 && radiusFractionA < 0.28);
});

test('Compare Worlds: Sun vs Pluto extreme ratio without artificial minimum floor clamp', () => {
  const sun = getObjectBySlug('sun')!;
  const pluto = getObjectBySlug('pluto')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    sun.metrics.diameterKm,
    pluto.metrics.diameterKm,
    'true-scale'
  );

  // Sun (1,392,700 km) / Pluto (2,376.6 km) ≈ 586.0
  // Pluto radius fraction = 2376.6 / 1392700 ≈ 0.001706 (0.17%)
  const exactPlutoFraction = pluto.metrics.diameterKm / sun.metrics.diameterKm;
  assert.equal(radiusFractionA, 1.0);
  assert.ok(
    Math.abs(radiusFractionB - exactPlutoFraction) < 1e-6,
    `Pluto true-scale fraction must be exact linear ratio ${exactPlutoFraction}, got ${radiusFractionB}`
  );
  // Verify that an artificial clamp (like 0.015 or 0.05) is NOT applied
  assert.ok(
    radiusFractionB < 0.005,
    `Pluto must be sub-percent (< 0.005) of the Sun, but got ${radiusFractionB}`
  );
  assert.ok(diameterRatio > 580 && diameterRatio < 590);
});

test('Compare Worlds: Mars vs Mercury true-scale diameter ratio', () => {
  const mars = getObjectBySlug('mars')!;
  const mercury = getObjectBySlug('mercury')!;

  const { radiusFractionA, radiusFractionB, diameterRatio } = computeComparisonRadii(
    mars.metrics.diameterKm,
    mercury.metrics.diameterKm,
    'true-scale'
  );

  // Mars (6,779 km) / Mercury (4,879.4 km) ≈ 1.3893
  const expectedRatio = mars.metrics.diameterKm / mercury.metrics.diameterKm;
  assert.ok(Math.abs(diameterRatio - expectedRatio) < 1e-4);
  assert.equal(radiusFractionA, 1.0);
  assert.ok(radiusFractionB > 0.71 && radiusFractionB < 0.73);
});

test('Compare Worlds: Presentation scale compresses dynamic range for extreme pairs', () => {
  const sun = getObjectBySlug('sun')!;
  const pluto = getObjectBySlug('pluto')!;

  const trueScale = computeComparisonRadii(
    sun.metrics.diameterKm,
    pluto.metrics.diameterKm,
    'true-scale'
  );
  const presentation = computeComparisonRadii(
    sun.metrics.diameterKm,
    pluto.metrics.diameterKm,
    'presentation'
  );

  // In true-scale, Pluto is ~0.0017
  // In presentation scale, power compression raises Pluto so it remains visually inspectable
  assert.ok(trueScale.radiusFractionB < 0.002);
  assert.ok(
    presentation.radiusFractionB > 0.1,
    `Presentation scale must elevate Pluto for inspection: got ${presentation.radiusFractionB}`
  );
  assert.ok(
    presentation.radiusFractionB < 0.5,
    `Presentation scale must not make Pluto equal to Sun: got ${presentation.radiusFractionB}`
  );
});

test('Compare Worlds: Saturn ring geometry does not alter physical sphere diameter ratio', () => {
  const saturn = getObjectBySlug('saturn')!;
  const earth = getObjectBySlug('earth')!;

  const { diameterRatio } = computeComparisonRadii(
    saturn.metrics.diameterKm,
    earth.metrics.diameterKm,
    'true-scale'
  );

  // Saturn equatorial diameter (116,460 km) / Earth (12,742 km) ≈ 9.1398
  // Ring outer radius (up to 140,000 km) must not artificially inflate the globe diameter ratio
  const expectedRatio = 116460 / 12742;
  assert.ok(
    Math.abs(diameterRatio - expectedRatio) < 1e-4,
    `Saturn vs Earth sphere diameter ratio must be ${expectedRatio}, got ${diameterRatio}`
  );
});
