// The stylist: she dresses herself from the wardrobe for the day's weather. Local, rule-based code; no AI and no network.
// Weather sets what is comfortable (how warm, whether a jacket, closed shoes in rain); her taste (taste.js) chooses
// among what is comfortable. Every result is a recipe that cleanRecipe() accepts unchanged, and every combination it
// can produce is one the layering tests already build, so nothing here changes how clothes fit.
import { DEFAULT, cleanRecipe } from '../doll/recipe.js';
import { HAIRSTYLES } from '../hair/catalog.js';
import { wardrobe } from './facts.js';
import { DEFAULT_DARING, scoreTaste, learnedBonus, cleanLearned } from './taste.js';

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// A small seeded random generator, so "another idea" varies and tests repeat exactly.
export function random(seed) {
  let a = seed >>> 0;
  return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// What the weather asks of an outfit. `feels` is how warm her day feels (°C); the thresholds are a starting point to
// tune with the user. Warmth adds up on the scale in facts.js: a tee (1) and jeans (2) make 3, right for about 21 °C.
export function needsFor(c) {
  const feels = Number.isFinite(c?.feels) ? c.feels : 16, rain = c?.rainChance ?? 0;
  const rainy = rain >= 50 || (c?.rainMm ?? 0) >= 1 || !!c?.snow, windy = (c?.windKmh ?? 0) >= 30;
  return {
    feels, rainy, windy, snow: !!c?.snow,
    target: clamp(3 + (21 - feels) / 3, 2, 10),
    outer: feels < 13 || (rainy && feels < 20) ? 'required' : feels >= 21 && !rainy ? 'none' : 'optional',
    bareLegs: feels >= 15 && !c?.snow,
    openShoes: feels >= 19 && rain < 40,
    boots: feels < 22,
  };
}

const warmthOf = p => p?.warmth ?? 2;
function outfitWarmth(o) {
  const body = o.dress ? warmthOf(o.dress) + .5 : warmthOf(o.top) + (o.under ? .5 * warmthOf(o.under) : 0) + warmthOf(o.bottom);
  return body + (o.outer ? warmthOf(o.outer) - (o.open ? .5 : 0) : 0) + (o.shoes ? (warmthOf(o.shoes) - 2) * .5 : 0);
}

function weatherReasons(o, needs) {
  const out = [];
  if (needs.outer === 'required' && o.outer) out.push(needs.rainy && o.outer.rain === 'ok' ? `rain is likely, so the ${o.outer.name} goes on` : `it's ${Math.round(needs.feels)}° out, so the ${o.outer.name} goes on`);
  else if (needs.outer === 'none') out.push(`warm enough at ${Math.round(needs.feels)}° to skip a jacket`);
  if (needs.rainy && o.shoes?.rain === 'ok') out.push(`the ${o.shoes.name} can take the wet`);
  if (needs.openShoes && o.shoes?.open) out.push('warm and dry: open shoes');
  return out;
}

// Which hairstyle goes with the outfit. Hair up shows off a collar or hood; wind and rain call for it tied back.
export function chooseHair(o, needs, rng, { keep, recentHair = [] } = {}) {
  if (keep) return { id: keep, reason: null };
  const tied = new Set(['high-ponytail', 'low-ponytail', 'high-bun', 'low-bun', 'side-braid']), up = new Set(['high-bun', 'high-ponytail', 'low-bun']);
  const highNeck = (o.dress || o.top)?.highNeck || (o.outer?.highNeck && !o.open);
  const choices = HAIRSTYLES.map(h => {
    let w = 1, why = null;
    if ((needs.windy || needs.rainy) && !tied.has(h.id)) w = 0;
    if (needs.windy && tied.has(h.id)) why = 'tied back against the wind';
    else if (needs.rainy && tied.has(h.id)) why = 'tied up for the rain';
    if (highNeck && up.has(h.id)) { w *= 2.5; why ??= 'worn up to show off the collar'; }
    if (highNeck && !tied.has(h.id)) w *= .6;
    const top = (o.dress || o.top)?.shape;
    if (top?.volume === 'big' && ['low-ponytail', 'low-bun', 'straight-v'].includes(h.id)) { w *= 1.5; why ??= 'sleek, against the volume of the top'; }
    if (top?.volume === 'slim' && ['wavy-v', 'straight-v', 'half-up'].includes(h.id)) { w *= 1.6; why ??= 'long and loose over a fitted top'; }
    if (recentHair[0] === h.id) w *= .3;
    return { id: h.id, name: h.name, w, why };
  }).filter(c => c.w > 0);
  let r = rng() * choices.reduce((s, c) => s + c.w, 0);
  for (const c of choices) if ((r -= c.w) <= 0) return { id: c.id, reason: c.why && `${c.name}: ${c.why}` };
  return { id: choices[0].id, reason: null };
}

const piecesOf = o => [o.top, o.under, o.bottom, o.dress, o.shoes, o.outer].filter(Boolean);
// How recently a piece was worn: yesterday's pieces are least likely, then the last few days; ideas already shown
// today are avoided too, so "another idea" brings something new.
function novelty(o, recent, shownToday) {
  let penalty = 0;
  for (const p of piecesOf(o)) {
    // The top or dress shows most, so she avoids repeating it within the week; other pieces come round sooner.
    const lead = p.slot === 'top' || p.slot === 'dress';
    recent.forEach((look, i) => { if (Object.values(look).includes(p.id)) penalty += lead ? (i === 0 ? 2 : i < 3 ? 1.5 : 1.1) : (i === 0 ? .9 : i < 3 ? .5 : .25); });
    for (const look of shownToday) if (Object.values(look).includes(p.id)) penalty += (p.slot === 'top' || p.slot === 'dress') ? 1.4 : .6;
  }
  return penalty;
}

/**
 * Dress her for the day.
 * conditions: weather (see src/weather/conditions.js); options:
 *   seed       varies the choice among the best outfits
 *   daring     0 (easy to wear) to 1 (inspiring); DEFAULT_DARING by default
 *   keep       { top, bottom, shoes, outerwear, dress, hair }: ids she must wear ('none' for outerwear: no jacket)
 *   avoid      ids she must not wear today
 *   recent     recipes of the last few days, newest first
 *   shownToday recipes already suggested today
 *   learned    what the user's reactions taught her (taste.js)
 *   current    the recipe she is wearing (keeps its top and bottoms under a dress)
 */
export function composeOutfit(conditions, options = {}) {
  const { seed = 1, daring = DEFAULT_DARING, keep = {}, avoid = [], recent = [], shownToday = [], current = DEFAULT } = options;
  const learned = cleanLearned(options.learned), rng = random(seed), needs = needsFor(conditions), w = options.wardrobe || wardrobe();
  const banned = new Set(avoid), byId = id => Object.values(w).flat().find(p => p.id === id);
  const pick = (slot, list, test) => {
    if (keep[slot]) return keep[slot] === 'none' ? [null] : [byId(keep[slot])].filter(Boolean);
    const free = list.filter(p => !banned.has(p.id)), ok = free.filter(test);
    return ok.length ? ok : free;
  };
  const shoes = pick('shoes', w.shoes, s => (!s.open || needs.openShoes) && (!needs.rainy || s.rain !== 'avoid') && (!s.shape.boot || needs.boots));
  const outerOptions = keep.outerwear ? pick('outerwear', w.outerwear) : needs.outer === 'none' ? [null]
    : [...(needs.outer === 'optional' ? [null] : []), ...pick('outerwear', w.outerwear, o => (!needs.rainy || o.rain !== 'avoid') && (needs.feels >= 5 || warmthOf(o) >= 3) && (needs.feels < 16 || warmthOf(o) <= 2))];
  const tops = pick('top', w.top, () => true), bottoms = pick('bottom', w.bottom, b => !needs.rainy || b.rain !== 'avoid');
  const underTops = w.top.filter(p => p.layering.underTop && !banned.has(p.id));
  const bases = [];
  if (!keep.top && !keep.bottom) for (const d of pick('dress', w.dress, d => !d.bareLegs || needs.bareLegs)) if (keep.dress || !d.bareLegs || needs.bareLegs) bases.push({ dress: d });
  if (!keep.dress) for (const top of tops) for (const under of top.layering.overTop ? [null, ...underTops.filter(u => u.id !== top.id)] : [null]) for (const bottom of bottoms) bases.push({ top, under, bottom });

  const openFor = outer => !!outer?.layering.openByDefault && needs.feels >= 12 && !needs.windy && !needs.rainy;
  const extras = new Set();
  for (const o of outerOptions) for (const s of shoes) extras.add((o ? warmthOf(o) - (openFor(o) ? .5 : 0) : 0) + (s ? (warmthOf(s) - 2) * .5 : 0));
  const recentRecipes = recent.map(r => ({ ...r })), shown = shownToday.map(r => ({ ...r }));
  const score = (o, final) => {
    const taste = scoreTaste(o, daring);
    let total = taste.total - novelty(o, recentRecipes, shown) + learnedBonus(learned, piecesOf(o).map(p => p.id));
    if (final) total -= .5 * Math.abs(outfitWarmth(o) - needs.target);
    return { total, reasons: taste.reasons };
  };
  const beam = (list, size) => {
    list.sort((a, b) => b.s.total - a.s.total);
    const best = list.slice(0, size), rest = list.slice(size);
    for (let i = 0; i < size / 4 && rest.length; i++) best.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return best;
  };
  let chosen = null;
  for (const tolerance of [1.5, 2.5, Infinity]) {
    const feasible = o => { const base = outfitWarmth({ ...o, outer: null, shoes: null }); return [...extras].some(x => Math.abs(base + x - needs.target) <= tolerance); };
    let stage = bases.filter(feasible).map(o => ({ o, s: score(o) }));
    stage = beam(stage, 60).flatMap(({ o }) => shoes.map(s => ({ ...o, shoes: s }))).map(o => ({ o, s: score(o) }));
    stage = beam(stage, 60).flatMap(({ o }) => outerOptions.map(outer => ({ ...o, outer, open: openFor(outer) })))
      .filter(o => Math.abs(outfitWarmth(o) - needs.target) <= tolerance).map(o => ({ o, s: score(o, true) }));
    if (!stage.length) continue;
    stage.sort((a, b) => b.s.total - a.s.total);
    // Choose among the best few, favouring the higher scores, so she is not the same every morning. Only the best
    // outfit for each top or dress competes, so the choice varies in the piece that shows most.
    const lead = new Set(), top = stage.filter(c => { const id = (c.o.dress || c.o.top).id; return !lead.has(id) && lead.add(id); }).slice(0, 8), heat = .35 + .3 * daring, weights = top.map(c => Math.exp((c.s.total - top[0].s.total) / heat));
    let r = rng() * weights.reduce((a, b) => a + b, 0);
    chosen = top.find((c, i) => (r -= weights[i]) <= 0) || top[0];
    break;
  }
  if (!chosen) return null;
  const o = chosen.o;
  const hair = chooseHair(o, needs, rng, { keep: keep.hair, recentHair: recent.map(r => r.hairId) });
  const recipe = cleanRecipe({
    ...current, knit: false, shirt: false, skirt: false,
    topId: o.top?.id ?? current.topId, underTopId: o.under?.id ?? 'none', bottomId: o.bottom?.id ?? current.bottomId,
    dressId: o.dress?.id ?? 'none', shoesId: o.shoes?.id ?? 'classic', outerwearId: o.outer?.id ?? 'none',
    outerwearOpen: o.open, outerwearInsert: !o.outer?.layering.detachable || needs.feels < 10 || needs.rainy, hairId: hair.id,
  });
  const reasons = [...weatherReasons(o, needs), ...chosen.s.reasons.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, r]) => r), ...(hair.reason ? [hair.reason] : [])];
  return {
    recipe, reasons,
    pieces: [['dress', o.dress], ['top', o.top], ['under', o.under], ['bottom', o.bottom], ['shoes', o.shoes], ['outerwear', o.outer]].filter(([, p]) => p).map(([slot, p]) => ({ slot, id: p.id, name: p.name })),
    warmth: { total: outfitWarmth(o), target: needs.target }, score: chosen.s.total,
  };
}
