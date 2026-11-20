import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { JSDOM } from 'jsdom';
import { headsUp, notification } from '../src/weather/heads-up.js';
import { cleanConditions, isWindy, presetConditions, presetOver, describe } from '../src/weather/conditions.js';
import { toConditions, forecastUrl } from '../src/weather/open-meteo.js';
import { morningUrl, morningNotification } from '../src/weather/morning.js';
import { needsFor, composeOutfit } from '../src/style/stylist.js';
import { stylingFacts as facts } from '../src/style/facts.js';
import { bundleHeadsUp } from '../scripts/heads-up-bundle.mjs';
import { startStudio } from '../src/doll/app.js';

// The heads-up (20 November 2026): what the weather means for getting dressed, on the Today page and as a morning
// notification from the Android app.
const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const ROME = JSON.parse(readFileSync('tests/fixtures/open-meteo-rome-2026-10-12.json', 'utf8'));
const day = (fields = {}) => cleanConditions({ day: '2026-11-20', source: 'forecast', feels: 16, feelsMin: 13, feelsMax: 18, tempMin: 12, tempMax: 18, ...fields });
const ids = c => headsUp(c).map(a => a.id);
// A recorded forecast with every hour changed by `change(hourly, i, hour)`.
function variant(json, change) {
  const v = JSON.parse(JSON.stringify(json)), h = v.hourly;
  for (const key of ['wind_gusts_10m', 'uv_index', 'snowfall']) h[key] ??= h.time.map(() => 0);
  h.time.forEach((t, i) => change(h, i, +t.slice(11, 13)));
  return v;
}

test('an ordinary day has no heads-up and no notification', () => {
  assert.deepEqual(headsUp(day()), []);
  assert.equal(notification(headsUp(day())), null);
  assert.deepEqual(headsUp(null), []);
  const quiet = notification([], { test: true, place: 'Dublin' });
  assert.equal(quiet.title, 'Nothing to watch out for today', '"Send one now" still says something on a quiet day');
  assert.match(quiet.body, /Dublin/);
});

test('gusts make a windy day: hair up and no lip gloss, and she ties her hair back too', () => {
  const gusty = day({ windKmh: 22, gustKmh: 52, windiestAt: 15 });
  assert.equal(isWindy(gusty), true, 'gusts of 45 km/h and more count, though the steady wind is under 30');
  assert.equal(isWindy(day({ windKmh: 22, gustKmh: 40 })), false);
  assert.equal(isWindy(day({ windKmh: 30 })), true, 'a steady 30 km/h still counts');
  const [wind] = headsUp(gusty);
  assert.equal(wind.id, 'wind');
  assert.equal(wind.title, 'Windy');
  assert.equal(wind.detail, 'gusts up to 52 km/h, strongest around 15:00');
  assert.ok(wind.tips.some(t => /hair up/i.test(t)) && wind.tips.some(t => /lip gloss/i.test(t)) && wind.tips.some(t => /skirts/i.test(t)));
  assert.deepEqual(notification(headsUp(gusty)), { title: 'Windy · gusts up to 52 km/h, strongest around 15:00', body: 'Hair up, and skip the lip gloss.' });
  assert.equal(headsUp(day({ windKmh: 50 }))[0].title, 'Very windy');
  assert.equal(headsUp(day({ windKmh: 25, gustKmh: 70 }))[0].title, 'Very windy');
  assert.equal(needsFor(gusty).windy, true, 'the stylist reads the same windy day');
  const look = composeOutfit(gusty, { seed: 3 });
  assert.match(look.recipe.hairId, /ponytail|bun|braid/, 'her hair is tied back in the gusts');
  assert.equal(needsFor(gusty).bareLegs, false, 'and no mini skirt or mini dress: the heads-up says skirts fly');
  for (let seed = 1; seed <= 12; seed++) {
    const r = composeOutfit(day({ feels: 22, feelsMin: 18, feelsMax: 23, windKmh: 20, gustKmh: 55 }), { seed }).recipe;
    assert.ok(![r.bottomId, r.dressId].some(id => facts(id)?.bareLegs), `seed ${seed}: no bare legs in the wind`);
  }
  assert.match(describe(gusty), /windy/);
});

test('rain says when it falls and what to wear; in the wind a hood rather than an umbrella', () => {
  const rain = fields => headsUp(day({ rainChance: 80, rainMm: 3, wetHours: 4, code: 61, ...fields }))[0];
  assert.equal(rain({ wetFrom: 14, wetUntil: 20 }).title, 'Rain from 14:00');
  assert.equal(rain({ wetFrom: 8, wetUntil: 20 }).title, 'Rain all day');
  assert.equal(rain({ wetFrom: 8, wetUntil: 13 }).title, 'Rain until about 14:00');
  assert.equal(rain({ wetFrom: 12, wetUntil: 15 }).title, 'Rain from 12:00 to about 16:00');
  assert.equal(rain({ rainingNow: true, wetFrom: 8, wetUntil: 20 }).title, 'Raining now');
  assert.equal(rain({ wetFrom: 14, wetUntil: 20, rainMm: 12 }).title, 'Heavy rain from 14:00');
  const calm = rain({ wetFrom: 14, wetUntil: 20 });
  assert.ok(calm.tips.some(t => /waterproof shoes/i.test(t)) && calm.tips.some(t => /umbrella/i.test(t)));
  const windyRain = headsUp(day({ rainChance: 80, rainMm: 3, wetFrom: 14, wetUntil: 20, windKmh: 35, gustKmh: 60 }));
  assert.deepEqual(windyRain.map(a => a.id), ['rain', 'wind']);
  assert.ok(!windyRain[0].tips.some(t => /umbrella/i.test(t)), 'no umbrella in the wind');
  assert.ok(windyRain[1].tips.some(t => /too windy for an umbrella/i.test(t)));
  assert.deepEqual(notification(windyRain), { title: 'Rain from 14:00 and windy', body: 'Waterproof shoes and a hood. Hair up, and skip the lip gloss.' });
});

test('rain that does not make a rainy day is a note; rain that stopped early is left out of the notification', () => {
  assert.deepEqual(ids(day({ wetFrom: 18, wetUntil: 20, rainChance: 40 })), ['rain-later']);
  assert.deepEqual(ids(day({ wetFrom: 13, wetUntil: 13, wetHours: 1, rainMm: .4 })), ['shower']);
  assert.deepEqual(ids(day({ rainChance: 35 })), ['rain-maybe']);
  const early = headsUp(day({ wetFrom: 8, wetUntil: 9 }));
  assert.deepEqual(early.map(a => [a.id, a.level, a.title]), [['rain-early', 'note', 'Wet this morning, dry by 10:00']]);
  assert.equal(notification(early), null, 'wet ground from early rain is on the card, not a notification');
  assert.equal(notification(headsUp(day({ rainChance: 35 }))).body, 'A small umbrella, just in case.');
});

test('cold, ice, heat, strong sun and a big swing through the day', () => {
  assert.deepEqual(ids(day({ feels: 2, feelsMin: 0, feelsMax: 4, tempMin: 3 })), ['cold']);
  assert.equal(headsUp(day({ feels: -4, feelsMin: -6, feelsMax: -2 }))[0].title, 'Freezing');
  assert.deepEqual(ids(day({ feels: 3, feelsMin: 1, feelsMax: 5, tempMin: 0, rainChance: 70, rainMm: 2, wetFrom: 10, wetUntil: 16 })), ['rain', 'ice', 'cold']);
  assert.deepEqual(ids(day({ feels: 31, feelsMin: 24, feelsMax: 32 })), ['heat']);
  assert.deepEqual(ids(day({ uvMax: 7.2 })), ['sun']);
  assert.equal(headsUp(day({ uvMax: 7.2 }))[0].detail, 'UV 7');
  assert.deepEqual(ids(day({ uvMax: 7, rainChance: 80, rainMm: 3 })), ['rain'], 'no sunscreen warning on a rainy day');
  const swing = headsUp(day({ feels: 19, feelsMin: 8, feelsMax: 20, hours: [{ hour: 9, feels: 9 }] }));
  assert.deepEqual(swing.map(a => [a.id, a.title, a.detail]), [['layers', 'Cool morning, warm afternoon', '8° to 20°']]);
  assert.equal(notification(headsUp(day({ feels: 2, feelsMin: 0, feelsMax: 4 }))).title, 'Very cold · feels like 0°');
});

test('the chosen weather warns too, and chosen rain falls all day', () => {
  assert.deepEqual(ids(presetConditions('windy', '2026-11-20')), ['wind']);
  const forecast = day({ wetFrom: 18, wetUntil: 20 }), rainy = presetOver(forecast, 'rainy', '2026-11-20');
  assert.equal(headsUp(rainy)[0].title, 'Rain today', 'not the forecast\'s rain later');
});

test('the forecast is asked for gusts and the UV index, and says when it rains in her day', () => {
  assert.match(forecastUrl({ lat: 51.5, lon: -.13 }, '2026-10-09'), /wind_gusts_10m.*uv_index/);
  const v = variant(LONDON, (h, i, hour) => {
    h.wind_gusts_10m[i] = hour === 16 ? 58 : 20; h.uv_index[i] = hour === 13 ? 4.5 : 1;
    h.precipitation[i] = hour >= 15 && hour <= 17 ? 1.2 : 0; h.precipitation_probability[i] = hour >= 15 && hour <= 17 ? 70 : 10; h.weather_code[i] = hour >= 15 && hour <= 17 ? 61 : 3;
  });
  const c = toConditions(v, '2026-10-09', 'London');
  assert.equal(c.gustKmh, 58);
  assert.equal(c.windiestAt, 16);
  assert.equal(c.uvMax, 4.5);
  assert.deepEqual([c.wetFrom, c.wetUntil], [15, 17]);
  const old = toConditions(LONDON, '2026-10-09', 'London');
  assert.equal(old.gustKmh, 0, 'a forecast without gusts reads none');
  assert.equal(old.uvMax, null);
});

test('heads-up.js, the bundle the Android app runs, says exactly what the modules say', () => {
  const ctx = vm.createContext({});
  vm.runInContext(bundleHeadsUp(), ctx);
  assert.equal(typeof ctx.FashiongirlyHeadsUp.morningNotification, 'function', 'it runs with no browser or Node globals');
  assert.equal(ctx.FashiongirlyHeadsUp.morningUrl(51.51, -0.13, '2026-10-09'), morningUrl(51.51, -0.13, '2026-10-09'));
  assert.equal(morningUrl(51.51, -0.13, '2026-10-09'), forecastUrl({ lat: 51.51, lon: -0.13 }, '2026-10-09'));
  const windy = variant(ROME, (h, i) => { h.wind_gusts_10m[i] = 62; });
  for (const [json, date, place] of [[LONDON, '2026-10-09', 'London'], [ROME, '2026-10-12', 'Rome'], [windy, '2026-10-12', '']]) {
    for (const test of [false, true]) {
      const text = JSON.stringify(json), mine = morningNotification(text, date, place, test);
      ctx.args = [text, date, place, test];
      assert.equal(vm.runInContext('JSON.stringify(FashiongirlyHeadsUp.morningNotification(...args))', ctx), JSON.stringify(mine));
    }
  }
  assert.match(morningNotification(JSON.stringify(windy), '2026-10-12', '').title, /^Windy/);
  // Its own URLSearchParams, for a sandbox without one, writes what browsers write.
  const plain = vm.createContext({});
  vm.runInContext(`${bundleHeadsUp().replace('globalThis.URLSearchParams ||', '')}`, plain);
  assert.equal(plain.FashiongirlyHeadsUp.morningUrl(-33.87, 151.21, '2026-01-02'), forecastUrl({ lat: -33.87, lon: 151.21 }, '2026-01-02'));
});

test('the build writes heads-up.js next to index.html', () => {
  const build = readFileSync('scripts/build.mjs', 'utf8');
  assert.match(build, /writeFile\('dist\/heads-up\.js', bundleHeadsUp\(\)\)/);
});

// The Today page with a stand-in 3D view, a forecast changed by `change`, and optionally the Android app's bridge.
async function open({ change = () => {}, appBridge } = {}) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document;
  const json = variant(LONDON, change);
  const here = { getCurrentPosition(ok) { ok({ coords: { latitude: 51.51, longitude: -.13 } }); } };
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), {
    fetch: async () => ({ ok: true, status: 200, json: async () => json }), geolocation: here, now: () => new Date(2026, 9, 9, 7, 30).getTime(), ...(appBridge !== undefined ? { appBridge } : {}),
  });
  await app.today.ready;
  return { dom, d, app, close() { app.dispose(); dom.window.close(); } };
}

test('Today shows the heads-up above her looks on a day with something to watch out for', async () => {
  const p = await open({ change: (h, i, hour) => { h.wind_gusts_10m[i] = hour === 14 ? 55 : 30; } });
  const box = p.d.getElementById('today-headsup');
  assert.equal(box.hidden, false);
  const items = [...p.d.querySelectorAll('#today-headsup-list > li')];
  const wind = items.find(li => li.dataset.kind === 'wind');
  assert.ok(wind, 'the wind is in the heads-up');
  assert.match(wind.textContent, /Windy · gusts up to 55 km\/h, strongest around 14:00/);
  assert.match(wind.textContent, /lip gloss/);
  assert.match(p.app.getRecipe().hairId, /ponytail|bun|braid/, 'and her hair is tied back');
  p.close();
  const calm = await open({ change: (h, i) => { h.precipitation_probability[i] = 0; h.precipitation[i] = 0; h.weather_code[i] = 1; h.wind_speed_10m[i] = 8; h.apparent_temperature[i] = 17; h.temperature_2m[i] = 17; } });
  assert.equal(calm.d.getElementById('today-headsup').hidden, true, 'nothing on an ordinary day');
  calm.close();
});

test('in a browser there are no notification settings; in the Android app they turn the morning heads-up on', async () => {
  const web = await open({ appBridge: null });
  assert.equal(web.d.getElementById('today-notify').hidden, true);
  web.close();
  const calls = [];
  let status = { supported: true, enabled: false, time: '07:30', permission: 'ask', place: null, last: null, busy: false };
  const bridge = {
    status: () => JSON.stringify({ state: 'current', version: 1 }), check() {}, showUpdate() {},
    headsUp: () => JSON.stringify(status),
    setHeadsUp: (on, time) => calls.push(['setHeadsUp', on, time]),
    testHeadsUp: () => calls.push(['testHeadsUp']),
    setPlace: (lat, lon, name) => calls.push(['setPlace', lat, lon, name]),
    notificationSettings: () => calls.push(['notificationSettings']),
  };
  const p = await open({ appBridge: bridge }), d = p.d;
  assert.equal(d.getElementById('today-notify').hidden, false);
  assert.deepEqual(calls.find(c => c[0] === 'setPlace'), ['setPlace', 51.51, -.13, ''], 'the app learns the place the page read the weather for');
  assert.equal(d.getElementById('today-notify-on').checked, false);
  assert.match(d.getElementById('today-notify-status').textContent, /rain, wind, cold, strong sun/);
  d.getElementById('today-notify-time').value = '06:45';
  d.getElementById('today-notify-on').checked = true;
  d.getElementById('today-notify-on').dispatchEvent(new p.dom.window.Event('change'));
  assert.deepEqual(calls.at(-1), ['setHeadsUp', true, '06:45']);
  status = { ...status, enabled: true, time: '06:45', permission: 'granted', place: 'Dublin', last: { at: new Date(2026, 9, 9, 6, 46).getTime(), title: 'Windy' } };
  p.dom.window.dispatchEvent(new p.dom.window.Event('heads-up-change'));
  assert.match(d.getElementById('today-notify-status').textContent, /Every morning at 06:45, on the days the weather changes what to wear, for Dublin\. Last: “Windy”, today at 06:46\./);
  d.getElementById('today-notify-test').click();
  assert.deepEqual(calls.at(-1), ['testHeadsUp']);
  assert.equal(d.getElementById('today-notify-settings').hidden, true);
  status = { ...status, permission: 'denied' };
  p.dom.window.dispatchEvent(new p.dom.window.Event('heads-up-change'));
  assert.equal(d.getElementById('today-notify-on').checked, false);
  assert.match(d.getElementById('today-notify-status').textContent, /turned off for Fashiongirly/);
  d.getElementById('today-notify-settings').click();
  assert.deepEqual(calls.at(-1), ['notificationSettings']);
  status = { ...status, supported: false, permission: 'granted' };
  p.dom.window.dispatchEvent(new p.dom.window.Event('heads-up-change'));
  assert.equal(d.getElementById('today-notify-on').disabled, true);
  assert.match(d.getElementById('today-notify-status').textContent, /Android System WebView/);
  p.close();
});

test('the page and the Android app agree on the heads-up', () => {
  const activity = readFileSync('android/app/src/main/java/app/fashiongirly/MainActivity.java', 'utf8');
  const headsUpJava = readFileSync('android/app/src/main/java/app/fashiongirly/HeadsUp.java', 'utf8');
  const manifest = readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8'), gradle = readFileSync('android/app/build.gradle', 'utf8');
  const page = readFileSync('src/today/notify.js', 'utf8') + readFileSync('src/today/today.js', 'utf8');
  for (const [method, args] of [['headsUp', ''], ['setHeadsUp', 'boolean on, String time'], ['testHeadsUp', ''], ['setPlace', 'double lat, double lon, String name'], ['notificationSettings', '']]) {
    assert.match(activity, new RegExp(`@JavascriptInterface\\s+public \\w+ ${method}\\(${args}\\)`), `the app answers ${method}()`);
    assert.match(page, new RegExp(`${method}`), `the page uses ${method}()`);
  }
  assert.match(activity, /dispatchEvent\(new Event\('heads-up-change'\)\)/);
  assert.match(page, /addEventListener\('heads-up-change'/);
  for (const field of ['supported', 'enabled', 'time', 'permission', 'place', 'busy', 'last']) assert.match(headsUpJava, new RegExp(`json\\.put\\("${field}"`), `the app reports ${field}`);
  assert.match(headsUpJava, /FashiongirlyHeadsUp\.morningUrl\(/);
  assert.match(headsUpJava, /FashiongirlyHeadsUp\.morningNotification\(/);
  assert.match(headsUpJava, /"heads-up\.js"/);
  for (const permission of ['POST_NOTIFICATIONS', 'RECEIVE_BOOT_COMPLETED']) assert.match(manifest, new RegExp(`android\\.permission\\.${permission}`));
  assert.match(manifest, /android:name="\.HeadsUpReceiver"/);
  assert.match(manifest, /android:name="\.HeadsUpJob"[\s\S]*?BIND_JOB_SERVICE/);
  assert.match(manifest, /BOOT_COMPLETED/);
  assert.match(gradle, /androidx\.javascriptengine:javascriptengine:/);
});
