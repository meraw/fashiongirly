import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { TODAY_KEY, HISTORY_KEY, PLACE_KEY } from '../src/today/today.js';
import { LEARNED_KEY } from '../src/style/taste.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';

const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const DUBLIN = JSON.parse(readFileSync('tests/fixtures/open-meteo-geocoding-dublin.json', 'utf8'));
const MORNING = new Date(2026, 9, 9, 7, 30).getTime();
const here = { getCurrentPosition(ok) { ok({ coords: { latitude: 51.51, longitude: -.13 } }); } };

// A studio page with a stand-in 3D view, a recorded forecast and a fixed clock. `storage` copies an earlier visit.
async function open({ now = MORNING, geolocation = here, storage = {}, fetch } = {}) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document;
  for (const [k, v] of Object.entries(storage)) dom.window.localStorage.setItem(k, v);
  const asked = [], worn = [];
  fetch ??= async url => ({ ok: true, status: 200, json: async () => url.includes('geocoding') ? DUBLIN : LONDON });
  const app = await startStudio(d, () => ({ update(r) { worn.push(r); }, turn() {}, dispose() {} }), { fetch: async u => { asked.push(u); return fetch(u); }, geolocation, now: () => now });
  await app.today.ready;
  const saved = () => Object.fromEntries(Object.keys(dom.window.localStorage).map(k => [k, dom.window.localStorage.getItem(k)]));
  return { dom, d, app, asked, worn, saved, read: k => JSON.parse(dom.window.localStorage.getItem(k)), close() { app.dispose(); dom.window.close(); } };
}
const lead = r => r.dressId !== 'none' ? r.dressId : r.topId;
const click = (d, id) => d.getElementById(id).click();

test('in the morning she checks the forecast for where the phone is and dresses herself', async () => {
  const p = await open();
  const r = p.app.getRecipe(), today = p.read(TODAY_KEY);
  assert.equal(today.day, '2026-10-09');
  assert.ok(GARMENTS[lead(r)], 'she wears a piece from the wardrobe');
  assert.deepEqual(r, today.result.recipe);
  assert.equal(p.asked.length, 1);
  assert.match(p.asked[0], /latitude=51\.51&longitude=-0\.13/, 'the phone location is used by default');
  assert.match(p.d.getElementById('today-weather').textContent, /Your location · \w+ · .*rain likely/);
  assert.equal(p.d.getElementById('today-place').textContent, 'your location');
  assert.ok(p.d.querySelectorAll('#today-pieces li').length >= 4, 'her pieces are listed');
  assert.ok(p.d.querySelectorAll('#today-reasons li').length >= 2, 'and why she chose them');
  assert.match(p.d.getElementById('today').textContent, /not AI/);
  assert.equal(p.read(HISTORY_KEY)[0].day, '2026-10-09');
  p.close();
});

test('reopening the same day keeps her look; after 5:00 the next day she dresses again', async () => {
  const first = await open();
  const storage = first.saved(), look = first.app.getRecipe(); first.close();
  const again = await open({ now: MORNING + 9 * 3600e3, storage });
  assert.equal(again.asked.length, 0, 'no new forecast on the same day');
  assert.deepEqual(again.app.getRecipe(), look);
  const early = await open({ now: new Date(2026, 9, 10, 4, 30).getTime(), storage });
  assert.equal(early.asked.length, 0, 'before 5:00 it is still the same day');
  early.close(); again.close();
  const next = await open({ now: new Date(2026, 9, 10, 6, 0).getTime(), storage });
  assert.equal(next.read(TODAY_KEY).day, '2026-10-10');
  assert.equal(next.asked.length, 1);
  assert.notEqual(lead(next.app.getRecipe()), lead(look), 'a new day brings a new top or dress');
  assert.deepEqual(next.read(HISTORY_KEY).map(h => h.day), ['2026-10-10', '2026-10-09']);
  next.close();
});

// The slots in which two recipes differ (hair aside, which these buttons leave alone).
const differ = (a, b) => ['topId', 'underTopId', 'bottomId', 'dressId', 'shoesId', 'outerwearId'].filter(k => a[k] !== b[k]);

test('keep a piece, ask for another idea, set one aside, then undo', async () => {
  const p = await open(), d = p.d, before = p.app.getRecipe();
  const keep = [...d.querySelectorAll('#today-pieces li')].find(li => li.textContent.startsWith('Shoes')).querySelector('.today-keep');
  keep.click();
  assert.equal(p.read(TODAY_KEY).keep.shoes, before.shoesId);
  click(d, 'today-another');
  const other = p.app.getRecipe();
  assert.equal(other.shoesId, before.shoesId, 'the kept shoes stay');
  assert.notEqual(lead(other), lead(before), 'another idea changes the top or dress');
  const top = [...d.querySelectorAll('#today-pieces li')].find(li => /^(Top|Dress)/.test(li.textContent));
  top.querySelector('.today-aside').click();
  const third = p.app.getRecipe();
  assert.notEqual(lead(third), lead(other), 'a piece set aside is not worn today');
  assert.deepEqual(differ(third, other), [third.dressId !== 'none' ? 'dressId' : 'topId'], 'and only that piece changes');
  assert.ok(p.read(TODAY_KEY).avoid.includes(lead(other)));
  assert.ok(p.read(LEARNED_KEY).pieces[lead(other)] < 0, 'and counts a little against it');
  click(d, 'today-undo');
  assert.deepEqual(p.app.getRecipe(), other, 'undo brings back the look before');
  click(d, 'today-first');
  assert.deepEqual(p.app.getRecipe(), before, 'her first pick of the day comes back');
  assert.equal(d.getElementById('outfit-title').textContent, 'Her pick for today.');
  p.close();
});

test('bolder and easier change her look a piece at a time, in the direction asked', async () => {
  const { boldness } = await import('../src/style/taste.js'), { outfitOf } = await import('../src/style/stylist.js');
  const p = await open(), d = p.d, b = r => boldness(outfitOf(r));
  const start = p.app.getRecipe();
  click(d, 'today-bolder');
  const bolder = p.app.getRecipe();
  assert.ok(b(bolder) > b(start), 'bolder is bolder');
  assert.ok(differ(bolder, start).length >= 1 && differ(bolder, start).length <= 2, 'one or two pieces change, not the whole look');
  assert.equal(bolder.hairId, start.hairId);
  assert.match(d.getElementById('today-status').textContent, /^Bolder: the .* instead of the /);
  assert.ok(p.read(TODAY_KEY).daring > .5);
  click(d, 'today-easier'); click(d, 'today-easier');
  const easier = p.app.getRecipe();
  assert.ok(b(easier) < b(bolder), 'easier is quieter');
  assert.ok(differ(easier, bolder).length <= 4);
  p.close();
});

test('without location she asks for the weather; a typed town is used from then on', async () => {
  const denied = { getCurrentPosition(ok, fail) { fail({ code: 1 }); } };
  const p = await open({ geolocation: denied }), d = p.d, draft = p.app.getRecipe();
  assert.match(d.getElementById('today-status').textContent, /Location access is off/);
  assert.equal(d.getElementById('today-manual').open, true);
  assert.deepEqual(p.app.getRecipe(), draft, 'nothing changes until there is weather');
  [...d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Cold').click();
  assert.ok(p.app.getRecipe().outerwearId !== 'none', 'dressed for the cold: a jacket');
  assert.match(d.getElementById('today-weather').textContent, /Cold/);
  d.getElementById('today-place-input').value = 'Dublin';
  d.getElementById('today-place-form').dispatchEvent(new p.dom.window.Event('submit', { cancelable: true }));
  await new Promise(r => setTimeout(r, 20));
  assert.equal(p.read(PLACE_KEY).name, 'Dublin, Ireland');
  assert.match(p.asked.at(-1), /latitude=53\.33&longitude=-6\.25/, 'the forecast for the typed town');
  assert.match(d.getElementById('today-weather').textContent, /^Dublin, Ireland · /);
  assert.equal(d.getElementById('today-place').textContent, 'Dublin, Ireland');
  p.close();
});

test('when the weather service refuses, she says so and the user can choose the weather', async () => {
  const p = await open({ fetch: async () => ({ ok: false, status: 429, json: async () => ({ error: true, reason: 'Daily API request limit exceeded.' }) }) });
  assert.match(p.d.getElementById('today-status').textContent, /limit exceeded.*Choose today's weather/);
  assert.equal(p.d.getElementById('today-manual').open, true);
  p.close();
});

test('saving a look with the heart teaches her what the user likes', async () => {
  const p = await open(), r = p.app.getRecipe();
  click(p.d, 'save');
  const learned = p.read(LEARNED_KEY);
  assert.ok(learned.pieces[lead(r)] > 0);
  assert.ok(Object.keys(learned.pairs).length > 0);
  p.close();
});
