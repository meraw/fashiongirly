import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { HAIRSTYLES } from '../src/hair/catalog.js';
import { clothFor, displayName } from '../src/doll/picker.js';
import { suitedToday } from '../src/style/stylist.js';
import { colourFamily, coloursOf, warmthBand, COLOURS, WARMTH } from '../src/doll/wardrobe-page.js';
import { stylingFacts, readColour } from '../src/style/facts.js';
import { presetConditions } from '../src/weather/conditions.js';

// The studio in a page of its own; it is closed when the test ends, passed or failed, so no timer outlives it.
async function studio(t, hash) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: `https://example.com/${hash}` }), d = dom.window.document;
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null, now: () => new Date(2026, 9, 11, 9).getTime() });
  let open = true;
  const close = () => { if (!open) return; open = false; app.dispose(); dom.window.close(); };
  t.after(close);
  return { dom, d, app, close };
}
const SLOTS = ['hair', 'top', 'under', 'bottom', 'shoes', 'outerwear', 'dress'];

test('Dress her: each slot is a chip with the cloth and name of what she wears, and the dropdowns are put away', async t => {
  const s = await studio(t, '#dress'), d = s.d;
  for (const slot of SLOTS) {
    const chip = d.getElementById(`${slot}-chip`), select = d.getElementById(`${slot}-select`);
    assert.ok(chip, `${slot}: a chip`); assert.equal(select.hidden, true, `${slot}: its dropdown is put away`);
    assert.equal(chip.querySelector('.slot-name').textContent, displayName(select.selectedOptions[0].textContent), `${slot}: the chip names what she wears`);
    assert.equal(chip.getAttribute('aria-haspopup'), 'dialog');
    assert.ok(d.querySelector(`label[for=${slot}-chip]`), `${slot}: its label names the chip`);
  }
  assert.match(d.getElementById('top-chip').getAttribute('aria-label'), /^Top: /);
  // The built-in study pieces show the colours she wears them in; the hair shows its style.
  assert.ok(!d.querySelector('#top-chip .slot-cloth').classList.contains('empty'));
  assert.match(clothFor('top-select', 'classic', s.app.getRecipe()), new RegExp(s.app.getRecipe().sweater));
  assert.ok(d.querySelector('#hair-chip .slot-cloth').classList.contains('hair'));
  assert.ok(d.querySelector('#outerwear-chip .slot-cloth').classList.contains('empty'), 'no outerwear: an empty swatch');
  s.close();
});

test('a tap on a slot opens its pieces as swatches, and a tap on one puts it on her', async t => {
  const s = await studio(t, '#dress'), d = s.d, picker = d.getElementById('picker');
  assert.ok(!picker.hasAttribute('open'));
  d.getElementById('shoes-chip').click();
  assert.ok(picker.hasAttribute('open')); assert.equal(d.getElementById('picker-title').textContent, 'Choose her shoes');
  const pieces = [...picker.querySelectorAll('.piece')], select = d.getElementById('shoes-select');
  assert.equal(pieces.length, select.options.length, 'every pair, as the dropdown had them');
  assert.equal(pieces.at(-1).dataset.value, 'classic', 'the built-in loafers last');
  assert.deepEqual(pieces.filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.dataset.value), [s.app.getRecipe().shoesId]);
  const names = pieces.slice(0, -1).map(b => b.textContent);
  assert.deepEqual(names, [...names].sort((a, b) => a.localeCompare(b)), 'her own shoes by name');
  for (const b of pieces) assert.ok(!b.querySelector('.piece-swatch').classList.contains('empty'), `${b.dataset.value} shows its cloth`);
  const pair = pieces.find(b => b.dataset.value !== 'classic' && b.getAttribute('aria-pressed') !== 'true');
  pair.click();
  assert.equal(s.app.getRecipe().shoesId, pair.dataset.value, 'she wears them');
  assert.ok(!picker.hasAttribute('open'), 'the picker closes');
  assert.equal(d.querySelector('#shoes-chip .slot-name').textContent, pair.textContent, 'the chip names them as the picker did');
  assert.match(d.getElementById('message').textContent, /shoes/i, 'the page says what changed, as it did for the dropdown');
  // Nothing first: no outerwear, then her coats and jackets.
  d.getElementById('outerwear-chip').click();
  assert.equal(picker.querySelector('.piece').dataset.value, 'none');
  assert.ok(picker.querySelector('.piece .piece-swatch').classList.contains('empty'));
  const coat = [...picker.querySelectorAll('.piece')].find(b => GARMENTS[b.dataset.value]?.slot === 'outerwear');
  coat.click(); assert.equal(s.app.getRecipe().outerwearId, coat.dataset.value);
  assert.equal(d.getElementById('outerwear-options').hidden, false, 'her jacket\'s own options come out, as before');
  // A dress, then a top: the top takes the dress off, as the dropdowns did.
  d.getElementById('dress-chip').click();
  const dress = [...picker.querySelectorAll('.piece')].find(b => b.dataset.value !== 'none'); dress.click();
  assert.equal(s.app.getRecipe().dressId, dress.dataset.value);
  d.getElementById('top-chip').click();
  const top = [...picker.querySelectorAll('.piece')].find(b => GARMENTS[b.dataset.value]?.slot === 'top'); top.click();
  assert.equal(s.app.getRecipe().topId, top.dataset.value); assert.equal(s.app.getRecipe().dressId, 'none');
  s.close();
});

test('her hair is chosen from drawings of each style, and the picker closes without a choice too', async t => {
  const s = await studio(t, '#dress'), d = s.d, picker = d.getElementById('picker');
  d.getElementById('hair-chip').click();
  const styles = [...picker.querySelectorAll('.piece')];
  assert.deepEqual(styles.map(b => b.dataset.value), HAIRSTYLES.map(h => h.id), 'every style, in the catalog\'s order');
  assert.ok(styles.every(b => b.querySelector('.piece-swatch').classList.contains('hair')));
  assert.equal(new Set(HAIRSTYLES.map(h => clothFor('hair-select', h.id))).size, HAIRSTYLES.length, 'a different drawing for each style');
  styles.find(b => b.dataset.value === 'side-braid').click();
  assert.equal(s.app.getRecipe().hairId, 'side-braid');
  d.getElementById('hair-chip').click(); assert.ok(picker.hasAttribute('open'));
  picker.querySelector('.picker-close').click();
  assert.ok(!picker.hasAttribute('open')); assert.equal(s.app.getRecipe().hairId, 'side-braid', 'closing changes nothing');
  assert.equal(clothFor('top-select', 'none'), null);
  assert.equal(displayName('Lapis blue linen button-down shirt · study'), 'Lapis blue linen button-down shirt');
  assert.equal(displayName('Bomboogie black teddy jacket with detachable hood · reference study'), 'Bomboogie black teddy jacket with detachable hood');
  assert.match(clothFor('bottom-select', 'classic', { trousers: '#283c59' }), /#283c59/);
  s.close();
  assert.equal(d.getElementById('picker'), null, 'the picker leaves with the page');
});

test('the chips follow her outfit when it changes elsewhere, and a slot that does not apply is put away', async t => {
  const s = await studio(t, '#dress'), d = s.d;
  const shoes = Object.values(GARMENTS).find(g => g.slot === 'shoes');
  d.querySelector(`#wardrobe-groups .piece[data-id="${shoes.id}"]`).click();
  assert.equal(d.querySelector('#shoes-chip .slot-name').textContent, displayName(d.getElementById('shoes-select').selectedOptions[0].textContent));
  assert.equal(d.getElementById('shoes-select').value, shoes.id);
  const plainTop = Object.values(GARMENTS).find(g => g.slot === 'top' && !g.layering?.overTop), cardigan = Object.values(GARMENTS).find(g => g.layering?.overTop);
  d.querySelector(`#wardrobe-groups .piece[data-id="${plainTop.id}"]`).click();
  assert.equal(d.getElementById('under-field').hidden, true, 'nothing goes under a plain top');
  d.querySelector(`#wardrobe-groups .piece[data-id="${cardigan.id}"]`).click();
  assert.equal(d.getElementById('under-field').hidden, false); assert.equal(d.getElementById('under-chip').disabled, false);
  s.close();
});

test('colours sort into families as clothes are sorted, and warmth into light, mid and warm', () => {
  const family = word => colourFamily(readColour(word));
  assert.deepEqual(['black', 'navy', 'dark indigo', 'cream', 'ecru', 'white', 'charcoal', 'grey', 'silver', 'beige', 'taupe', 'brown'].map(family),
    ['black', 'blue', 'blue', 'white', 'white', 'white', 'grey', 'grey', 'grey', 'brown', 'brown', 'brown']);
  assert.deepEqual(['red', 'raspberry', 'soft pink', 'coral', 'rust', 'ochre', 'yellow', 'peach', 'olive', 'sage', 'mint', 'teal', 'sky blue', 'lilac', 'lavender', 'mauve'].map(family),
    ['red', 'red', 'red', 'red', 'orange', 'orange', 'orange', 'orange', 'green', 'green', 'green', 'blue', 'blue', 'purple', 'purple', 'purple']);
  assert.equal(COLOURS.length, new Set(COLOURS.map(c => c[0])).size);
  // A piece's families are those of its two main colours.
  const lapis = Object.values(GARMENTS).find(g => /lapis/i.test(g.name)), leather = GARMENTS['desigual-black-faux-leather-jacket-v1'];
  assert.deepEqual([...coloursOf(lapis.id)], ['blue']); assert.deepEqual([...coloursOf(leather.id)], ['black']);
  for (const g of Object.values(GARMENTS)) assert.ok(coloursOf(g.id).size >= 1, `${g.name} has a colour`);
  assert.deepEqual([1, 2, 3, 4, null].map(warmthBand), ['light', 'mid', 'warm', 'warm', null]);
  assert.deepEqual(WARMTH.map(w => w[0]), ['light', 'mid', 'warm']);
});

test('what suits the day: the pieces she would consider, in an outfit as warm as the day asks', () => {
  const facts = id => stylingFacts(id), all = Object.values(GARMENTS);
  const hot = suitedToday(presetConditions('hot')), freezing = suitedToday(presetConditions('freezing')), rainy = suitedToday(presetConditions('pouring'));
  assert.ok(!all.some(g => g.slot === 'outerwear' && hot.has(g.id)), 'no jacket on a hot day');
  assert.ok(all.some(g => facts(g.id).open && hot.has(g.id)), 'open shoes on a hot day');
  assert.ok(!all.some(g => facts(g.id).open && freezing.has(g.id)), 'never open shoes when it is freezing');
  assert.ok(all.some(g => g.slot === 'outerwear' && freezing.has(g.id)));
  for (const g of all.filter(g => g.slot === 'top' && facts(g.id).warmth >= 4)) assert.ok(!hot.has(g.id), `${g.name} is too warm for a hot day`);
  for (const g of all.filter(g => g.slot === 'shoes' && facts(g.id).rain === 'avoid')) assert.ok(!rainy.has(g.id), `${g.name} stays in out of the rain`);
  for (const set of [hot, freezing, rainy]) for (const id of set) assert.ok(GARMENTS[id], 'only real pieces');
  assert.ok(hot.size > 10 && freezing.size > 10 && rainy.size > 10, 'still plenty to choose from');
});

test('the wardrobe filters by the day, warmth and colour together, puts away empty kinds and keeps her outfit marked', async t => {
  const s = await studio(t, '#wardrobe'), d = s.d, all = () => [...d.querySelectorAll('#wardrobe-groups .piece')], shown = () => all().filter(b => !b.hidden);
  assert.equal(shown().length, Object.keys(GARMENTS).length, 'everything at first');
  assert.equal(d.querySelector('.filter-status').hidden, true);
  // The day's filter waits for the weather.
  const day = [...d.querySelectorAll('.filter-chip')].find(b => /Suits today/.test(b.textContent));
  assert.equal(day.closest('.filter-chips').hidden, true, 'no weather yet, no day filter');
  d.getElementById('today-manual').open = true;
  [...d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Hot').click();
  assert.equal(day.closest('.filter-chips').hidden, false); assert.match(day.textContent, /28°/);
  day.click(); assert.equal(day.getAttribute('aria-pressed'), 'true');
  const hot = suitedToday(presetConditions('hot'));
  assert.deepEqual(shown().map(b => b.dataset.id).sort(), all().map(b => b.dataset.id).filter(id => hot.has(id)).sort());
  const jackets = d.querySelector('#wardrobe-groups .piece[data-slot=outerwear]').closest('.wardrobe-group');
  assert.equal(jackets.hidden, true, 'no coats or jackets on a hot day: the kind is put away');
  // Warmth and colour as well: every filter that is on must pass.
  d.querySelector('.filter-chip[data-warmth=light]').click();
  d.querySelector('.filter-colour[data-colour=blue]').click();
  for (const b of shown()) {
    const id = b.dataset.id;
    assert.ok(hot.has(id) && warmthBand(stylingFacts(id).warmth) === 'light' && coloursOf(id).has('blue'), id);
  }
  assert.ok(shown().length > 0); assert.match(d.querySelector('.filter-status').textContent, /match/);
  for (const g of d.querySelectorAll('.wardrobe-group')) if (!g.hidden) assert.match(g.querySelector('h3').textContent, new RegExp(`· ${[...g.querySelectorAll('.piece')].filter(b => !b.hidden).length}$`));
  // A second tap on a filter takes it off; a colour with nothing to show says so.
  d.querySelector('.filter-colour[data-colour=blue]').click();
  assert.equal(d.querySelector('.filter-colour[data-colour=blue]').getAttribute('aria-pressed'), 'false');
  d.querySelector('.filter-chip[data-warmth=warm]').click();
  assert.equal(d.querySelector('.filter-chip[data-warmth=light]').getAttribute('aria-pressed'), 'false', 'one warmth at a time');
  // What she wears stays marked, shown or not, and clearing shows everything again.
  const worn = s.app.getRecipe().shoesId;
  assert.equal(d.querySelector(`#wardrobe-groups .piece[data-id="${worn}"]`)?.getAttribute('aria-pressed') ?? 'true', 'true');
  d.querySelector('.filter-clear').click();
  assert.equal(shown().length, Object.keys(GARMENTS).length); assert.equal(d.querySelector('.filter-status').hidden, true);
  s.close();
});
