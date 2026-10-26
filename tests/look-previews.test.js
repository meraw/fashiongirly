import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { mountLookCards, PREVIEWS_KEY } from '../src/today/look-cards.js';
import { TODAY_KEY } from '../src/today/today.js';
import { composeTrio } from '../src/style/stylist.js';
import { presetConditions } from '../src/weather/conditions.js';
import { cleanRecipe } from '../src/doll/recipe.js';
const IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jK3sAAAAASUVORK5CYII=';
const OTHER = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
const day = '2026-10-17', now = new Date(2026, 9, 17, 9).getTime(), flush = () => new Promise(r => setTimeout(r, 0));
const trio = composeTrio(presetConditions('mild', day), { seed: 17 });
async function open(t, { entries = {}, clock = now, renderPortrait = async () => IMAGE } = {}) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document, storage = dom.window.localStorage;
  for (const [k, v] of Object.entries(entries)) storage.setItem(k, v);
  if (!storage.getItem(TODAY_KEY)) storage.setItem(TODAY_KEY, JSON.stringify({ day, conditions: presetConditions('mild', day), seed: 17, trio, choice: 'pick', rules: 4 }));
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null, now: () => clock, renderPortrait });
  await app.today.ready; await flush();
  t.after(() => { app.dispose(); dom.window.close(); });
  return { app, d, storage, saved: () => Object.fromEntries(Object.entries(storage)), click: key => d.getElementById(`look-${key}`).click() };
}

test('only Her pick is photographed initially; trying an alternative reveals it without changing the daily trio', async t => {
  const calls = [], p = await open(t, { renderPortrait: async (recipe, key) => { calls.push({ recipe, key }); return IMAGE; } });
  assert.deepEqual(calls.map(x => x.key), ['pick']);
  const original = p.app.today.getState().trio;
  assert.ok(p.d.querySelector('#look-pick img'));
  for (const key of ['bolder', 'easier']) {
    assert.equal(p.d.querySelector(`#look-${key} img`), null);
    assert.equal(p.d.getElementById(`look-${key}`).dataset.revealed, 'false');
    assert.match(p.d.getElementById(`look-${key}`).textContent, /Tap to reveal/);
    assert.equal(p.d.querySelector(`#look-${key} .outfit-swatch`), null, 'no colours or fabrics leak through the cover');
  }
  p.click('bolder'); await flush();
  assert.deepEqual(calls.map(x => x.key), ['pick', 'bolder']);
  assert.deepEqual(calls[1].recipe, original.bolder.recipe);
  assert.deepEqual(p.app.getRecipe(), original.bolder.recipe);
  assert.ok(p.d.querySelector('#look-bolder img'));
  assert.equal(p.d.querySelector('#look-easier img'), null);
  p.click('pick'); p.click('bolder'); await flush();
  assert.equal(calls.length, 2, 'revealed portraits are reused');
  assert.deepEqual(p.app.today.getState().trio, original, 'there are still just the same three outfits');
});

test('reopening remembers revealed pictures, while the next styling day conceals the alternatives again', async t => {
  const first = await open(t); first.click('bolder'); first.click('easier'); await flush();
  const entries = first.saved(), calls = [];
  const again = await open(t, { entries, renderPortrait: async (_, key) => { calls.push(key); return IMAGE; } });
  assert.equal(again.d.querySelectorAll('.look img').length, 3);
  assert.equal(calls.length, 0, 'no new renders or outfit generation on reopening');
  const early = await open(t, { entries, clock: new Date(2026, 9, 18, 4, 30).getTime() });
  assert.equal(early.d.querySelectorAll('.look img').length, 3, 'before 5:00 it is still the same day');
  const next = await open(t, { entries, clock: new Date(2026, 9, 18, 6).getTime() });
  [...next.d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Mild').click(); await flush();
  assert.ok(next.d.querySelector('#look-pick img'));
  assert.equal(next.d.querySelector('#look-bolder img'), null);
  assert.equal(next.d.querySelector('#look-easier img'), null);
});

test('replacement recipes invalidate their portraits, and a late image cannot replace a new day’s portrait', async t => {
  const dom = new JSDOM(readFileSync('index.html', 'utf8')), d = dom.window.document, jobs = [];
  const data = new Map(), storage = { getItem: key => data.get(key), setItem: (key, value) => data.set(key, value) };
  const cards = mountLookCards(d, { storage, renderPortrait: (recipe, key) => new Promise(resolve => jobs.push({ recipe, key, resolve })) });
  t.after(() => { cards.dispose(); dom.window.close(); });
  cards.sync({ day, trio, choice: 'bolder' }); await flush();
  assert.deepEqual(jobs.map(x => x.key), ['pick', 'bolder']);
  const tomorrow = composeTrio(presetConditions('cold', '2026-10-18'), { seed: 18 });
  cards.sync({ day: '2026-10-18', trio: tomorrow, choice: 'pick' }); await flush();
  jobs[2].resolve(OTHER); await flush(); jobs[0].resolve(IMAGE); jobs[1].resolve(IMAGE); await flush();
  assert.equal(d.querySelector('#look-pick img').src, OTHER);
  assert.equal(d.querySelector('#look-bolder img'), null);
  assert.equal(JSON.parse(data.get(PREVIEWS_KEY)).day, '2026-10-18');
  cards.sync({ day: '2026-10-18', trio: tomorrow, choice: 'bolder' }); await flush();
  jobs[3].resolve(IMAGE); await flush();
  const replacement = { ...tomorrow, bolder: { ...tomorrow.bolder, recipe: trio.bolder.recipe } };
  cards.sync({ day: '2026-10-18', trio: replacement, choice: 'pick' }); await flush();
  assert.equal(d.querySelector('#look-bolder img'), null, 'a different outfit is a new surprise');
  assert.equal(jobs.length, 4, 'the replacement is not photographed before trying it');
});

test('portrait failures and unavailable storage leave the three daily choices usable', async t => {
  const p = await open(t, { renderPortrait: async () => { throw Error('WebGL unavailable'); } });
  assert.match(p.d.getElementById('look-pick').textContent, /Preview unavailable/);
  p.click('bolder'); await flush();
  assert.deepEqual(p.app.getRecipe(), p.app.today.getState().trio.bolder.recipe);
  assert.equal(p.d.getElementById('look-bolder').getAttribute('aria-pressed'), 'true');
  const dom = new JSDOM(readFileSync('index.html', 'utf8')), cards = mountLookCards(dom.window.document, { storage: { getItem() { throw Error(); }, setItem() { throw Error(); } }, renderPortrait: async () => IMAGE });
  t.after(() => { cards.dispose(); dom.window.close(); });
  cards.sync({ day, trio, choice: 'pick' }); await flush();
  assert.ok(dom.window.document.querySelector('#look-pick img'));
  assert.equal(dom.window.document.querySelector('#look-bolder img'), null);
});

test('My looks shows each saved look as its own doll, without dressing her in it', async t => {
  const calls = [], first = cleanRecipe({ hairId: 'high-bun', sleeve: 1 }), second = cleanRecipe({ skirt: true });
  const p = await open(t, { entries: { 'fashiongirly.plush-looks.v1': JSON.stringify([first, second]) }, renderPortrait: async (recipe, key) => { calls.push({ recipe, key }); return key === 'pick' && recipe.skirt ? OTHER : IMAGE; } });
  const lookbook = p.d.getElementById('lookbook'); lookbook.showModal = function () { this.open = true; }; lookbook.close = function () { this.open = false; };
  const before = p.app.getRecipe(), pickCalls = calls.length;
  p.d.getElementById('lookbook-open').click(); await flush();
  const cards = [...p.d.querySelectorAll('#saved-list .saved-row')];
  assert.equal(cards.length, 2);
  assert.deepEqual(calls.slice(pickCalls).map(x => [x.recipe.hairId, x.recipe.skirt, x.key]), [['high-bun', false, 'pick'], [second.hairId, true, 'pick']]);
  assert.deepEqual(cards.map(c => c.querySelector('.saved-portrait').dataset.state), ['ready', 'ready']);
  assert.deepEqual(cards.map(c => c.querySelector('img').src), [IMAGE, OTHER]);
  assert.deepEqual(p.app.getRecipe(), before, 'looking at saved looks leaves her outfit alone');
  // Opened again, the pictures are reused for this visit.
  lookbook.close(); p.d.getElementById('lookbook-open').click(); await flush();
  assert.equal(calls.length, pickCalls + 2);
  assert.equal(p.d.querySelectorAll('#saved-list img').length, 2);
  // Wear still puts a look on her.
  cards[0].querySelector('button').click();
  assert.equal(p.app.getRecipe().hairId, 'high-bun'); assert.equal(p.app.getRecipe().sleeve, 1);
});

test('a saved look whose portrait fails says so and is tried again next time', async t => {
  let fail = true;
  const p = await open(t, { entries: { 'fashiongirly.plush-looks.v1': JSON.stringify([cleanRecipe({ skirt: true })]) }, renderPortrait: async (recipe, key) => { if (recipe.skirt && fail) throw Error('WebGL unavailable'); return IMAGE; } });
  const lookbook = p.d.getElementById('lookbook'); lookbook.showModal = function () { this.open = true; }; lookbook.close = function () {};
  p.d.getElementById('lookbook-open').click(); await flush();
  assert.equal(p.d.querySelector('#saved-list .saved-portrait').dataset.state, 'unavailable');
  assert.match(p.d.querySelector('#saved-list .saved-portrait').textContent, /Preview unavailable/);
  fail = false; p.d.getElementById('lookbook-open').click(); await flush();
  assert.equal(p.d.querySelector('#saved-list .saved-portrait').dataset.state, 'ready');
});
