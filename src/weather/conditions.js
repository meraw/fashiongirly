// The day's weather as the stylist reads it, wherever it came from: a forecast or the user's own choice.
// { day, place, source: 'forecast' | 'manual', feels, feelsMin, feelsMax, shade, sun, tempMin, tempMax, rainChance,
//   rainMm, windKmh, snow, code }. Temperatures are °C. `feels` is what she dresses for: how warm the warm part of her
// day (11:00 to 17:00, when she is out in it) feels, in the sun when the forecast says how sunny it is (the user,
// 12 October 2026: the old average of 8:00 to 20:00 in the shade dressed her for a day cooler than the one she had).
// `shade` and `sun` are those hours in the shade and in the sun; feelsMin and feelsMax span her whole day, 8:00 to
// 20:00, in the shade.

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
  { id: 'rainy', label: 'Rainy', feels: 12, rainChance: 85, rainMm: 5, code: 63 }, { id: 'pouring', label: 'Pouring', feels: 11, rainChance: 95, rainMm: 14, code: 65 }, { id: 'windy', label: 'Windy', feels: 13, windKmh: 45 },
  { id: 'snowy', label: 'Snowy', feels: -2, rainChance: 80, snow: true, code: 73 },
];
export function presetConditions(id, day = dayKey()) {
  const p = PRESETS.find(x => x.id === id); if (!p) return null;
  return cleanConditions({ ...p, day, source: 'manual', place: null, label: p.label });
}
// A chosen weather on top of today's forecast, when there is one (the user, 19 October 2026: "Rainy" should add rain to
// their own warm day, not swap it for a cold one somewhere else). Rain, pouring, wind and snow keep the forecast's
// temperatures and place; a temperature keeps its rain and wind. Without a forecast, the chosen weather as it is.
export function presetOver(base, id, day = dayKey()) {
  const p = PRESETS.find(x => x.id === id), b = cleanConditions(base);
  if (!p || !b || b.day !== day) return presetConditions(id, day);
  const kind = ['rainy', 'pouring', 'windy', 'snowy'].includes(p.id), feels = kind ? (b.shade ?? b.feels) : p.feels, shift = feels - b.feels;
  return cleanConditions({
    ...b, source: 'manual', label: p.label, sun: null, shade: feels, feels,
    feelsMin: b.feelsMin + shift, feelsMax: b.feelsMax + shift,
    ...(p.id === 'snowy' ? { feels: Math.min(feels, p.feels), shade: Math.min(feels, p.feels) } : {}),
    ...(kind ? { rainChance: Math.max(b.rainChance, p.rainChance ?? 0), rainMm: Math.max(b.rainMm, p.rainMm ?? 0), windKmh: Math.max(b.windKmh, p.windKmh ?? 0),
      snow: p.snow === true || b.snow, code: p.code ?? b.code, wetHours: p.rainChance ? Math.max(b.wetHours, 6) : b.wetHours } : {}),
  });
}

// How much warmer it feels in the sun than in the shade (°C), from the sunshine reaching the ground (shortwave
// radiation, W/m²) and the wind (km/h): the sun's term in Steadman's apparent temperature, 0.7·Q / (wind + 10) with
// the wind in m/s, where Q is what a body standing in the sun takes in per square metre of it, about an eighth of the
// sunshine on the ground (the sun falls on roughly a quarter of a standing body, which absorbs about half of it). In
// strong summer sun with little wind that is five or six degrees; when it is overcast or blowing, a degree or less.
// Open-Meteo's apparent temperature is the one in the shade: it follows Steadman's formula without the sun.
export function sunAllowance(radiation, windKmh = 0) {
  return Number.isFinite(radiation) && radiation > 0 ? .7 * (.12 * radiation) / (Math.max(0, windKmh || 0) / 3.6 + 10) : 0;
}
// The day as she dresses for one person: `offset` degrees warmer for someone her outfits keep too warm, cooler for
// someone they keep too cool (Today's "Too warm" and "Too cool"). The weather itself is unchanged.
export const PERSONAL_LIMIT = 8;
export function forPerson(c, offset = 0) {
  const o = Number.isFinite(offset) ? Math.max(-PERSONAL_LIMIT, Math.min(PERSONAL_LIMIT, offset)) : 0;
  return c && o ? { ...c, feels: c.feels + o, feelsMin: c.feelsMin + o, feelsMax: c.feelsMax + o } : c;
}

// Whether the sun makes the warm part of the day feel at least a degree warmer than the shade: she dressed for it in the sun.
export const inTheSun = c => Number.isFinite(c?.sun) && Number.isFinite(c?.shade) && Math.round(c.sun) - Math.round(c.shade) >= 1;

const num = (v, lo, hi, fallback = null) => Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : fallback;
// A local time of day, "HH:MM", or null.
const clock = v => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : null;
export function cleanConditions(v) {
  if (!v || typeof v !== 'object' || !Number.isFinite(v.feels)) return null;
  return {
    day: typeof v.day === 'string' ? v.day : dayKey(), place: typeof v.place === 'string' ? v.place : null,
    source: v.source === 'forecast' ? 'forecast' : 'manual', label: typeof v.label === 'string' ? v.label : null,
    feels: num(v.feels, -40, 50), feelsMin: num(v.feelsMin, -40, 50, v.feels), feelsMax: num(v.feelsMax, -40, 50, v.feels),
    shade: num(v.shade, -40, 50), sun: num(v.sun, -40, 50),
    tempMin: num(v.tempMin, -40, 50), tempMax: num(v.tempMax, -40, 50),
    rainChance: num(v.rainChance, 0, 100, 0), rainMm: num(v.rainMm, 0, 500, 0), windKmh: num(v.windKmh, 0, 300, 0),
    snow: v.snow === true, code: num(v.code, 0, 99),
    // Hours of her day with rain falling (on and off counts), and whether it is raining as the forecast is read.
    wetHours: num(v.wetHours, 0, 24, 0), rainingNow: v.rainingNow === true,
    sunrise: clock(v.sunrise), sunset: clock(v.sunset),
    hours: (Array.isArray(v.hours) ? v.hours : []).filter(x => x && Number.isInteger(x.hour) && Number.isFinite(x.feels)).slice(0, 6).map(x => ({
      hour: Math.max(0, Math.min(23, x.hour)), temp: num(x.temp, -40, 50), feels: num(x.feels, -40, 50), rain: num(x.rain, 0, 100, 0), snow: x.snow === true, code: num(x.code, 0, 99),
    })),
  };
}

// Whether it is a rainy day: in the hours she is out (11:00 to 17:00, see toConditions in open-meteo.js), a likely
// chance of rain, a millimetre or more, rain in three or more of those hours, or rain falling in them now (one passing
// shower on a sunny day is not a rainy day, nor is rain early in the morning that has stopped by the time she is out). On a day of short showers the forecast's chance of rain stays low (each hour's chance is small),
// so the hours themselves count too (the user, 19 October 2026: it rained all morning while she said "warm and dry").
export const isRainy = c => !!c && ((c.rainChance ?? 0) >= 50 || (c.rainMm ?? 0) >= 1 || (c.wetHours ?? 0) >= 3 || c.rainingNow === true || c.snow === true);

// WMO weather codes, as Open-Meteo reports them.
const CODES = [[0, 'Clear'], [1, 'Mostly clear'], [2, 'Partly cloudy'], [3, 'Overcast'], [45, 'Fog'], [48, 'Fog'], [51, 'Light drizzle'], [53, 'Drizzle'],
  [55, 'Heavy drizzle'], [56, 'Freezing drizzle'], [57, 'Freezing drizzle'], [61, 'Light rain'], [63, 'Rain'], [65, 'Heavy rain'], [66, 'Freezing rain'],
  [67, 'Freezing rain'], [71, 'Light snow'], [73, 'Snow'], [75, 'Heavy snow'], [77, 'Snow grains'], [80, 'Showers'], [81, 'Showers'], [82, 'Heavy showers'],
  [85, 'Snow showers'], [86, 'Snow showers'], [95, 'Thunderstorms'], [96, 'Thunderstorms with hail'], [99, 'Thunderstorms with hail']];
export const codeLabel = code => CODES.find(([c]) => c === code)?.[1] ?? null;

// One line for the Today panel, e.g. "Dublin · Light rain · 9–14° (feels like 11°) · rain likely · breezy", or on a
// sunny day "Rome · Partly cloudy · 17–24° · this afternoon 22° in the shade, about 25° in the sun".
export function describe(c) {
  if (!c) return '';
  const parts = [];
  if (c.place) parts.push(c.place);
  const sky = c.source === 'forecast' ? codeLabel(c.code) : c.label;
  if (sky) parts.push(sky);
  const sunny = inTheSun(c);
  const range = Number.isFinite(c.tempMin) && Number.isFinite(c.tempMax) ? `${Math.round(c.tempMin)}–${Math.round(c.tempMax)}°` : null;
  if (sunny) parts.push(...(range ? [range] : []), `this afternoon ${Math.round(c.shade)}° in the shade, about ${Math.round(c.sun)}° in the sun`);
  else if (range) parts.push(`${range} (feels like ${Math.round(c.feels)}°)`);
  else parts.push(`about ${Math.round(c.feels)}°`);
  if (c.snow) parts.push('snow');
  else if (c.rainingNow) parts.push('raining now');
  else if (c.rainChance >= 50) parts.push(`rain likely (${Math.round(c.rainChance)}%)`);
  else if (isRainy(c)) parts.push('rain on and off');
  else if (c.rainChance >= 25) parts.push(`a chance of rain (${Math.round(c.rainChance)}%)`);
  if (c.windKmh >= 30) parts.push('windy'); else if (c.windKmh >= 20) parts.push('breezy');
  return parts.join(' · ');
}
