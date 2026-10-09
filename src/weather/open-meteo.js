// The day's forecast from Open-Meteo (https://open-meteo.com): free, with no key or account, and callable from the
// browser. Its free tier is for non-commercial use, which suits this personal app (the user's answer, 9 October 2026).
// Its data is CC BY 4.0, so the Today panel credits it. This module is the app's only network request.
import { cleanConditions } from './conditions.js';

export const FORECAST = 'https://api.open-meteo.com/v1/forecast';
export const GEOCODING = 'https://geocoding-api.open-meteo.com/v1/search';
const HOURLY = 'temperature_2m,apparent_temperature,precipitation_probability,precipitation,snowfall,wind_speed_10m,weather_code';
// Her day, in local hours: what she dresses for.
const FROM = 8, TO = 20;

export function forecastUrl({ lat, lon }, day) {
  const q = new URLSearchParams({ latitude: lat.toFixed(2), longitude: lon.toFixed(2), hourly: HOURLY, timezone: 'auto', start_date: day, end_date: day });
  return `${FORECAST}?${q}`;
}

async function getJson(url, fetchImpl, timeoutMs) {
  if (typeof fetchImpl !== 'function') throw new Error('This browser cannot fetch the weather.');
  const ctrl = typeof AbortController === 'function' ? new AbortController() : null;
  const timer = ctrl && setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(url, ctrl ? { signal: ctrl.signal } : undefined);
    const json = await res.json().catch(() => null);
    // Open-Meteo explains a refusal (a daily limit, a bad request) as { error: true, reason }.
    if (!res.ok || json?.error) throw new Error(json?.reason ? `The weather service said: ${json.reason}` : `The weather service answered ${res.status}.`);
    return json;
  } catch (error) {
    throw new Error(error?.name === 'AbortError' ? 'The weather took too long to answer.' : error?.message || 'The weather could not be reached.');
  } finally { clearTimeout(timer); }
}

// Reduce the hourly forecast to her day: the range and average of how warm it feels, the chance and amount of rain,
// the strongest wind, and the most common sky (rain wins if it falls for two hours or more).
export function toConditions(json, day, place = null) {
  const h = json?.hourly;
  if (!h || !Array.isArray(h.time)) throw new Error('The forecast was not in the expected form.');
  let idx = h.time.map((t, i) => [t, i]).filter(([t]) => t.startsWith(day) && +t.slice(11, 13) >= FROM && +t.slice(11, 13) <= TO).map(([, i]) => i);
  if (!idx.length) idx = h.time.map((_, i) => i);
  const vals = key => idx.map(i => h[key]?.[i]).filter(Number.isFinite);
  const feels = vals('apparent_temperature'), temp = vals('temperature_2m');
  if (!feels.length) throw new Error('The forecast had no temperatures.');
  const sum = a => a.reduce((s, v) => s + v, 0), codes = vals('weather_code'), count = {};
  for (const c of codes) count[c] = (count[c] || 0) + 1;
  const common = list => list.sort((a, b) => count[b] - count[a] || b - a)[0];
  const wet = Object.keys(count).map(Number).filter(c => c >= 51 && count[c] >= 2);
  return cleanConditions({
    day, place, source: 'forecast',
    feels: sum(feels) / feels.length, feelsMin: Math.min(...feels), feelsMax: Math.max(...feels),
    tempMin: temp.length ? Math.min(...temp) : null, tempMax: temp.length ? Math.max(...temp) : null,
    rainChance: Math.max(0, ...vals('precipitation_probability')), rainMm: sum(vals('precipitation')),
    windKmh: Math.max(0, ...vals('wind_speed_10m')), snow: sum(vals('snowfall')) > 0,
    code: codes.length ? common(wet.length ? wet : Object.keys(count).map(Number)) : null,
  });
}

export async function fetchConditions(place, day, fetchImpl, { timeoutMs = 10000 } = {}) {
  return toConditions(await getJson(forecastUrl(place, day), fetchImpl, timeoutMs), day, place.name ?? null);
}

// A typed town to coordinates, with Open-Meteo's free place search.
export async function findPlace(name, fetchImpl, { timeoutMs = 10000 } = {}) {
  const q = new URLSearchParams({ name: String(name).trim(), count: '1', language: 'en', format: 'json' });
  const json = await getJson(`${GEOCODING}?${q}`, fetchImpl, timeoutMs), r = json?.results?.[0];
  if (!r || !Number.isFinite(r.latitude) || !Number.isFinite(r.longitude)) return null;
  return { name: [r.name, r.country].filter(Boolean).join(', '), lat: r.latitude, lon: r.longitude };
}
