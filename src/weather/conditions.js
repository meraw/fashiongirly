// The day's weather as the stylist reads it, wherever it came from: a forecast or the user's own choice.
// { day, place, source: 'forecast' | 'manual', feels, feelsMin, feelsMax, tempMin, tempMax, rainChance, rainMm,
//   windKmh, snow, code }. Temperatures are °C; `feels` is how warm her day (8:00 to 20:00) feels on average.

// Her day starts at 5:00 (the user's choice, 9 October 2026): before then it is still yesterday's look.
export const DAY_STARTS_AT = 5;
export function dayKey(now = Date.now(), startsAt = DAY_STARTS_AT) {
  const d = new Date(now - startsAt * 3600e3), pad = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Weather the user can choose when there is no forecast (offline, location refused) or to try another day.
export const PRESETS = [
  { id: 'hot', label: 'Hot', feels: 28 }, { id: 'warm', label: 'Warm', feels: 22 }, { id: 'mild', label: 'Mild', feels: 16 },
  { id: 'chilly', label: 'Chilly', feels: 10 }, { id: 'cold', label: 'Cold', feels: 3 }, { id: 'freezing', label: 'Freezing', feels: -3 },
  { id: 'rainy', label: 'Rainy', feels: 12, rainChance: 85, rainMm: 5, code: 63 }, { id: 'windy', label: 'Windy', feels: 13, windKmh: 45 },
  { id: 'snowy', label: 'Snowy', feels: -2, rainChance: 80, snow: true, code: 73 },
];
export function presetConditions(id, day = dayKey()) {
  const p = PRESETS.find(x => x.id === id); if (!p) return null;
  return cleanConditions({ ...p, day, source: 'manual', place: null, label: p.label });
}

const num = (v, lo, hi, fallback = null) => Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
export function cleanConditions(v) {
  if (!v || typeof v !== 'object' || !Number.isFinite(v.feels)) return null;
  return {
    day: typeof v.day === 'string' ? v.day : dayKey(), place: typeof v.place === 'string' ? v.place : null,
    source: v.source === 'forecast' ? 'forecast' : 'manual', label: typeof v.label === 'string' ? v.label : null,
    feels: num(v.feels, -40, 50), feelsMin: num(v.feelsMin, -40, 50, v.feels), feelsMax: num(v.feelsMax, -40, 50, v.feels),
    tempMin: num(v.tempMin, -40, 50), tempMax: num(v.tempMax, -40, 50),
    rainChance: num(v.rainChance, 0, 100, 0), rainMm: num(v.rainMm, 0, 500, 0), windKmh: num(v.windKmh, 0, 300, 0),
    snow: v.snow === true, code: num(v.code, 0, 99),
  };
}

// WMO weather codes, as Open-Meteo reports them.
const CODES = [[0, 'Clear'], [1, 'Mostly clear'], [2, 'Partly cloudy'], [3, 'Overcast'], [45, 'Fog'], [48, 'Fog'], [51, 'Light drizzle'], [53, 'Drizzle'],
  [55, 'Heavy drizzle'], [56, 'Freezing drizzle'], [57, 'Freezing drizzle'], [61, 'Light rain'], [63, 'Rain'], [65, 'Heavy rain'], [66, 'Freezing rain'],
  [67, 'Freezing rain'], [71, 'Light snow'], [73, 'Snow'], [75, 'Heavy snow'], [77, 'Snow grains'], [80, 'Showers'], [81, 'Showers'], [82, 'Heavy showers'],
  [85, 'Snow showers'], [86, 'Snow showers'], [95, 'Thunderstorms'], [96, 'Thunderstorms with hail'], [99, 'Thunderstorms with hail']];
export const codeLabel = code => CODES.find(([c]) => c === code)?.[1] ?? null;

// One line for the Today panel, e.g. "Dublin · Light rain · 9–14° (feels like 11°) · rain likely · breezy".
export function describe(c) {
  if (!c) return '';
  const parts = [];
  if (c.place) parts.push(c.place);
  const sky = c.source === 'forecast' ? codeLabel(c.code) : c.label;
  if (sky) parts.push(sky);
  if (Number.isFinite(c.tempMin) && Number.isFinite(c.tempMax)) parts.push(`${Math.round(c.tempMin)}–${Math.round(c.tempMax)}° (feels like ${Math.round(c.feels)}°)`);
  else parts.push(`about ${Math.round(c.feels)}°`);
  if (c.snow) parts.push('snow');
  else if (c.rainChance >= 50 || c.rainMm >= 1) parts.push(`rain likely (${Math.round(c.rainChance)}%)`);
  else if (c.rainChance >= 25) parts.push(`a chance of rain (${Math.round(c.rainChance)}%)`);
  if (c.windKmh >= 30) parts.push('windy'); else if (c.windKmh >= 20) parts.push('breezy');
  return parts.join(' · ');
}
