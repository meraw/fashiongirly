import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { TODAY_KEY, HISTORY_KEY, PLACE_KEY, WEATHER_KEY, WARMTH_KEY, SAVED_DAYS_KEY } from '../src/today/today.js';
import { lookKey } from '../src/style/stylist.js';
import { LOOKBOOK_KEY } from '../src/doll/recipe.js';
import { LEARNED_KEY } from '../src/style/taste.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';

const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const DUBLIN = JSON.parse(readFileSync('tests/fixtures/open-meteo-geocoding-dublin.json', 'utf8'));
const ROME = JSON.parse(readFileSync('tests/fixtures/open-meteo-rome-2026-10-12.json', 'utf8'));
const MORNING = new Date(2026, 9, 9, 7, 30).getTime(), ROME_MORNING = new Date(2026, 9, 12, 9, 0).getTime();
const rome = async () => ({ ok: true, status: 200, json: async () => ROME });
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
  assert.deepEqual(r, today.trio.pick.recipe, 'she wears her pick');
  assert.equal(p.d.getElementById('look-pick').getAttribute('aria-pressed'), 'true');
  assert.equal(p.d.getElementById('outfit-title').textContent, 'Her pick for today.');
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
  const soon = await open({ now: MORNING + 3600e3, storage });
  assert.equal(soon.asked.length, 0, 'within two hours the forecast she read stands');
  soon.close();
  const again = await open({ now: MORNING + 9 * 3600e3, storage });
  assert.equal(again.asked.length, 1, 'later in the day she reads the forecast again');
  assert.deepEqual(again.app.getRecipe(), look, 'the same forecast: the same look');
  const early = await open({ now: new Date(2026, 9, 10, 4, 30).getTime(), storage });
  assert.equal(early.read(TODAY_KEY).day, '2026-10-09', 'before 5:00 it is still the same day');
  assert.deepEqual(early.app.getRecipe(), look);
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
  assert.ok(b(day.bolder) > b(day.pick) && b(day.easier) < b(day.pick), 'bolder is bolder, easier is quieter');
  assert.equal(new Set(Object.values(day).map(lead)).size, 3, 'three different outfits');
  click(d, 'look-bolder');
  assert.deepEqual(p.app.getRecipe(), day.bolder);
  assert.equal(d.getElementById('look-bolder').getAttribute('aria-pressed'), 'true');
  assert.equal(d.getElementById('look-pick').getAttribute('aria-pressed'), 'false');
  assert.equal(d.getElementById('outfit-title').textContent, 'Her bolder look.');
  click(d, 'look-easier'); click(d, 'look-bolder'); click(d, 'look-pick');
  assert.deepEqual(p.app.getRecipe(), day.pick, 'pressing again gives the same looks');
  assert.deepEqual(looks(p), day, 'the three never change during the day');
  assert.equal(d.getElementById('look-bolder').dataset.revealed, 'true', 'a tried alternative is revealed');
  assert.equal(d.querySelectorAll('.looks .outfit-swatch-piece').length, 0, 'daily cards use portraits rather than cloth strips');
  assert.ok(d.querySelectorAll('#today-pieces .piece-cloth').length >= 4, 'her pieces show their cloth');
  assert.equal(d.querySelectorAll('#today-hours li').length, 4, 'four moments of her day');
  assert.equal(d.querySelectorAll('#today-icon .wx').length, 1, 'a picture of the weather');
  assert.equal(d.getElementById('sky').dataset.kind, 'rain', 'and the scene behind her is raining');
  assert.equal(d.querySelectorAll('[data-angle]').length, 0, 'the turn buttons are gone; drag to turn her');
  p.close();
});

test('Today exposes exactly the three daily choices, without mood or extra generation buttons', async () => {
  const p = await open(), before = looks(p);
  assert.equal(p.d.querySelectorAll('.looks button').length, 3);
  assert.equal(p.d.querySelector('#today-moods'), null);
  assert.equal(p.d.querySelector('#today-another'), null);
  assert.equal(p.d.querySelector('#today-undo'), null);
  for (let i = 0; i < 3; i++) for (const key of ['pick', 'bolder', 'easier']) click(p.d, `look-${key}`);
  assert.deepEqual(looks(p), before, 'switching choices never generates a new set');
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

test('she says what she dressed for: the warm part of the day, in the sun when it shines', async () => {
  const sunny = await open({ now: ROME_MORNING, fetch: rome }), dressed = p => p.d.getElementById('today-dressed').textContent;
  assert.equal(dressed(sunny), 'Dressed for 25° · this afternoon, in the sun');
  assert.match(sunny.d.getElementById('today-weather').textContent, /this afternoon 22° in the shade, about 25° in the sun/);
  sunny.close();
  const p = await open();
  assert.equal(dressed(p), 'Dressed for 17° · this afternoon', 'an overcast day, in the shade');
  click(p.d, 'look-bolder');
  assert.equal(dressed(p), 'Dressed for 17° · this afternoon', 'all three looks are for the same day');
  [...p.d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Cold').click();
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
  // Rome ten degrees hotter, about 35° in the sun: only her lightest looks suit it. (At Rome's own 25° a shirt and jeans
  // suit, and she can still go lighter: rules version 6, 1 November 2026.)
  const hot = { ...ROME, hourly: { ...ROME.hourly, temperature_2m: ROME.hourly.temperature_2m.map(t => t + 10), apparent_temperature: ROME.hourly.apparent_temperature.map(t => t + 10) } };
  const p = await open({ now: ROME_MORNING, fetch: async () => ({ ok: true, status: 200, json: async () => hot }) }), look = p.app.getRecipe();
  try {
    click(p.d, 'today-too-warm');
    assert.equal(p.d.getElementById('today-status').textContent, 'This is already as light as she dresses for this weather.');
    assert.equal(p.read(WARMTH_KEY), null, 'nothing to remember');
    assert.deepEqual(p.app.getRecipe(), look);
  } finally { p.close(); }
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

test('a look saved today is not suggested exactly this week, and the old counted learning is let go', async () => {
  const first = await open(), storage = first.saved(), pick = first.read(TODAY_KEY).trio.pick.recipe;
  click(first.d, 'save');
  const days = first.read(SAVED_DAYS_KEY);
  assert.deepEqual(Object.values(days), ['2026-10-09'], 'the save is dated');
  const saved = first.saved(); first.close();
  // Choosing again for the same day (as a new version of her rules does): her pick was saved, so it is not her pick now.
  const old = JSON.parse(saved[TODAY_KEY]); delete old.rules;
  const again = await open({ now: MORNING + 3600e3, storage: { ...saved, [TODAY_KEY]: JSON.stringify(old), [LEARNED_KEY]: JSON.stringify({ pieces: { [lead(pick)]: 3 }, pairs: {} }) } });
  try {
    const trio = again.read(TODAY_KEY).trio;
    for (const key of ['pick', 'bolder', 'easier']) assert.notEqual(lookKey(trio[key].recipe), lookKey(pick), `${key} is not the saved look`);
    assert.equal(again.read(LEARNED_KEY), null, 'what was counted before is discarded');
  } finally { again.close(); }
  // Without the save, the same day chooses the same pick again.
  const old2 = JSON.parse(storage[TODAY_KEY]); delete old2.rules;
  const plain = await open({ now: MORNING + 3600e3, storage: { ...storage, [TODAY_KEY]: JSON.stringify(old2) } });
  try { assert.equal(lookKey(plain.read(TODAY_KEY).trio.pick.recipe), lookKey(pick)); } finally { plain.close(); }
});

test('a saved look is not suggested exactly for a week after it was saved or worn', async () => {
  const first = await open(), storage = first.saved(), pick = first.read(TODAY_KEY).trio.pick.recipe; first.close();
  const rechoose = async extra => {
    const old = JSON.parse(storage[TODAY_KEY]); delete old.rules;
    const p = await open({ now: MORNING + 3600e3, storage: { ...storage, [TODAY_KEY]: JSON.stringify(old), [LOOKBOOK_KEY]: JSON.stringify([pick]), ...extra } });
    try { return lookKey(p.read(TODAY_KEY).trio.pick.recipe); } finally { p.close(); }
  };
  const savedOn = day => ({ [SAVED_DAYS_KEY]: JSON.stringify({ [lookKey(pick)]: day }) });
  assert.notEqual(await rechoose(savedOn('2026-10-06')), lookKey(pick), 'saved three days ago');
  assert.notEqual(await rechoose({ [HISTORY_KEY]: JSON.stringify([{ day: '2026-10-05', recipe: pick }]) }), lookKey(pick), 'worn four days ago');
  // After the week the look may come again: she chooses as if it had never been saved that day.
  assert.equal(await rechoose(savedOn('2026-10-01')), await rechoose({}), 'saved eight days ago: no longer held back');
});

test('cached mood proposals and extra ideas migrate to the original ranked trio without clearing personal data', async () => {
  const { RULES_VERSION } = await import('../src/style/stylist.js');
  const first = await open(), storage = first.saved(), expected = looks(first); first.close();
  const old = JSON.parse(storage[TODAY_KEY]);
  Object.assign(old, { rules: 3, mood: 'invisibile', choice: 'idea', idea: old.trio.easier, ideas: [old.trio.easier.recipe], undo: [{ choice: 'pick' }] });
  old.trio.bolder = old.trio.easier;
  const p = await open({ storage: { ...storage, [TODAY_KEY]: JSON.stringify(old) } });
  assert.equal(p.asked.length, 0, 'the valid forecast is retained');
  assert.equal(p.read(TODAY_KEY).rules, RULES_VERSION);
  for (const key of ['mood', 'idea', 'ideas', 'undo']) assert.equal(Object.hasOwn(p.read(TODAY_KEY), key), false, key);
  assert.deepEqual(looks(p), expected, 'actual Her pick, Bolder and Easier are restored');
  assert.deepEqual(p.app.getRecipe(), expected.pick);
  assert.equal(p.read(HISTORY_KEY)[0].day, '2026-10-09');
  p.close();
});

test('an unfinished mood question reuses its valid forecast and immediately supplies the daily trio', async () => {
  const first = await open(), storage = first.saved(); first.close();
  const old = JSON.parse(storage[TODAY_KEY]); Object.assign(old, { rules: 3, mood: null, trio: null, choice: null });
  const p = await open({ storage: { ...storage, [TODAY_KEY]: JSON.stringify(old) } });
  assert.equal(p.asked.length, 0);
  assert.ok(p.read(TODAY_KEY).trio);
  assert.deepEqual(p.app.getRecipe(), p.read(TODAY_KEY).trio.pick.recipe);
  assert.equal(Object.hasOwn(p.read(TODAY_KEY), 'mood'), false);
  p.close();
});

// A warm day of short showers (the user, 19 October 2026): every hour's chance of rain is low, but it rains on and off
// from morning to afternoon, and it is raining as the forecast is read.
function showers(json, day) {
  const v = JSON.parse(JSON.stringify(json)), h = v.hourly;
  h.time.forEach((t, i) => { if (!t.startsWith(day)) return; const hour = +t.slice(11, 13);
    h.apparent_temperature[i] = h.temperature_2m[i] = 24; h.precipitation_probability[i] = 20; if (h.shortwave_radiation) h.shortwave_radiation[i] = 250;
    const wet = hour >= 7 && hour <= 15 && hour % 2 === 1; h.precipitation[i] = wet ? .2 : 0; h.weather_code[i] = wet ? 61 : 3; });
  v.current = { time: `${day}T07:30`, precipitation: .2, weather_code: 61 };
  return v;
}
const answer = json => async () => ({ ok: true, status: 200, json: async () => json });

test('a warm day of short showers is a rainy day: no open shoes, no "in the sun", and Rainy keeps her own warm day', async () => {
  const p = await open({ fetch: answer(showers(LONDON, '2026-10-09')) });
  const weather = p.d.getElementById('today-weather').textContent, c = p.read(TODAY_KEY).conditions;
  assert.match(weather, /rain on and off/, 'showers through the hours she is out');
  assert.doesNotMatch(weather, /in the sun/);
  assert.equal(c.sun, null, 'a rainy day is dressed for in the shade');
  for (const key of ['pick', 'bolder', 'easier']) {
    const look = p.read(TODAY_KEY).trio[key];
    assert.ok(!/open/.test(GARMENTS[look.recipe.shoesId]?.styling?.coverage?.foot ?? ''), `${key}: closed shoes in the rain (${look.recipe.shoesId})`);
    assert.doesNotMatch(look.reasons.join(' '), /warm and dry/);
  }
  // Rainy adds rain to her own warm day: still 24°, still where she is.
  [...p.d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Rainy').click();
  const chosen = p.read(TODAY_KEY).conditions;
  assert.equal(Math.round(chosen.feels), 24, 'the forecast temperature stays');
  assert.equal(chosen.place, 'Your location');
  assert.match(p.d.getElementById('today-weather').textContent, /^Your location · Rainy · /);
  assert.equal(p.d.getElementById('today-place-input').getAttribute('placeholder'), 'Your town', 'no other town suggested');
  p.close();
});

test('opened again later, she reads the forecast again and dresses again if rain has come', async () => {
  const dry = JSON.parse(JSON.stringify(LONDON)); dry.hourly.precipitation_probability = dry.hourly.precipitation_probability.map(() => 0);
  const morning = await open({ fetch: answer(dry) }), stored = morning.saved(), was = morning.read(TODAY_KEY).trio.pick.recipe;
  morning.close();
  const later = await open({ now: MORNING + 3 * 3600e3, storage: stored, fetch: answer(showers(LONDON, '2026-10-09')) });
  assert.equal(later.asked.length, 1, 'the forecast is read again');
  assert.match(later.d.getElementById('today-status').textContent, /The forecast changed: rain now, so she dressed again/);
  assert.match(later.d.getElementById('today-weather').textContent, /rain on and off/);
  assert.notDeepEqual(later.read(TODAY_KEY).trio.pick.recipe, was);
  later.close();
});

// The user's morning, 19 October 2026: rain and a weather alert at 7:00, then mostly sunny by the time they went out.
function wetMorning(json, day) {
  const v = JSON.parse(JSON.stringify(json)), h = v.hourly;
  h.shortwave_radiation ??= h.time.map(() => 0);
  h.time.forEach((t, i) => { if (!t.startsWith(day)) return; const hour = +t.slice(11, 13), wet = hour >= 6 && hour <= 9;
    h.apparent_temperature[i] = h.temperature_2m[i] = hour < 11 ? 18 : 24; h.precipitation_probability[i] = wet ? 90 : 10; h.precipitation[i] = wet ? 1.5 : 0;
    h.weather_code[i] = wet ? 63 : 1; h.shortwave_radiation[i] = wet ? 40 : 450; });
  v.current = { time: `${day}T07:00`, precipitation: 1.2, weather_code: 63 };
  return v;
}
test('rain early in the morning that stops before she is out does not make it a rainy day', async () => {
  const p = await open({ fetch: answer(wetMorning(LONDON, '2026-10-09')) });
  const c = p.read(TODAY_KEY).conditions, weather = p.d.getElementById('today-weather').textContent;
  assert.doesNotMatch(weather, /rain|Rain/, weather);
  assert.equal(c.rainingNow, false, 'rain at 7:00 is before she is out');
  assert.ok(c.sun > c.shade, 'the sunny afternoon she is out in counts');
  assert.ok(['pick', 'bolder', 'easier'].every(k => !/rain is likely/.test(p.read(TODAY_KEY).trio[k].reasons.join(' '))), 'no rain gear for a dry afternoon');
  p.close();
});
