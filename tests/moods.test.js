import test from 'node:test';
import assert from 'node:assert/strict';
import { MOODS, experienceFacts, scoreMood } from '../src/style/moods.js';
import { composeTrio, composeOutfit } from '../src/style/stylist.js';
import { stylingFacts } from '../src/style/facts.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { presetConditions } from '../src/weather/conditions.js';

const chenille = 'pull-bear-grey-chenille-high-neck-v1', floral = 'cream-pointelle-flower-jumper-v1';
test('physical comfort evidence stays separate from romantic styling, and unknown stays unknown', () => {
  const aesthetic = { name: 'Pink floral soft romantic top', styling: { palette: ['pink'], pattern: 'floral' } };
  assert.equal(stylingFacts(aesthetic).soft, true);
  assert.deepEqual(experienceFacts(aesthetic), { comfortable: null, easy: null, softMaterial: null, relaxed: null, simpleEntry: null, frontButtons: null, conspicuous: false });
  assert.equal(stylingFacts(chenille).experience.softMaterial, true);
  assert.equal(stylingFacts('black-yoke-henley-blouse-v1').experience.frontButtons, true, 'the buttoned placket is documented');
  assert.equal(stylingFacts('zara-cargo-joggers-v1').experience.simpleEntry, true, 'the elastic waist is documented');
  assert.equal(stylingFacts(floral).experience.softMaterial, null, 'pointelle is not evidence of tactile comfort');
  const p = stylingFacts(chenille);
  const unknown = scoreMood({ top: p }, 'coccole');
  assert.match(unknown.reasons.join(' '), /suggerisce.*confermare/);
  assert.ok(scoreMood({ top: { ...p, experience: { ...p.experience, comfortable: false } } }, 'coccole').total < 0, 'the user can disagree with the material inference');
});

test('comfort and ease use independent answers, with fewer layers an ease preference', () => {
  const original = stylingFacts(chenille), p = { ...original, experience: { ...original.experience, comfortable: true, easy: false } };
  assert.ok(scoreMood({ top: p }, 'coccole').total > 0);
  assert.ok(scoreMood({ top: p }, 'energie').total < 0);
  assert.ok(scoreMood({ top: p }, 'energie').total > scoreMood({ top: p, under: stylingFacts(floral) }, 'energie').total);
  assert.equal(scoreMood({ top: p }, 'tranquilla').total, 0, 'neutral is not secretly a comfort mode');
});

test('each mood keeps weather suitability in all three interpretations and low attention stays quiet', () => {
  for (const weather of ['hot', 'rainy', 'cold']) for (const mood of MOODS) {
    const t = composeTrio(presetConditions(weather), { mood: mood.id, seed: 16 });
    assert.ok(t, `${weather} / ${mood.id}`);
    for (const r of Object.values(t)) {
      assert.ok(r.reasons.length && r.pieces.every(p => GARMENTS[p.id]));
      assert.ok(Math.abs(r.warmth.total - r.warmth.target) <= 1.5, `${weather} / ${mood.id}: warmth`);
      if (weather === 'hot') assert.equal(r.recipe.outerwearId, 'none');
      if (weather === 'cold') assert.notEqual(r.recipe.outerwearId, 'none');
      if (weather === 'rainy') assert.notEqual(stylingFacts(r.recipe.shoesId).rain, 'avoid');
    }
  }
  const c = presetConditions('mild'), quiet = composeTrio(c, { mood: 'invisibile', seed: 16 }), loud = composeTrio(c, { mood: 'notare', seed: 16 });
  assert.ok(Math.max(...Object.values(quiet).map(r => r.boldness)) < Math.min(...Object.values(loud).map(r => r.boldness)), 'none of the quiet interpretations becomes the loud third look');
  assert.equal(new Set(Object.values(quiet).map(r => JSON.stringify(r.recipe))).size, 3);
});

test('personal experience can be recorded in garment data after a conversation here', () => {
  const known = experienceFacts({ styling: { experience: { source: 'user', comfortable: false, easy: true } } });
  assert.equal(known.comfortable, false); assert.equal(known.easy, true);
  const unknown = experienceFacts({ styling: { experience: { comfortable: 'probably' } } });
  assert.equal(unknown.comfortable, null);
});
