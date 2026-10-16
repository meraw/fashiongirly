import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { createWardrobe, REMOVED_KEY } from '../src/wardrobe/ownership.js';
import { cleanRecipe, OUTFITS } from '../src/doll/recipe.js';
import { TODAY_KEY } from '../src/today/today.js';

const top = Object.values(GARMENTS).find(g => g.slot === 'top' && g.layering?.underTop);
async function studio(t, entries = {}) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/#wardrobe' });
  const d = dom.window.document, storage = dom.window.localStorage;
  for (const [key, value] of Object.entries(entries)) storage.setItem(key, JSON.stringify(value));
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new dom.window.Event('close')); };
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null, now: () => new Date(2026, 9, 16, 9).getTime() });
  await app.today.ready;
  d.querySelector('[data-mood=tranquilla]').click();
  t.after(() => { app.dispose(); dom.window.close(); });
  const beginRemoval = id => d.querySelector(`.piece[data-id="${id}"]`).parentElement.querySelector('.piece-remove').click();
  const confirm = () => d.querySelector('#remove-piece-dialog button').click();
  return { d, app, storage, beginRemoval, confirm };
}
const excludes = (value, id) => assert.ok(!JSON.stringify(value).includes(id), `${id} must stay removed`);

test('removing a worn piece requires confirmation, updates every selector and can be restored after reload', async t => {
  const s = await studio(t), { d, app } = s;
  const piece = d.querySelector(`.piece[data-id="${top.id}"]`), remove = piece.parentElement.querySelector('.piece-remove');
  assert.ok(remove.hidden);
  d.querySelector('.wardrobe-manage').click(); assert.equal(remove.hidden, false);
  piece.click(); assert.equal(app.getRecipe().topId, top.id);
  s.beginRemoval(top.id);
  assert.ok(d.querySelector('#remove-piece-dialog').open);
  d.querySelector('#remove-piece-dialog button:last-child').click();
  assert.equal(app.getRecipe().topId, top.id); assert.equal(s.storage.getItem(REMOVED_KEY), null);
  s.beginRemoval(top.id); s.confirm();
  assert.equal(app.getRecipe().topId, 'classic'); assert.equal(app.getRecipe().knit, true);
  assert.equal(piece.hidden, true); assert.equal(piece.parentElement.hidden, true);
  assert.deepEqual(JSON.parse(s.storage.getItem(REMOVED_KEY)), [top.id]);
  for (const slot of ['top', 'under']) {
    assert.ok(d.querySelector(`#${slot}-select option[value="${top.id}"]`).disabled);
  }
  d.getElementById('top-chip').click();
  assert.equal(d.querySelector(`#picker [data-value="${top.id}"]`), null);
  d.querySelector('#picker .picker-close').click();
  const loaded = await studio(t, { [REMOVED_KEY]: [top.id] });
  assert.ok(loaded.d.querySelector(`.piece[data-id="${top.id}"]`).hidden);
  loaded.d.querySelector(`[data-restore="${top.id}"]`).click();
  assert.equal(loaded.d.querySelector(`.piece[data-id="${top.id}"]`).hidden, false);
  assert.deepEqual(JSON.parse(loaded.storage.getItem(REMOVED_KEY)), []);
  assert.equal(loaded.d.querySelector('.removed-pieces').hidden, true);
  loaded.d.getElementById('top-chip').click();
  assert.ok(loaded.d.querySelector(`#picker [data-value="${top.id}"]`));
});

test('daily looks, more ideas and cached looks never bring a removed garment back', async t => {
  const s = await studio(t), { d, app } = s;
  [...d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Mild').click();
  const old = app.today.getState(), id = old.trio.pick.recipe.topId;
  assert.ok(GARMENTS[id]);
  s.beginRemoval(id); s.confirm();
  const changed = app.today.getState();
  excludes(changed, id); excludes(app.getRecipe(), id);
  assert.equal(changed.choice, null);
  assert.equal(d.getElementById('today-undo').disabled, true);
  d.getElementById('today-another').click();
  assert.equal(d.getElementById('today-undo').disabled, true, 'no invalid undo before a new look was chosen');
  for (const key of ['pick', 'bolder', 'easier']) {
    d.getElementById(`look-${key}`).click(); excludes(app.getRecipe(), id);
  }
  d.getElementById('today-another').click(); d.getElementById('today-undo').click();
  d.getElementById('today-too-warm').click();
  excludes(app.today.getState(), id); excludes(app.getRecipe(), id);
  const loaded = await studio(t, { [REMOVED_KEY]: [id], [TODAY_KEY]: old });
  excludes(loaded.app.today.getState(), id); excludes(loaded.app.getRecipe(), id);
});

test('saved looks and authored studies cannot reintroduce removed pieces', async t => {
  const study = OUTFITS.find(o => Object.values(o.recipe).includes(top.id));
  const s = await studio(t, { [REMOVED_KEY]: [top.id], 'fashiongirly.plush-looks.v1': [cleanRecipe({ topId: top.id })] });
  s.d.getElementById('lookbook-open').click();
  [...s.d.querySelectorAll('#saved-list button')].find(b => b.textContent === 'Wear').click();
  excludes(s.app.getRecipe(), top.id);
  if (study) {
    const button = [...s.d.querySelectorAll('#outfit-ideas button')].find(b => b.textContent === study.name);
    assert.ok(button.hidden); button.click(); excludes(s.app.getRecipe(), top.id);
  }
});

test('an empty wardrobe clears cached suggestions and still lets pieces be restored', async t => {
  const s = await studio(t, { [REMOVED_KEY]: Object.keys(GARMENTS) });
  [...s.d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Mild').click();
  assert.equal(s.app.today.getState().trio, null);
  assert.ok(s.d.getElementById('today-another').disabled);
  assert.match(s.d.getElementById('today-status').textContent, /Nothing in the wardrobe/);
  assert.ok([...s.d.querySelectorAll('.wardrobe-group')].every(g => g.hidden));
  assert.equal(s.d.querySelector('.removed-pieces').hidden, false);
});

test('removed data is validated, all slots fall back safely, and storage failures remain usable for this visit', () => {
  for (const value of ['{}', 'null', '"oops"', '["__proto__",42,"missing"]']) {
    assert.deepEqual(createWardrobe({ getItem: () => value }).removed(), []);
  }
  const storage = { getItem: () => null, setItem() { throw new Error('full'); } }, inventory = createWardrobe(storage);
  const recipe = {};
  for (const [slot, key] of [['top', 'topId'], ['bottom', 'bottomId'], ['shoes', 'shoesId'], ['dress', 'dressId'], ['outerwear', 'outerwearId']]) {
    const g = Object.values(GARMENTS).find(g => g.slot === slot);
    recipe[key] = g.id;
    assert.equal(inventory.remove(g.id), false);
  }
  const clean = inventory.clean(recipe);
  assert.equal(clean.topId, 'classic'); assert.equal(clean.bottomId, 'classic'); assert.equal(clean.shoesId, 'classic');
  assert.equal(clean.dressId, 'none'); assert.equal(clean.outerwearId, 'none');
  for (const id of inventory.removed()) excludes(clean, id);
});
