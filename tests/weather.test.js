import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dayKey, describe, cleanConditions, presetConditions, PRESETS, codeLabel, sunAllowance, forPerson, PERSONAL_LIMIT } from '../src/weather/conditions.js';
import { toConditions, fetchConditions, findPlace, forecastUrl } from '../src/weather/open-meteo.js';

// Real Open-Meteo answers, recorded once; the tests never use the network. London, 9 October 2026, was recorded
// before the forecast asked how sunny each hour is; Rome, 12 October 2026, a sunny day, has the sunshine.
const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const ROME = JSON.parse(readFileSync('tests/fixtures/open-meteo-rome-2026-10-12.json', 'utf8'));
const DUBLIN = JSON.parse(readFileSync('tests/fixtures/open-meteo-geocoding-dublin.json', 'utf8'));
const answer = (json, ok = true, status = 200) => async () => ({ ok, status, json: async () => json });

test('her day starts at 5:00', () => {
  assert.equal(dayKey(new Date(2026, 9, 9, 4, 59).getTime()), '2026-10-08');
  assert.equal(dayKey(new Date(2026, 9, 9, 5, 0).getTime()), '2026-10-09');
  assert.equal(dayKey(new Date(2026, 9, 9, 23, 30).getTime()), '2026-10-09');
});

const mean = a => a.reduce((s, v) => s + v, 0) / a.length;
const hoursOf = (json, from, to) => json.hourly.time.map((t, i) => [+t.slice(11, 13), i]).filter(([h]) => h >= from && h <= to).map(([, i]) => i);
test('the forecast becomes her day: she dresses for its warm part, 11:00 to 17:00; its range spans 8:00 to 20:00', () => {
  const c = toConditions(LONDON, '2026-10-09', 'London');
  const hours = hoursOf(LONDON, 8, 20), feels = hours.map(i => LONDON.hourly.apparent_temperature[i]);
  const warm = hoursOf(LONDON, 11, 17).map(i => LONDON.hourly.apparent_temperature[i]);
  assert.equal(c.source, 'forecast');
  assert.equal(c.place, 'London');
  assert.ok(Math.abs(c.shade - mean(warm)) < 1e-9, 'the warm part of her day, in the shade');
  assert.equal(c.sun, null, 'this answer does not say how sunny it is');
  assert.equal(c.feels, c.shade, 'so she dresses for the shade');
  assert.ok(c.feels > mean(feels), 'warmer than the whole day on average, which is what she used to dress for');
  assert.equal(c.feelsMin, Math.min(...feels));
  assert.equal(c.feelsMax, Math.max(...feels));
  assert.equal(c.rainChance, Math.max(...hours.map(i => LONDON.hourly.precipitation_probability[i])));
  assert.equal(c.snow, false, 'no snowfall in the answer means no snow');
  assert.match(describe(c), /^London · \w+ · \d+–\d+° \(feels like \d+°\) · rain likely/);
  assert.throws(() => toConditions({}, '2026-10-09'), /expected form/);
});

test('on a sunny day she dresses for the warm part of it in the sun, and Today says shade and sun', () => {
  const c = toConditions(ROME, '2026-10-12', 'Rome'), warm = hoursOf(ROME, 11, 17), h = ROME.hourly;
  assert.ok(Math.abs(c.shade - mean(warm.map(i => h.apparent_temperature[i]))) < 1e-9);
  assert.ok(Math.abs(c.sun - mean(warm.map(i => h.apparent_temperature[i] + sunAllowance(h.shortwave_radiation[i], h.wind_speed_10m[i])))) < 1e-9);
  assert.equal(c.feels, c.sun);
  assert.ok(c.sun - c.shade > 2 && c.sun - c.shade < 4, `the October sun adds a few degrees (${(c.sun - c.shade).toFixed(1)})`);
  assert.ok(c.feels - mean(hoursOf(ROME, 8, 20).map(i => h.apparent_temperature[i])) > 3, 'well above the old average of the day in the shade');
  assert.equal(describe(c), `Rome · Partly cloudy · 17–24° · this afternoon ${Math.round(c.shade)}° in the shade, about ${Math.round(c.sun)}° in the sun`);
  assert.match(forecastUrl({ lat: 41.9, lon: 12.5 }, '2026-10-12'), /shortwave_radiation/, 'the forecast is asked how sunny each hour is');
});

test('the sun counts for more in strong sunshine and less in wind; a person can ask for warmer or cooler', () => {
  assert.equal(sunAllowance(0, 5), 0); assert.equal(sunAllowance(null, 5), 0); assert.equal(sunAllowance(-3, 5), 0);
  assert.ok(sunAllowance(500, 5) > sunAllowance(200, 5));
  assert.ok(sunAllowance(500, 5) > sunAllowance(500, 40), 'wind carries the warmth away');
  const summer = sunAllowance(880, 7);
  assert.ok(summer > 5 && summer < 7, `strong summer sun with little wind: about five or six degrees (${summer.toFixed(1)})`);
  const c = cleanConditions({ feels: 20, feelsMin: 14, feelsMax: 22 });
  assert.deepEqual([forPerson(c, 2).feels, forPerson(c, 2).feelsMin, forPerson(c, 2).feelsMax], [22, 16, 24]);
  assert.equal(forPerson(c, 0), c); assert.equal(forPerson(c, 'hot'), c);
  assert.equal(forPerson(c, 99).feels, 20 + PERSONAL_LIMIT, 'within limits');
  assert.equal(c.feels, 20, 'the weather itself is unchanged');
});

test('the forecast keeps a few moments of her day: 9:00, 12:00, 15:00 and 18:00', () => {
  const c = toConditions(LONDON, '2026-10-09', 'London');
  assert.deepEqual(c.hours.map(x => x.hour), [9, 12, 15, 18]);
  const i = LONDON.hourly.time.indexOf('2026-10-09T15:00');
  assert.equal(c.hours[2].feels, LONDON.hourly.apparent_temperature[i]);
  assert.equal(c.hours[2].rain, LONDON.hourly.precipitation_probability[i]);
  assert.deepEqual(cleanConditions({ feels: 10, hours: [{ hour: 9, feels: 'cold' }, { hour: 12.5, feels: 3 }, { hour: 30, feels: 4, rain: 140 }] }).hours,
    [{ hour: 23, temp: null, feels: 4, rain: 100, snow: false, code: null }], 'only whole hours with a temperature, bounded');
  assert.deepEqual(presetConditions('mild').hours, [], 'chosen weather has no hours');
});

test('the forecast request asks for her day at rounded coordinates and reports refusals', async () => {
  const url = forecastUrl({ lat: 53.333061, lon: -6.248889 }, '2026-10-10');
  assert.match(url, /^https:\/\/api\.open-meteo\.com\/v1\/forecast\?/);
  assert.match(url, /latitude=53\.33&longitude=-6\.25/);
  assert.match(url, /start_date=2026-10-10&end_date=2026-10-10/);
  let asked = null;
  const c = await fetchConditions({ lat: 51.5, lon: -.13, name: 'London' }, '2026-10-09', async u => { asked = u; return { ok: true, status: 200, json: async () => LONDON }; });
  assert.ok(asked.includes('latitude=51.50'));
  assert.equal(c.place, 'London');
  await assert.rejects(fetchConditions({ lat: 1, lon: 1 }, '2026-10-09', answer({ error: true, reason: 'Daily API request limit exceeded.' }, false, 429)), /limit exceeded/);
  await assert.rejects(fetchConditions({ lat: 1, lon: 1 }, '2026-10-09', async () => { throw new TypeError('Failed to fetch'); }), /Failed to fetch/);
  await assert.rejects(fetchConditions({ lat: 1, lon: 1 }, '2026-10-09', null), /cannot fetch/);
});

test('a typed town is found with the free place search', async () => {
  let asked = null;
  const place = await findPlace(' Dublin ', async u => { asked = u; return { ok: true, status: 200, json: async () => DUBLIN }; });
  assert.match(asked, /^https:\/\/geocoding-api\.open-meteo\.com\/v1\/search\?name=Dublin&count=1/);
  assert.deepEqual(place, { name: 'Dublin, Ireland', lat: DUBLIN.results[0].latitude, lon: DUBLIN.results[0].longitude });
  assert.equal(await findPlace('Nowhere at all', answer({ generationtime_ms: 1 })), null);
});

test('chosen weather and stored weather are validated', () => {
  for (const p of PRESETS) { const c = presetConditions(p.id, '2026-10-09'); assert.equal(c.source, 'manual'); assert.equal(c.day, '2026-10-09'); assert.ok(describe(c)); }
  assert.equal(presetConditions('tropical storm'), null);
  assert.equal(cleanConditions({ feels: 'warm' }), null);
  const c = cleanConditions({ feels: 80, rainChance: 140, source: 'satellite' });
  assert.equal(c.feels, 50); assert.equal(c.rainChance, 100); assert.equal(c.source, 'manual');
  assert.equal(codeLabel(63), 'Rain'); assert.equal(codeLabel(4), null);
});
