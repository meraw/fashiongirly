import test from 'node:test';
import assert from 'node:assert/strict';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { makeOutfit, disposeObject } from '../src/doll/model.js';
import { stylingFacts, wardrobe, readColour, readBrand } from '../src/style/facts.js';
import { composeOutfit, needsFor, adjustOutfit, composeTrio, outfitOf, lookKey, lookPieces } from '../src/style/stylist.js';
import { learn, cleanLearned, learnedBonus, learnedFromLooks, LEARNED_CAP, boldness } from '../src/style/taste.js';
import { PRESETS, presetConditions, cleanConditions } from '../src/weather/conditions.js';

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

test('on a warm day she dresses light: a little cooler than the day asks rather than warmer', () => {
  // The user, 12 October 2026: the looks ran too warm. A jumper cannot come off on a warm afternoon.
  for (const feels of [19, 22, 25, 28]) for (const seed of [1, 2, 3, 4]) {
    const t = composeTrio(cleanConditions({ day: '2026-10-12', source: 'manual', feels }), { seed });
    for (const [k, r] of Object.entries(t)) assert.ok(r.warmth.total - r.warmth.target <= .75, `${feels}° seed ${seed}, ${k}: ${r.warmth.total} for ${r.warmth.target.toFixed(2)}`);
    assert.equal(t.pick.warmth.feels, feels, 'each look says what it was dressed for');
  }
});

test('a warm afternoon after a cool morning: a light jacket comes along, to take off', () => {
  const c = cleanConditions({ day: '2026-10-12', source: 'forecast', feels: 24, feelsMin: 12, feelsMax: 22, shade: 21, sun: 24 }), w = id => facts(id).warmth;
  assert.equal(needsFor(c).outer, 'layer');
  for (const seed of [1, 2, 3, 4]) {
    const r = composeOutfit(c, { seed }), { recipe } = r;
    assert.notEqual(recipe.outerwearId, 'none', `seed ${seed}: a jacket comes along`);
    assert.ok(w(recipe.outerwearId) <= 2, `seed ${seed}: a light one`);
    assert.ok(r.reasons.some(x => /12° in the cool of the day.*to take off/.test(x)), `seed ${seed}: she says why`);
    const body = recipe.dressId !== 'none' ? w(recipe.dressId) + .5 : w(recipe.topId) + (recipe.underTopId !== 'none' ? .5 * w(recipe.underTopId) : 0) + w(recipe.bottomId);
    assert.equal(r.warmth.total, body + (w(recipe.shoesId) - 2) * .5, `seed ${seed}: the jacket she carries does not count once it is off`);
  }
  assert.equal(needsFor({ ...c, feelsMin: 20 }).outer, 'none', 'warm from morning to evening: nothing to carry');
  assert.notEqual(needsFor({ ...c, rainChance: 80 }).outer, 'layer', 'in the rain a jacket is for the rain');
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
  // Daring is measured on the outfits: an easy pick is quieter than a bold one in the same weather, every time.
  for (const id of ['mild', 'chilly', 'warm', 'cold', 'rainy']) for (let seed = 1; seed <= 3; seed++) {
    const easy = composeOutfit(presetConditions(id), { seed, daring: 0 }), bold = composeOutfit(presetConditions(id), { seed, daring: 1 });
    assert.ok(easy.boldness < bold.boldness, `${id} seed ${seed}: easy ${easy.boldness.toFixed(2)} below bold ${bold.boldness.toFixed(2)}`);
  }
});

test('boldness reads colour and print: black is quiet, all pink and prints are bold', () => {
  const look = ids => ({ top: stylingFacts(ids[0]), bottom: stylingFacts(ids[1]), shoes: stylingFacts(ids[2]) });
  const black = boldness(look(['pull-bear-grey-chenille-high-neck-v1', 'mango-washed-black-v1', 'sam-edelman-front-zip-lug-boot-v1']));
  const pink = boldness(look(['pink-ditsy-floral-yoke-shirt-v1', 'nike-piped-track-pants-v1', 'adidas-superstar-pink-suede-v1']));
  assert.ok(black < .1, `grey and black are quiet (${black})`);
  assert.ok(pink > black + .5, `head-to-toe pink is bold (${pink})`);
});

test('bolder and easier adjustments change as little as possible, and keep kept pieces', () => {
  for (const id of ['mild', 'chilly', 'rainy']) for (const seed of [1, 2]) {
    const c = presetConditions(id), r = composeOutfit(c, { seed }).recipe, now = boldness(outfitOf(r));
    for (const dir of [1, -1]) {
      const a = adjustOutfit(c, r, dir, { seed });
      if (!a) continue;
      assert.ok((a.boldness - now) * dir > 0, `${id} ${seed}: ${dir > 0 ? 'bolder' : 'easier'}`);
      assert.ok(a.changed.length >= 1 && a.changed.length <= 2, `${id} ${seed}: one or two pieces change`);
      assert.equal(a.recipe.hairId, r.hairId, 'her hair stays');
      assert.deepEqual(cleanRecipe(a.recipe), a.recipe);
    }
    const kept = adjustOutfit(c, r, 1, { seed, keep: { shoes: r.shoesId, bottom: r.bottomId } });
    if (kept) { assert.equal(kept.recipe.shoesId, r.shoesId); if (r.dressId === 'none') assert.equal(kept.recipe.bottomId, r.bottomId); }
  }
});

test('each day has three fixed looks: her pick, a bolder one and an easier one', () => {
  for (const id of PRESETS.map(p => p.id)) for (const seed of [1, 2]) {
    const c = presetConditions(id, '2026-10-09'), t = composeTrio(c, { seed });
    assert.ok(t.pick && t.bolder && t.easier, `${id} ${seed}: three looks`);
    assert.ok(t.bolder.boldness > t.pick.boldness, `${id} ${seed}: bolder (${t.bolder.boldness.toFixed(2)}) is bolder than her pick (${t.pick.boldness.toFixed(2)})`);
    assert.ok(t.easier.boldness < t.pick.boldness, `${id} ${seed}: easier (${t.easier.boldness.toFixed(2)}) is quieter than her pick`);
    for (const r of [t.pick, t.bolder, t.easier]) assert.deepEqual(cleanRecipe(r.recipe), r.recipe);
    assert.deepEqual(composeTrio(c, { seed }).bolder.recipe, t.bolder.recipe, 'the same day gives the same three');
  }
});

test('brands are read as houses: a label and its own lines are one brand, and an unknown one stays unknown', () => {
  assert.equal(facts('tommy-green-cable-sweater-v1').brand, 'tommy');
  assert.equal(facts('tommy-jeans-red-varsity-crest-jumper-v1').brand, 'tommy', 'Tommy Jeans is Tommy Hilfiger');
  assert.equal(facts('adidas-originals-cropped-hoodie-black-v1').brand, facts('adidas-superstar-pink-suede-v1').brand, 'adidas Originals is adidas');
  assert.equal(facts('desigual-painted-floral-knit-jumper-v1').brand, 'desigual', '"not stated; likely Desigual" is read as Desigual');
  assert.equal(facts('levis-94-wide-leg-v1').brand, 'levis');
  assert.equal(facts('pink-ditsy-floral-yoke-shirt-v1').brand, null, 'no brand recorded');
  assert.equal(readBrand({ brandAsProvided: 'not stated (a licensed Disney Mickey Mouse print)' }), null, 'a licensed print is not a brand');
});

test('she never pairs two pieces from the same brand, unless the user keeps them', () => {
  // The user, 12 October 2026: two Tommy Jeans pieces in one look, two Desigual pieces in another; it never works.
  const brands = r => r.pieces.map(p => facts(p.id).brand).filter(Boolean);
  for (const preset of PRESETS) for (const seed of [1, 2, 3, 4, 5]) {
    const c = presetConditions(preset.id, '2026-10-12'), t = composeTrio(c, { seed }), looks = [t.pick, t.bolder, t.easier];
    looks.push(composeOutfit(c, { seed: seed + 7, shownToday: looks.map(r => r.recipe) }));
    for (const r of looks) assert.equal(new Set(brands(r)).size, brands(r).length, `${preset.id} seed ${seed}: ${brands(r).join(', ')}`);
  }
  const kept = composeOutfit(presetConditions('mild'), { seed: 1, keep: { top: 'desigual-painted-floral-knit-jumper-v1', outerwear: 'desigual-black-faux-leather-jacket-v1' } });
  assert.equal(kept.recipe.topId, 'desigual-painted-floral-knit-jumper-v1');
  assert.equal(kept.recipe.outerwearId, 'desigual-black-faux-leather-jacket-v1', 'kept pieces stay');
  assert.equal(brands(kept).filter(b => b === 'desigual').length, 2, 'and nothing more from Desigual joins them');
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

test('My looks teach her once per look: a look saved twice counts once, a removed one not at all', () => {
  const a = ['jacket', 'jeans', 'shoes'], b = ['dress', 'boots'];
  assert.deepEqual(learnedFromLooks([a, a]), learnedFromLooks([a]), 'the same look twice is one look');
  assert.deepEqual(learnedFromLooks([[...a].reverse()]), learnedFromLooks([a]), 'whatever the order of its pieces');
  assert.deepEqual(learnedFromLooks([b]), learnedFromLooks([a, b].slice(1)), 'removing a look takes it away');
  assert.deepEqual(learnedFromLooks([]), { pieces: {}, pairs: {} });
  assert.ok(learnedBonus(learnedFromLooks([a]), ['jacket', 'jeans', 'top']) > 0);
});

test('a saved look is a nudge: pieces worn this week earn nothing, and it never outweighs a repeat', () => {
  const learned = learnedFromLooks([['jacket', 'jeans', 'shoes'], ['jacket', 'jeans', 'shoes', 'top']]);
  const all = learnedBonus(learned, ['jacket', 'jeans', 'shoes', 'top']);
  assert.ok(all > 0 && all <= LEARNED_CAP, `capped at ${LEARNED_CAP}: ${all}`);
  assert.equal(learnedBonus(learned, ['jacket', 'jeans', 'shoes'], new Set(['jacket', 'jeans', 'shoes'])), 0, 'all worn this week');
  const one = learnedFromLooks([['jacket', 'jeans', 'shoes']]);
  assert.equal(learnedBonus(one, ['jacket', 'jeans', 'shoes'], new Set(['jacket'])), learnedBonus(one, ['jeans', 'shoes']), 'the worn jacket and its pairs earn nothing');
  assert.ok(LEARNED_CAP < .9, 'less than wearing one piece of yesterday again costs');
  // In a run of days, the pieces she wore yesterday come back no more often for being in a saved look.
  const conditions = presetConditions('chilly', '2026-11-03');
  for (const seed of [1, 2, 3, 4, 5]) {
    const yesterday = composeOutfit(presetConditions('chilly', '2026-11-02'), { seed: seed + 50 }).recipe;
    const saved = learnedFromLooks([lookPieces(yesterday), lookPieces(yesterday)]);
    const without = composeOutfit(conditions, { seed, recent: [yesterday] }).recipe, withLook = composeOutfit(conditions, { seed, recent: [yesterday], learned: saved }).recipe;
    assert.equal(lookKey(withLook), lookKey(without), `seed ${seed}: a look worn yesterday changes nothing today by being saved`);
  }
});

test('a saved look is not suggested exactly within its week', () => {
  for (const [id, seed] of [['mild', 1], ['chilly', 2], ['cold', 3], ['rainy', 4]]) {
    const conditions = presetConditions(id, '2026-11-03'), first = composeOutfit(conditions, { seed });
    const blocked = lookKey(first.recipe), again = composeOutfit(conditions, { seed, notExactly: [blocked] });
    assert.ok(again && lookKey(again.recipe) !== blocked, `${id}: she chooses another look`);
    const trio = composeTrio(conditions, { seed, notExactly: [blocked] });
    for (const key of ['pick', 'bolder', 'easier']) assert.notEqual(lookKey(trio[key].recipe), blocked, `${id}: not as ${key} either`);
  }
  assert.equal(lookKey(cleanRecipe({ topId: 'classic', hairId: 'high-bun' })), lookKey(cleanRecipe({})), 'hair is not part of a look');
});

test('her picks build on the doll', () => {
  for (const [id, seed] of [['mild', 1], ['cold', 2], ['warm', 3], ['rainy', 4]]) {
    const r = composeOutfit(presetConditions(id), { seed });
    const outfit = makeOutfit(r.recipe);
    assert.ok(outfit.children.length > 0, `${id}: an outfit was built`);
    disposeObject(outfit);
  }
});
