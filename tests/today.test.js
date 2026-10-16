import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { TODAY_KEY, HISTORY_KEY, PLACE_KEY, WEATHER_KEY, WARMTH_KEY } from '../src/today/today.js';
import { LEARNED_KEY } from '../src/style/taste.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';

const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const DUBLIN = JSON.parse(readFileSync('tests/fixtures/open-meteo-geocoding-dublin.json', 'utf8'));
const ROME = JSON.parse(readFileSync('tests/fixtures/open-meteo-rome-2026-10-12.json', 'utf8'));
const MORNING = new Date(2026, 9, 9, 7, 30).getTime(), ROME_MORNING = new Date(2026, 9, 12, 9, 0).getTime();
const rome = async () => ({ ok: true, status: 200, json: async () => ROME });
const here = { getCurrentPosition(ok) { ok({ coords: { latitude: 51.51, longitude: -.13 } }); } };

// A studio page with a stand-in 3D view, a recorded forecast and a fixed clock. `storage` copies an earlier visit.
async function open({ now = MORNING, geolocation = here, storage = {}, fetch, mood = 'tranquilla', choose = true } = {}) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document;
  for (const [k, v] of Object.entries(storage)) dom.window.localStorage.setItem(k, v);
  const asked = [], worn = [];
  fetch ??= async url => ({ ok: true, status: 200, json: async () => url.includes('geocoding') ? DUBLIN : LONDON });
  const app = await startStudio(d, () => ({ update(r) { worn.push(r); }, turn() {}, dispose() {} }), { fetch: async u => { asked.push(u); return fetch(u); }, geolocation, now: () => now });
  await app.today.ready;
  if (mood && !app.today.getState()?.mood) d.querySelector(`[data-mood="${mood}"]`).click();
  if (choose && app.today.getState()?.trio && !app.today.getState().choice) d.getElementById('look-pick').click();
  const saved = () => Object.fromEntries(Object.keys(dom.window.localStorage).map(k => [k, dom.window.localStorage.getItem(k)]));
  return { dom, d, app, asked, worn, saved, read: k => JSON.parse(dom.window.localStorage.getItem(k)), close() { app.dispose(); dom.window.close(); } };
}
const lead = r => r.dressId !== 'none' ? r.dressId : r.topId;
const click = (d, id) => d.getElementById(id).click();

test('after choosing a feeling and a proposal she dresses for the phone forecast', async () => {
  const p = await open();
  const r = p.app.getRecipe(), today = p.read(TODAY_KEY);
  assert.equal(today.day, '2026-10-09');
  assert.ok(GARMENTS[lead(r)], 'she wears a piece from the wardrobe');
  assert.deepEqual(r, today.trio.pick.recipe, 'she wears her pick');
  assert.equal(p.d.getElementById('look-pick').getAttribute('aria-pressed'), 'true');
  assert.equal(p.d.getElementById('outfit-title').textContent, 'Il tuo primo look.');
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

const looks = p => ({ pick: p.read(TODAY_KEY).trio.pick.recipe, bolder: p.read(TODAY_KEY).trio.bolder.recipe, easier: p.read(TODAY_KEY).trio.easier.recipe });

test('three looks for the day, under the doll, that stay the same', async () => {
  const { boldness } = await import('../src/style/taste.js'), { outfitOf } = await import('../src/style/stylist.js');
  const p = await open(), d = p.d, b = r => boldness(outfitOf(r)), day = looks(p);
  assert.ok(Object.values(day).every(r => Number.isFinite(b(r))), 'three interpretations of the same mood');
  assert.equal(new Set(Object.values(day).map(lead)).size, 3, 'three different outfits');
  click(d, 'look-bolder');
  assert.deepEqual(p.app.getRecipe(), day.bolder);
  assert.equal(d.getElementById('look-bolder').getAttribute('aria-pressed'), 'true');
  assert.equal(d.getElementById('look-pick').getAttribute('aria-pressed'), 'false');
  assert.equal(d.getElementById('outfit-title').textContent, 'Il tuo secondo look.');
  click(d, 'look-easier'); click(d, 'look-bolder'); click(d, 'look-pick');
  assert.deepEqual(p.app.getRecipe(), day.pick, 'pressing again gives the same looks');
  assert.deepEqual(looks(p), day, 'the three never change during the day');
  assert.ok(d.querySelectorAll('#look-bolder .outfit-swatch-piece').length >= 3, 'each shows its cloth');
  assert.ok(d.querySelectorAll('#today-pieces .piece-cloth').length >= 4, 'her pieces show their cloth');
  assert.equal(d.querySelectorAll('#today-hours li').length, 4, 'four moments of her day');
  assert.equal(d.querySelectorAll('#today-icon .wx').length, 1, 'a picture of the weather');
  assert.equal(d.getElementById('sky').dataset.kind, 'rain', 'and the scene behind her is raining');
  assert.equal(d.querySelectorAll('[data-angle]').length, 0, 'the turn buttons are gone; drag to turn her');
  p.close();
});

test('another idea shows a different outfit, and undo goes back', async () => {
  const p = await open(), d = p.d, day = looks(p);
  click(d, 'look-easier');
  assert.equal(d.getElementById('today-undo').disabled, true);
  click(d, 'today-another');
  const idea = p.app.getRecipe();
  assert.ok(!Object.values(day).map(lead).includes(lead(idea)), 'not one of the three');
  assert.equal(d.getElementById('outfit-title').textContent, 'Another idea.');
  for (const k of ['pick', 'bolder', 'easier']) assert.equal(d.getElementById(`look-${k}`).getAttribute('aria-pressed'), 'false');
  click(d, 'today-another');
  assert.notEqual(lead(p.app.getRecipe()), lead(idea), 'a second idea is new too');
  click(d, 'today-undo');
  assert.deepEqual(p.app.getRecipe(), idea);
  click(d, 'today-undo');
  assert.deepEqual(p.app.getRecipe(), day.easier, 'back to the look before the ideas');
  assert.equal(d.getElementById('today-undo').disabled, true);
  assert.deepEqual(looks(p), day, 'the three looks are untouched');
  p.close();
});

test('without location she asks for the weather; a typed town is used from then on', async () => {
  const denied = { getCurrentPosition(ok, fail) { fail({ code: 1 }); } };
  const p = await open({ geolocation: denied }), d = p.d, draft = p.app.getRecipe();
  assert.match(d.getElementById('today-status').textContent, /Location access is off/);
  assert.equal(d.getElementById('today-manual').open, true);
  assert.deepEqual(p.app.getRecipe(), draft, 'nothing changes until there is weather');
  [...d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Cold').click();
  click(d, 'look-pick');
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

test('she says what she dressed for: the warm part of the day, in the sun when it shines', async () => {
  const sunny = await open({ now: ROME_MORNING, fetch: rome }), dressed = p => p.d.getElementById('today-dressed').textContent;
  assert.equal(dressed(sunny), 'Dressed for 25° · this afternoon, in the sun');
  assert.match(sunny.d.getElementById('today-weather').textContent, /this afternoon 22° in the shade, about 25° in the sun/);
  sunny.close();
  const p = await open();
  assert.equal(dressed(p), 'Dressed for 17° · this afternoon', 'an overcast day, in the shade');
  click(p.d, 'today-another');
  assert.equal(dressed(p), 'Dressed for 17° · this afternoon', 'another idea is for the same day');
  [...p.d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Cold').click();
  click(p.d, 'look-pick');
  assert.equal(dressed(p), 'Dressed for 3° · the weather you chose');
  p.close();
});

test('too warm dresses her lighter and is remembered on the days after; too cool and Reset take it back', async () => {
  const p = await open(), d = p.d, before = p.read(TODAY_KEY).trio.pick, forecast = () => p.read(TODAY_KEY).conditions.feels;
  assert.equal(d.getElementById('today-offset').hidden, true);
  click(d, 'today-too-warm');
  const offset = p.read(WARMTH_KEY), after = p.read(TODAY_KEY).trio.pick;
  assert.ok(offset > 0, 'she remembers it');
  assert.ok(after.warmth.total < before.warmth.total, `a lighter look (${after.warmth.total} after ${before.warmth.total})`);
  assert.deepEqual(p.app.getRecipe(), after.recipe, 'and wears it');
  assert.equal(d.getElementById('today-status').textContent, `Lighter. From now on she dresses as if it were ${offset}° warmer than the forecast.`);
  assert.equal(d.getElementById('today-offset').hidden, false);
  assert.equal(d.getElementById('today-dressed').textContent, `Dressed for ${Math.round(forecast() + offset)}° · this afternoon · ${offset}° warmer for you`);
  const storage = p.saved(); p.close();
  const next = await open({ now: new Date(2026, 9, 10, 7, 0).getTime(), storage }), day = () => next.read(TODAY_KEY);
  assert.equal(day().day, '2026-10-10');
  assert.equal(day().trio.pick.warmth.feels, day().conditions.feels + offset, 'the next day she dresses for it too');
  assert.equal(next.d.getElementById('today-offset').hidden, false);
  const was = day().trio.pick.warmth.total;
  click(next.d, 'today-too-cool');
  assert.ok(next.read(WARMTH_KEY) < offset, 'too cool takes some back');
  assert.ok(day().trio.pick.warmth.total > was, 'a warmer look');
  click(next.d, 'today-offset-reset');
  assert.equal(next.read(WARMTH_KEY), 0);
  assert.equal(next.d.getElementById('today-offset').hidden, true);
  assert.equal(day().trio.pick.warmth.feels, day().conditions.feels, 'Reset: the forecast as it is');
  assert.equal(next.d.getElementById('today-status').textContent, 'She dresses for the forecast as it is again.');
  next.close();
});

test('when she is already dressed as lightly as the weather allows, too warm says so and changes nothing', async () => {
  const p = await open({ now: ROME_MORNING, fetch: rome }), look = p.app.getRecipe();
  click(p.d, 'today-too-warm');
  assert.equal(p.d.getElementById('today-status').textContent, 'This is already as light as she dresses for this weather.');
  assert.equal(p.read(WARMTH_KEY), null, 'nothing to remember');
  assert.deepEqual(p.app.getRecipe(), look);
  p.close();
});

test('a look chosen from a forecast read the old way is chosen again for the warm part of the day', async () => {
  const first = await open(), storage = first.saved(); first.close();
  const old = json => { const v = JSON.parse(json); delete v.conditions.shade; delete v.conditions.sun; return JSON.stringify(v); };
  const again = await open({ now: MORNING + 3600e3, storage: { ...storage, [TODAY_KEY]: old(storage[TODAY_KEY]), [WEATHER_KEY]: old(storage[WEATHER_KEY]) } });
  assert.equal(again.asked.length, 1, 'the forecast is read again');
  assert.ok(Number.isFinite(again.read(TODAY_KEY).conditions.shade));
  assert.ok(Number.isFinite(again.read(TODAY_KEY).trio.pick.warmth.feels));
  again.close();
});

test('looks chosen by an older version of her rules are chosen again, for the same weather', async () => {
  const { RULES_VERSION } = await import('../src/style/stylist.js');
  const first = await open(), storage = first.saved(), pick = first.read(TODAY_KEY).trio.pick.recipe; first.close();
  const old = JSON.parse(storage[TODAY_KEY]); delete old.rules; old.trio.pick = old.trio.easier;
  const again = await open({ now: MORNING + 3600e3, storage: { ...storage, [TODAY_KEY]: JSON.stringify(old) } });
  assert.equal(again.asked.length, 0, 'no new forecast');
  assert.deepEqual(again.read(TODAY_KEY).trio.pick.recipe, pick, 'her pick, as her rules choose it now');
  assert.deepEqual(again.app.getRecipe(), pick, 'and she wears it');
  assert.equal(again.read(TODAY_KEY).rules, RULES_VERSION);
  again.close();
});

test('saving a look with the heart teaches her what the user likes', async () => {
  const p = await open(), r = p.app.getRecipe();
  click(p.d, 'save');
  const learned = p.read(LEARNED_KEY);
  assert.ok(learned.pieces[lead(r)] > 0);
  assert.ok(Object.keys(learned.pairs).length > 0);
  p.close();
});

test('a new day waits for a mood, then offers previews and waits for a look before dressing', async () => {
  const p = await open({ mood: null, choose: false }), d = p.d, initial = p.app.getRecipe();
  assert.equal(p.read(TODAY_KEY).mood, null);
  assert.equal(p.read(TODAY_KEY).trio, null);
  assert.equal(p.read(HISTORY_KEY), null);
  assert.equal(d.getElementById('today-suggestions').hidden, true);
  assert.equal(d.querySelectorAll('#today-moods button').length, 6);
  let revealed = false;
  d.defaultView.matchMedia = () => ({ matches: true });
  d.getElementById('today-suggestions').scrollIntoView = () => { revealed = true; };
  d.querySelector('[data-mood=invisibile]').click();
  assert.equal(revealed, true, 'on a phone the new proposals are brought into view');
  assert.ok(p.read(TODAY_KEY).trio);
  assert.equal(p.read(TODAY_KEY).choice, null);
  assert.deepEqual(p.app.getRecipe(), initial, 'preparing previews does not dress her');
  assert.equal(p.read(HISTORY_KEY), null, 'a preview is not recorded as worn');
  assert.equal(d.getElementById('today-suggestions').hidden, false);
  assert.equal(d.getElementById('today-outfit').hidden, true);
  assert.match(d.getElementById('today-mood-criteria').textContent, /poco contrasto/);
  click(d, 'look-easier');
  const look = p.app.getRecipe(), storage = p.saved();
  assert.deepEqual(look, p.read(TODAY_KEY).trio.easier.recipe);
  assert.equal(d.getElementById('today-outfit').hidden, false);
  p.close();
  const again = await open({ storage, mood: null, choose: false });
  assert.equal(again.asked.length, 0);
  assert.equal(again.read(TODAY_KEY).mood, 'invisibile');
  assert.equal(again.read(TODAY_KEY).choice, 'easier');
  assert.deepEqual(again.app.getRecipe(), look);
  const next = await open({ storage, now: new Date(2026, 9, 10, 6).getTime(), mood: null, choose: false });
  assert.equal(next.read(TODAY_KEY).mood, null, 'a new morning asks again');
  assert.equal(next.read(TODAY_KEY).trio, null);
  assert.deepEqual(next.app.getRecipe(), look, 'yesterday’s outfit stays until a choice');
  again.close(); next.close();
});

test('changing mood changes proposals without changing what she wears; ideas and warmth keep the mood', async () => {
  const p = await open(), d = p.d, before = p.app.getRecipe();
  d.querySelector('[data-mood=coccole]').click();
  assert.equal(p.read(TODAY_KEY).choice, null);
  assert.deepEqual(p.app.getRecipe(), before);
  for (const r of Object.values(p.read(TODAY_KEY).trio)) assert.match(r.reasons.join(' '), /comfort|morbidezza/);
  const trio = p.read(TODAY_KEY).trio;
  d.querySelector('[data-mood=coccole]').click();
  assert.deepEqual(p.read(TODAY_KEY).trio, trio, 'same mood does not keep reshuffling');
  click(d, 'look-pick'); click(d, 'today-another');
  assert.match(p.read(TODAY_KEY).idea.reasons.join(' '), /comfort|morbidezza/);
  click(d, 'today-too-warm');
  assert.equal(p.read(TODAY_KEY).mood, 'coccole');
  p.close();
});

test('a feeling selected while the forecast is pending is used when it arrives', async () => {
  let resolveForecast;
  const response = new Promise(r => { resolveForecast = r; });
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document;
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { geolocation: here, fetch: () => response, now: () => MORNING });
  const before = app.getRecipe();
  d.querySelector('[data-mood=energie]').click();
  assert.equal(app.today.getState().mood, 'energie');
  assert.equal(app.today.getState().trio, null);
  resolveForecast({ ok: true, status: 200, json: async () => LONDON });
  await app.today.ready;
  assert.ok(app.today.getState().trio);
  assert.equal(app.today.getState().choice, null);
  assert.deepEqual(app.getRecipe(), before);
  app.dispose(); dom.window.close();
});

test('old saved daily looks without a feeling return to the question without redressing', async () => {
  const first = await open(), storage = first.saved(), before = first.app.getRecipe(); first.close();
  const old = JSON.parse(storage[TODAY_KEY]); delete old.mood;
  const p = await open({ storage: { ...storage, [TODAY_KEY]: JSON.stringify(old) }, mood: null, choose: false });
  assert.equal(p.read(TODAY_KEY).trio, null);
  assert.equal(p.read(TODAY_KEY).mood, null);
  assert.equal(p.asked.length, 0, 'the existing forecast is still good');
  assert.deepEqual(p.app.getRecipe(), before);
  p.close();
});
