import test from 'node:test';
import assert from 'node:assert/strict';
import {
  computeComparisonRadii,
  computeJulianDate,
  computeLocalSiderealTimeDeg,
  computeOrbitalAngleRad,
  equatorialToHorizontal,
  formatLightTimeFromAu,
  projectHorizontalToDome,
} from './astronomy';
import {
  INITIAL_VOYAGE_STATE,
  computeEarnedBadges,
  recordChapterCompletion,
  recordObjectVisit,
  recordQuizSuccess,
} from './voyageStore';
import { getObjectBySlug, SOLAR_SYSTEM_PLANETS } from '../data/catalog';

test('Julian Date at J2000.0 epoch equals 2451545.0', () => {
  const j2000 = new Date('2000-01-01T12:00:00.000Z');
  assert.ok(Math.abs(computeJulianDate(j2000) - 2451545.0) < 1e-6);
});

test('Polaris stays near observer latitude altitude in Northern Hemisphere', () => {
  const londonLat = 51.4769;
  const londonLon = -0.0005;
  const date = new Date('2026-10-29T22:00:00.000Z');
  const horiz = equatorialToHorizontal(
    { raHours: 2.5303, decDeg: 89.2641 },
    londonLat,
    londonLon,
    date
  );
  // Polaris sits within ~0.8 deg of North Celestial Pole, so its altitude in London (~51.5°N) must be within 1.5° of 51.5°
  assert.ok(
    Math.abs(horiz.altitudeDeg - londonLat) < 1.5,
    `Expected Polaris altitude near ${londonLat}, got ${horiz.altitudeDeg}`
  );
  const dome = projectHorizontalToDome(horiz);
  assert.equal(dome.visible, true);
  assert.ok(dome.y < 0, 'North star should project into upper (Northern) half of dome');
});

test('True-scale comparison vs Presentation scale preserves Jupiter > Earth ordering', () => {
  const jupiter = getObjectBySlug('jupiter')!;
  const earth = getObjectBySlug('earth')!;
  assert.equal(SOLAR_SYSTEM_PLANETS.length, 8);

  const trueScale = computeComparisonRadii(
    jupiter.metrics.diameterKm,
    earth.metrics.diameterKm,
    'true-scale'
  );
  assert.equal(trueScale.radiusFractionA, 1);
  assert.ok(trueScale.radiusFractionB < 0.1 && trueScale.radiusFractionB > 0.08);
  assert.ok(trueScale.diameterRatio > 10.9 && trueScale.diameterRatio < 11.1);

  const presentation = computeComparisonRadii(
    jupiter.metrics.diameterKm,
    earth.metrics.diameterKm,
    'presentation'
  );
  assert.equal(presentation.radiusFractionA, 1);
  assert.ok(presentation.radiusFractionB > trueScale.radiusFractionB);
  assert.ok(presentation.radiusFractionB < 1);
});

test('Orbital angle and light-time formatting behave deterministically', () => {
  const halfOrbit = computeOrbitalAngleRad(365.25, 0, 365.25 / 2);
  assert.ok(Math.abs(halfOrbit - Math.PI) < 1e-4);
  assert.equal(formatLightTimeFromAu(1.0), '8.3 light-min');
  assert.equal(formatLightTimeFromAu(30.07), '4.17 light-hr');
  const lst = computeLocalSiderealTimeDeg(new Date('2026-10-29T00:00:00Z'), 0);
  assert.ok(lst >= 0 && lst < 360);
});

test('Voyage Passport state tracks visits, chapters, quizzes, and badges', () => {
  let state = INITIAL_VOYAGE_STATE;
  state = recordObjectVisit(state, 'saturn', 'Saturn rings are 99.9% water ice.');
  state = recordObjectVisit(state, 'jupiter', 'Jupiter spins in under 10 hours.');
  assert.deepEqual(state.visitedSlugs, ['earth', 'saturn', 'jupiter']);
  assert.equal(state.lastDestinationSlug, 'jupiter');

  state = recordChapterCompletion(state, 'worlds-beyond', 0, 3, 'Fact 1');
  state = recordChapterCompletion(state, 'worlds-beyond', 1, 3, 'Fact 2');
  state = recordChapterCompletion(state, 'worlds-beyond', 2, 3, 'Fact 3');
  assert.ok(state.completedShows.includes('worlds-beyond'));

  state = recordQuizSuccess(state, 'q-saturn-rings', 'Ring particles follow Keplerian orbits.');
  state = recordQuizSuccess(state, 'q-earth-seasons', '23.44 deg tilt causes seasons.');

  const badges = computeEarnedBadges(state);
  assert.equal(badges.every((b) => b.earned), true);
});
