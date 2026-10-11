// Her world for the day, and the time of day in it (the user's request, 11 October 2026: a collection of painted
// worlds, the time of day, and a foreground). Each world is painted by scripts/art/paint-scenery.py into
// src/art/worlds/<id>/: three skies (golden, day and night), the land behind her, the ground she stands on and a
// foreground in front of her. One world is chosen for the day and kept: the winter wood when it is cold, otherwise one
// of the others by the day's seed. Through the day the skies cross-fade with the sun: night, dawn, day, the golden
// hour, dusk. The weather is laid over whichever world it is (src/today/sky.js).
import { PALETTES } from '../art/worlds/palettes.js';

export const WORLD_IDS = Object.keys(PALETTES);
export const DEFAULT_WORLD = 'apricot-mountains';
export const worldName = id => PALETTES[id]?.name ?? PALETTES[DEFAULT_WORLD].name;
const WINTER = 'winter-wood', WARM = WORLD_IDS.filter(id => id !== WINTER);
const seedOf = text => [...String(text)].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);

// The world for a day: the winter wood on snowy or cold days, never on warm ones, otherwise one of the others.
// The same day and weather always give the same world.
export function worldFor(day, conditions = null) {
  const seed = seedOf(`world:${day}`);
  const cold = conditions && (conditions.snow || conditions.feels <= 3), chilly = conditions && conditions.feels <= 8;
  if (cold) return WINTER;
  if (chilly && seed % 3 === 0) return WINTER;
  return WARM[seed % WARM.length];
}

const minutes = clock => { const m = /^(\d\d):(\d\d)$/.exec(clock || ''); return m ? +m[1] * 60 + +m[2] : null; };
const smooth = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };

// How much of each sky shows at a time of day (minutes after midnight): the night sky until dawn, the golden sky as
// the sun rises (tinted cooler: `dawn`), the day sky from an hour or so after sunrise, the golden sky again in the
// last hour and a half before sunset, then night. Without the forecast's sun times, 7:00 and 19:00.
export function skyWeights(at, sunrise = null, sunset = null) {
  const up = minutes(sunrise) ?? 420, down = minutes(sunset) ?? 1140, t = ((at % 1440) + 1440) % 1440;
  // Morning: night to golden in the 45 minutes before sunrise, golden to day in the 75 after it.
  const morningGold = smooth(up - 45, up, t), morningDay = smooth(up + 15, up + 90, t);
  // Evening: day to golden in the 90 minutes before sunset, golden to night in the 45 after it.
  const eveningGold = 1 - smooth(down - 90, down - 20, t), eveningNight = smooth(down, down + 45, t);
  const lit = t < (up + down) / 2 ? morningGold : 1 - eveningNight, daylit = t < (up + down) / 2 ? morningDay : eveningGold;
  const night = 1 - lit, day = lit * daylit, golden = lit * (1 - daylit);
  return { night: +night.toFixed(3), golden: +golden.toFixed(3), day: +day.toFixed(3), dawn: t < (up + down) / 2 };
}

// The colour of a world's sky at height t (0 at the top, 1 at the horizon) for the given weights: the colours the 3D
// light takes the world's light from (src/doll/light.js).
export function skyColour(id, t, weights) {
  const p = PALETTES[id] ?? PALETTES[DEFAULT_WORLD], out = [0, 0, 0];
  for (const [phase, w] of [['golden', weights.golden], ['day', weights.day], ['night', weights.night]]) {
    if (!w) continue;
    const c = ramp(p.sky[phase].stops, t);
    for (let i = 0; i < 3; i++) out[i] += c[i] * w;
  }
  return out;
}
export function groundColour(id, t) { return ramp((PALETTES[id] ?? PALETTES[DEFAULT_WORLD]).ground, t); }
export function lightColours(id) { return (PALETTES[id] ?? PALETTES[DEFAULT_WORLD]).light; }
const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16) / 255);
function ramp(stops, t) {
  t = Math.max(0, Math.min(1, t));
  let i = 1; while (i < stops.length - 1 && stops[i][0] < t) i++;
  const [t0, a] = stops[i - 1], [t1, b] = stops[i], k = t1 > t0 ? (t - t0) / (t1 - t0) : 0, A = hex(a), B = hex(b);
  return A.map((v, j) => v + (B[j] - v) * Math.max(0, Math.min(1, k)));
}

// Where a world's painted sun stands on the screen, for its breathing glow: the sky is drawn to cover the page,
// centred across and 38% down (studio.css), so the sun's place in the picture maps to a place on the page.
export function sunOnScreen(id, weights, width, height, aspect = 1.5) {
  const p = PALETTES[id] ?? PALETTES[DEFAULT_WORLD], g = p.sky.golden.sun, d = p.sky.day.sun;
  const total = (g ? weights.golden : 0) + (d ? weights.day : 0);
  if (!total) return null;
  const sx = ((g?.[0] ?? 0) * (g ? weights.golden : 0) + (d?.[0] ?? 0) * (d ? weights.day : 0)) / total;
  const sy = ((g?.[1] ?? 0) * (g ? weights.golden : 0) + (d?.[1] ?? 0) * (d ? weights.day : 0)) / total;
  const scale = Math.max(width / (1200 * aspect), height / 1200), dw = 1200 * aspect * scale, dh = 1200 * scale;
  return { x: (width - dw) * .5 + sx * dw, y: (height - dh) * .38 + sy * dh, strength: total };
}

// Show a world and its time of day: the page's world (the sky, land, ground and foreground take its pictures through
// :root[data-world]), each sky's share, and the brightness of the land at this hour. The 3D light hears of it through
// a `world-change` event on the sky element.
export function paintWorld(doc, { world, weights }) {
  const root = doc.documentElement, sky = doc.getElementById('sky');
  const id = PALETTES[world] ? world : DEFAULT_WORLD, w = weights;
  const changed = root.dataset.world !== id || root.dataset.weights !== `${w.golden},${w.day},${w.night}` || root.dataset.dawn !== String(w.dawn);
  if (!changed) return id;
  root.dataset.world = id; root.dataset.weights = `${w.golden},${w.day},${w.night}`; root.dataset.dawn = String(w.dawn);
  const style = root.style;
  style.setProperty('--golden', w.golden); style.setProperty('--day', w.day); style.setProperty('--night', w.night);
  // The skies are stacked night, day, golden: each upper one's opacity so that the three add up to the weights.
  style.setProperty('--golden-a', w.golden); style.setProperty('--day-a', w.golden < 1 ? (w.day / (1 - w.golden)).toFixed(3) : 0);
  root.dataset.daylight = String(w.day >= .5);
  // The land, ground and foreground: a little warmer at the golden hours, darker and cooler by night.
  style.setProperty('--tod-bright', (w.day + w.golden * .96 + w.night * .42).toFixed(3));
  style.setProperty('--tod-sat', (w.day + w.golden * 1.06 + w.night * .62).toFixed(3));
  const win = doc.defaultView, sun = win && sunOnScreen(id, w, win.innerWidth || 390, win.innerHeight || 844);
  style.setProperty('--sun-px', sun ? `${sun.x.toFixed(0)}px` : '60%');
  style.setProperty('--sun-py', sun ? `${sun.y.toFixed(0)}px` : '36%');
  style.setProperty('--sun-glow', sun ? (w.golden * .95 + w.day * .45).toFixed(3) : '0');
  const Event = win?.CustomEvent;
  if (sky && Event) sky.dispatchEvent(new Event('world-change', { bubbles: true, detail: { world: id, weights: { ...w } } }));
  return id;
}
