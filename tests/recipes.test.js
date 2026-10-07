import test from 'node:test';
import assert from 'node:assert/strict';
import { LOOKS, clone, interpretDescription, normalizeLook } from '../src/recipes.js';
import { renderCharacter } from '../src/illustration.js';
test('description changes cardigan shape without mutating the original recipe', () => {
  const look = clone(LOOKS[0]), original = look.garments.find(g => g.id === 'cardigan');
  const before = JSON.stringify(look);
  const result = interpretDescription(original, 'Burgundy, cropped, enormous sleeves, closed');
  assert.equal(result.garment.color, '#733b54'); assert.equal(result.garment.length, .15);
  assert.equal(result.garment.sleeves, 1); assert.equal(result.garment.open, false);
  assert.equal(JSON.stringify(look), before);
  assert.notEqual(renderCharacter([original]), renderCharacter([result.garment]));
});
test('unsupported descriptions report no change and use whole words', () => {
  const g = LOOKS[0].garments[1];
  const result = interpretDescription(g, 'add embroidered dragons and pockets');
  assert.equal(result.changes.length, 0); assert.deepEqual(result.garment, g);
  assert.equal(interpretDescription(g, 'incredible').changes.length, 0);
});
test('hem and sleeve instructions respect the garment family', () => {
  const skirt = LOOKS[0].garments[1];
  const result = interpretDescription(skirt, 'maxi, balloon sleeves');
  assert.equal(result.garment.length, .95); assert.equal(result.garment.sleeves, skirt.sleeves);
  assert.deepEqual(result.changes, ['maxi']);
});
test('stored recipes reject invalid families and normalize unsafe values', () => {
  const look = clone(LOOKS[0]); look.garments[0].color = 'url(https://example.com)'; look.garments[0].volume = 10;
  const clean = normalizeLook(look); assert.equal(clean.garments[0].color, '#f0e5d0'); assert.equal(clean.garments[0].volume, 1);
  look.garments[0].family = 'invalid'; assert.throws(() => normalizeLook(look));
});
test('every look renders photo-free in its authored layer order', () => {
  for (const look of LOOKS) {
    const svg = renderCharacter(look.garments);
    assert.ok(svg.startsWith('<svg')); assert.ok(!svg.includes('<image')); assert.ok(!svg.includes('NaN'));
    let previous = -1;
    for (const g of look.garments) { const index = svg.indexOf(`data-garment="${g.id}"`); assert.ok(index > previous); previous = index; }
  }
});
test('SVG escapes untrusted accessible text', () => {
  const g = clone(LOOKS[0].garments[0]); g.id = '\"><script>alert(1)</script>';
  const svg = renderCharacter([g], { title: '<script>bad</script>' });
  assert.ok(!svg.includes('<script>')); assert.ok(svg.includes('&lt;script&gt;'));
});
