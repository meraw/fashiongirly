import test from 'node:test';
import assert from 'node:assert/strict';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { stylingFacts, wardrobe, readColour } from '../src/style/facts.js';
import { composeOutfit, needsFor } from '../src/style/stylist.js';
import { learn, cleanLearned, learnedBonus } from '../src/style/taste.js';
import { PRESETS, presetConditions } from '../src/weather/conditions.js';

test('every garment gives the stylist readable facts on one warmth scale', () => {
  for (const g of Object.values(GARMENTS)) {
    const f = stylingFacts(g);
    assert.equal(f.slot, g.slot, g.id);
    // Warmth: 1 light, 2 mid, 3 warm, 4 very warm (tests/styling.test.js checks the records themselves).
    assert.ok([1, 2, 3, 4].includes(f.warmth), `${g.id} reads as a warmth from 1 to 4`);
    assert.ok(f.warmthBasis, `${g.id} says what its warmth is based on`);
    assert.ok(f.palette.length && f.colours.length, `${g.id} has a palette the stylist can read`);
    assert.ok([null, 'ok', 'avoid'].includes(f.rain), g.id);
    if (f.open) assert.equal(f.rain, 'avoid', `${g.id}: open shoes are not for rain`);
  }
  const w = wardrobe();
  assert.ok(w.top.length && w.bottom.length && w.shoes.length && w.outerwear.length && w.dress.length);
  assert.ok(!Object.values(w).flat().some(f => f.id === 'classic'), 'the built-in study pieces are not offered');
});

test('colour words read as colours, with quiet neutrals told apart', () => {
  assert.ok(Math.abs(readColour('raspberry pink').h - 345) < 1, 'the last colour word wins');
  assert.ok(readColour('muted blue-green emerald (dyed over powder blue)').h > 140, 'brackets are notes, not colours');
  assert.equal(readColour('tan stitching').accent, true);
  assert.equal(readColour('mystery'), null);
  const jeans = stylingFacts('levis-ribcage-straight-ankle-jeans-v1');
  assert.ok(jeans.main.every(c => c.quiet), 'denim blue goes with anything');
});

const look = (r, slot) => r.pieces.find(p => p.slot === slot);
const facts = id => stylingFacts(id);

test('she dresses for every kind of weather with a recipe the studio accepts unchanged', () => {
  for (const preset of PRESETS) for (const seed of [1, 2, 3, 4]) {
    const c = presetConditions(preset.id, '2026-10-09'), needs = needsFor(c), r = composeOutfit(c, { seed });
    const label = `${preset.id} seed ${seed}`;
    assert.ok(r, label);
    assert.deepEqual(cleanRecipe(r.recipe), r.recipe, `${label}: a valid recipe`);
    assert.ok(Math.abs(r.warmth.total - r.warmth.target) <= 1.5, `${label}: warm enough and not too warm (${r.warmth.total} for ${r.warmth.target})`);
    assert.ok(r.reasons.length >= 2, `${label}: she says why`);
    const outer = look(r, 'outerwear'), shoes = facts(r.recipe.shoesId), dress = look(r, 'dress');
    if (needs.outer === 'required') assert.ok(outer, `${label}: a jacket when it is cold or wet`);
    if (needs.outer === 'none') assert.ok(!outer, `${label}: no jacket when it is warm`);
    if (needs.rainy) { assert.notEqual(shoes.rain, 'avoid', `${label}: shoes for the wet`); if (outer) assert.notEqual(facts(outer.id).rain, 'avoid', `${label}: a jacket for the wet`); }
    if (shoes.open) assert.ok(needs.openShoes, `${label}: open shoes only when warm and dry`);
    if (dress && facts(dress.id).bareLegs) assert.ok(needs.bareLegs, `${label}: bare legs only when mild`);
    if (needs.windy || needs.rainy) assert.match(r.recipe.hairId, /ponytail|bun|braid/, `${label}: hair tied back`);
    if (r.recipe.outerwearOpen) assert.ok(GARMENTS[r.recipe.outerwearId].layering.openByDefault && !needs.windy && !needs.rainy, `${label}: open only when worn open and calm`);
  }
});

test('the same seed gives the same look; another seed or idea gives a new one', () => {
  const c = presetConditions('mild');
  assert.deepEqual(composeOutfit(c, { seed: 7 }).recipe, composeOutfit(c, { seed: 7 }).recipe);
  const first = composeOutfit(c, { seed: 7 }), next = composeOutfit(c, { seed: 8, shownToday: [first.recipe] });
  const lead = r => r.recipe.dressId !== 'none' ? r.recipe.dressId : r.recipe.topId;
  assert.notEqual(lead(next), lead(first), 'another idea changes the top or dress');
});

test('over a week she does not repeat a top or dress', () => {
  const recent = [], leads = new Set();
  for (let day = 0; day < 7; day++) {
    const r = composeOutfit(presetConditions(['mild', 'chilly', 'warm'][day % 3]), { seed: 100 + day, recent: [...recent] });
    const lead = r.recipe.dressId !== 'none' ? r.recipe.dressId : r.recipe.topId;
    assert.ok(!leads.has(lead), `day ${day}: ${lead} again`);
    leads.add(lead); recent.unshift(r.recipe);
  }
});

test('kept pieces stay, set-aside pieces go, and daring changes her choices', () => {
  const c = presetConditions('chilly');
  for (const seed of [1, 2, 3]) {
    const kept = composeOutfit(c, { seed, keep: { bottom: 'zara-cargo-joggers-v1', hair: 'side-braid', shoes: 'dr-martens-cow-slide-v1' } });
    assert.equal(kept.recipe.bottomId, 'zara-cargo-joggers-v1');
    assert.equal(kept.recipe.hairId, 'side-braid');
    assert.equal(kept.recipe.shoesId, 'dr-martens-cow-slide-v1', 'a kept piece is worn even if the weather would not choose it');
    assert.equal(kept.recipe.dressId, 'none', 'keeping bottoms rules out a dress');
    const noJacket = composeOutfit(presetConditions('cold'), { seed, keep: { outerwear: 'none' } });
    assert.equal(noJacket.recipe.outerwearId, 'none');
    const dress = composeOutfit(presetConditions('warm'), { seed, keep: { dress: 'desigual-ivory-lace-shift-dress-v1' } });
    assert.equal(dress.recipe.dressId, 'desigual-ivory-lace-shift-dress-v1');
  }
  const first = composeOutfit(c, { seed: 4 });
  const avoid = first.pieces.map(p => p.id);
  const other = composeOutfit(c, { seed: 4, avoid });
  for (const p of other.pieces) assert.ok(!avoid.includes(p.id), `${p.id} was set aside`);
  const easy = new Set(), bold = new Set();
  for (let seed = 1; seed <= 6; seed++) { easy.add(JSON.stringify(composeOutfit(c, { seed, daring: 0 }).recipe)); bold.add(JSON.stringify(composeOutfit(c, { seed, daring: 1 }).recipe)); }
  assert.notDeepEqual([...easy].sort(), [...bold].sort(), 'daring changes what she picks');
});

test('saved looks teach her; pieces set aside count against them', () => {
  let learned = learn(null, 'saved', ['a', 'b']);
  assert.ok(learnedBonus(learned, ['a', 'b']) > learnedBonus(learned, ['a', 'c']));
  learned = learn(learned, 'set-aside', ['c']);
  assert.ok(learnedBonus(learned, ['c']) < 0);
  for (let i = 0; i < 20; i++) learned = learn(learned, 'saved', ['a']);
  assert.equal(cleanLearned(learned).pieces.a, 3, 'learning is bounded');
  assert.deepEqual(cleanLearned('nonsense'), { pieces: {}, pairs: {} });
});

test('her picks build on the doll', () => {
  for (const [id, seed] of [['mild', 1], ['cold', 2], ['warm', 3], ['rainy', 4]]) {
    const r = composeOutfit(presetConditions(id), { seed });
    const outfit = makeOutfit(r.recipe);
    assert.ok(outfit.children.length > 0, `${id}: an outfit was built`);
    disposeObject(outfit);
  }
});
