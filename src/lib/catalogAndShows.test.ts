import test from 'node:test';
import assert from 'node:assert/strict';
import { CELESTIAL_CATALOG, getObjectBySlug } from '../data/catalog';
import { PLANETARIUM_SHOWS } from '../data/showsAndLearning';

test('Catalog Expansion: contains all 34 canonical celestial objects', () => {
  assert.equal(CELESTIAL_CATALOG.length, 34);

  const expectedSlugs = [
    // 8 Classical Planets + Sun + Pluto + Earth Moon
    'sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'moon',
    // Moons
    'io', 'ganymede', 'callisto', 'titan', 'europa', 'enceladus', 'triton', 'charon', 'phobos', 'deimos',
    // Asteroid belt / dwarf planets
    'ceres', 'vesta',
    // Nearby and remarkable stars
    'proxima-centauri', 'betelgeuse', 'sirius',
    // Deep Sky
    'milky-way', 'orion-nebula', 'andromeda', 'crab-nebula', 'sagittarius-a',
    // Exoplanets
    'trappist-1e', '55-cancri-e', 'kepler-452b'
  ];

  for (const slug of expectedSlugs) {
    const obj = getObjectBySlug(slug);
    assert.ok(obj, `Expected object with slug '${slug}' to exist in catalog`);
    assert.equal(obj.slug, slug);
    assert.ok(obj.name.length > 0, `Object ${slug} must have a name`);
    assert.ok(obj.classification.length > 0, `Object ${slug} must have a classification`);
    assert.ok(obj.hook.length > 0, `Object ${slug} must have a hook`);

    // Three mandatory reading levels
    assert.ok(obj.readingLevels.young.length > 30, `Object ${slug} must have 'young' reading level`);
    assert.ok(obj.readingLevels.curious.length > 30, `Object ${slug} must have 'curious' reading level`);
    assert.ok(obj.readingLevels.enthusiast.length > 30, `Object ${slug} must have 'enthusiast' reading level`);

    // Metrics
    assert.ok(obj.metrics.diameterKm > 0, `Object ${slug} must have positive diameterKm`);
    assert.ok(obj.metrics.diameterLabel.length > 0, `Object ${slug} must have diameterLabel`);
    assert.ok(obj.metrics.gravityLabel.length > 0, `Object ${slug} must have gravityLabel`);

    // Educator pedagogy notes
    assert.ok(obj.teacherNotes.keyConcept.length > 20, `Object ${slug} must have keyConcept`);
    assert.ok(obj.teacherNotes.misconceptionWarning.length > 20, `Object ${slug} must have misconceptionWarning`);
    assert.ok(obj.teacherNotes.discussionPrompt.length > 10, `Object ${slug} must have discussionPrompt`);

    // Provenance & authenticity
    assert.ok(obj.sources.length >= 1, `Object ${slug} must cite at least one source`);
    for (const src of obj.sources) {
      assert.ok(src.assetId, `Source in ${slug} must have assetId`);
      assert.ok(src.creditLine, `Source in ${slug} must have creditLine`);
      assert.ok(src.license, `Source in ${slug} must have license`);
      assert.ok(src.authenticityTier, `Source in ${slug} must have authenticityTier`);
    }
  }
});

test('Planetarium Shows: all 5 guided shows have valid chapters and referenced objects', () => {
  assert.equal(PLANETARIUM_SHOWS.length, 5);

  const showSlugs = PLANETARIUM_SHOWS.map((s) => s.slug);
  assert.ok(showSlugs.includes('first-flight'), 'Must include first-flight');
  assert.ok(showSlugs.includes('our-home-milky-way'), 'Must include our-home-milky-way');
  assert.ok(showSlugs.includes('moons-hidden-oceans'), 'Must include moons-hidden-oceans');
  assert.ok(showSlugs.includes('rings-of-saturn'), 'Must include rings-of-saturn');
  assert.ok(showSlugs.includes('worlds-beyond'), 'Must include worlds-beyond');

  for (const show of PLANETARIUM_SHOWS) {
    assert.ok(show.chapters.length >= 3, `Show ${show.slug} must have at least 3 chapters`);
    for (const ch of show.chapters) {
      assert.ok(ch.title, `Chapter in ${show.slug} must have title`);
      assert.ok(ch.narrationScript.length > 20, `Chapter in ${show.slug} must have narrationScript`);
      assert.ok(ch.keyFact.length > 10, `Chapter in ${show.slug} must have keyFact`);

      // Verify the referenced celestial object exists in the catalog
      const obj = getObjectBySlug(ch.objectSlug);
      assert.ok(obj, `Chapter object '${ch.objectSlug}' in show '${show.slug}' must exist in CELESTIAL_CATALOG`);
    }
  }
});
