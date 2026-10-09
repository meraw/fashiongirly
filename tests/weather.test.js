import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dayKey, describe, cleanConditions, presetConditions, PRESETS, codeLabel } from '../src/weather/conditions.js';
import { toConditions, fetchConditions, findPlace, forecastUrl } from '../src/weather/open-meteo.js';

// A real Open-Meteo answer for London on 9 October 2026, recorded once; the tests never use the network.
const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const DUBLIN = JSON.parse(readFileSync('tests/fixtures/open-meteo-geocoding-dublin.json', 'utf8'));
const answer = (json, ok = true, status = 200) => async () => ({ ok, status, json: async () => json });

test('her day starts at 5:00', () => {
  assert.equal(dayKey(new Date(2026, 9, 9, 4, 59).getTime()), '2026-10-08');
  assert.equal(dayKey(new Date(2026, 9, 9, 5, 0).getTime()), '2026-10-09');
  assert.equal(dayKey(new Date(2026, 9, 9, 23, 30).getTime()), '2026-10-09');
});

test('the forecast becomes her day: 8:00 to 20:00', () => {
  const c = toConditions(LONDON, '2026-10-09', 'London');
  const hours = LONDON.hourly.time.map((t, i) => [+t.slice(11, 13), i]).filter(([h]) => h >= 8 && h <= 20).map(([, i]) => i);
  const feels = hours.map(i => LONDON.hourly.apparent_temperature[i]);
  assert.equal(c.source, 'forecast');
  assert.equal(c.place, 'London');
  assert.ok(Math.abs(c.feels - feels.reduce((a, b) => a + b) / feels.length) < 1e-9);
  assert.equal(c.feelsMin, Math.min(...feels));
  assert.equal(c.rainChance, Math.max(...hours.map(i => LONDON.hourly.precipitation_probability[i])));
  assert.equal(c.snow, false, 'no snowfall in the answer means no snow');
  assert.match(describe(c), /^London · \w+ · \d+–\d+° \(feels like \d+°\) · rain likely/);
  assert.throws(() => toConditions({}, '2026-10-09'), /expected form/);
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
