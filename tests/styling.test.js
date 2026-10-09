import test from 'node:test';
import assert from 'node:assert/strict';
import { GARMENTS } from '../src/wardrobe/catalog.js';

// Styling facts for later outfit selection, in every slot. Tops, bottoms, shoes and dresses keep them flat, with warmth
// from 1 (light) to 4 (very warm); outerwear sorts them by where they come from (observed, user, inferred).
const fact = (st, key) => st[key] ?? st.observed?.[key] ?? st.user?.[key] ?? st.inferred?.[key];
const text = v => typeof v === 'string' && v.trim().length > 0;

test('every garment describes its warmth, coverage, colour, pattern, silhouette and layering, with its unknowns listed', () => {
  for (const [id, g] of Object.entries(GARMENTS)) {
    const st = g.styling; assert.ok(st, `${id} has styling facts`);
    for (const key of ['silhouette', 'pattern', 'material', 'weather', 'layering']) assert.ok(text(fact(st, key)), `${id} ${key}`);
    const palette = fact(st, 'palette'); assert.ok(Array.isArray(palette) && palette.length && palette.every(text), `${id} palette`);
    const coverage = fact(st, 'coverage');
    assert.ok(text(coverage) || (coverage && Object.values(coverage).length && Object.values(coverage).every(text)), `${id} coverage`);
    if (g.slot === 'outerwear') assert.ok(text(st.inferred?.warmth ?? st.user?.warmth), `${id} warmth, with its basis`);
    else assert.ok([1, 2, 3, 4].includes(st.warmth) && /^(user|inferred)/.test(st.warmthBasis), `${id} warmth and its basis`);
    // Unknowns are listed, not filled in: an empty list says nothing is known to be missing.
    const unknown = st.unknown ?? st.inferred?.unknown; assert.ok(Array.isArray(unknown) && unknown.every(text), `${id} unknown list`);
  }
});

test('layering notes agree with the layering flags the outfit builder uses', () => {
  for (const [id, g] of Object.entries(GARMENTS)) {
    const note = g.styling.layering, L = g.layering ?? {};
    if (L.overTop) assert.match(note, /over another/, `${id}: worn over another top`);
    if (L.underTop) assert.match(note, /under the striped cardigan/, `${id}: under a top worn over another`);
    if (L.tucksIntoSkirt) assert.match(note, /over the skirt it is tucked in/, `${id}: tucked into the skirt`);
    if (L.tucksIn) assert.match(note, /tucked into every pair of trousers/, `${id}: tucked in`);
    if (g.slot === 'top' && !L.tucksIn) assert.match(note, L.coversWaistband ? /hangs over every waistband/ : /waistband and the skirt's bow show/, `${id}: hem over the waistband`);
    if (L.bareArmBelow) assert.match(note, /bare below/, `${id}: short sleeves`);
    if (L.replacesTop) assert.match(note, /instead of a top and bottoms/, `${id}: a dress`);
    if (g.slot === 'outerwear') assert.match(note, L.canOpen ? /open/ : /cannot be shown open/, `${id}: open or closed`);
    if (L.detachable) assert.match(note, /can be taken out/, `${id}: detachable part`);
  }
});
