// The stylist: she dresses herself from the wardrobe for the day's weather. Local, rule-based code; no AI and no network.
// Weather sets what is comfortable (how warm, whether a jacket, closed shoes in rain); her taste (taste.js) chooses
// among what is comfortable. Every result is a recipe that cleanRecipe() accepts unchanged, and every combination it
// can produce is one the layering tests already build, so nothing here changes how clothes fit.
import { DEFAULT, cleanRecipe } from '../doll/recipe.js';
import { HAIRSTYLES } from '../hair/catalog.js';
import { wardrobe } from './facts.js';
import { DEFAULT_DARING, scoreTaste, learnedBonus, cleanLearned, boldness } from './taste.js';
import { stylingFacts } from './facts.js';

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

// Everything the stylist works from for one request: what the weather asks, which pieces suit it, and how she scores.
function context(conditions, options) {
  const { seed = 1, daring = DEFAULT_DARING, keep = {}, avoid = [], recent = [], shownToday = [] } = options;
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
  const dresses = keep.top || keep.bottom ? [] : pick('dress', w.dress, d => !d.bareLegs || needs.bareLegs).filter(d => keep.dress || !d.bareLegs || needs.bareLegs);
  const underTops = w.top.filter(p => p.layering.underTop && !banned.has(p.id));
  const openFor = outer => !!outer?.layering.openByDefault && needs.feels >= 12 && !needs.windy && !needs.rainy;
  const recentRecipes = recent.map(r => ({ ...r })), shown = shownToday.map(r => ({ ...r }));
  const score = (o, final) => {
    const taste = scoreTaste(o, daring);
    let total = taste.total - novelty(o, recentRecipes, shown) + learnedBonus(learned, piecesOf(o).map(p => p.id));
    if (final) total -= .5 * Math.abs(outfitWarmth(o) - needs.target);
    return { total, reasons: taste.reasons };
  };
  return { seed, daring, keep, recent, needs, rng, shoes, outerOptions, tops, bottoms, dresses, underTops, openFor, score, w };
}

// Daring sets how bold she goes, measured on the outfits themselves: among the outfits that suit the weather, an easy
// day aims for the quieter end and a daring one for the boldest. Each candidate is pulled towards that point.
const target = daring => .1 + .8 * daring;
function pullToDaring(list, daring) {
  const ranked = list.map(c => [c, boldness(c.o)]).sort((a, b) => a[1] - b[1]);
  ranked.forEach(([c, b], i) => { c.bold = b; c.s = { ...c.s, total: c.s.total - 4 * Math.abs((ranked.length > 1 ? i / (ranked.length - 1) : .5) - target(daring)) }; });
  return list;
}

function finish(o, needs, s, rng, { keep = {}, recent = [], current = DEFAULT, hairId = null } = {}) {
  const hair = hairId ? { id: hairId, reason: null } : chooseHair(o, needs, rng, { keep: keep.hair, recentHair: recent.map(r => r.hairId) });
  const recipe = cleanRecipe({
    ...current, knit: false, shirt: false, skirt: false, tucked: undefined,
    topId: o.top?.id ?? current.topId, underTopId: o.under?.id ?? 'none', bottomId: o.bottom?.id ?? current.bottomId,
    dressId: o.dress?.id ?? 'none', shoesId: o.shoes?.id ?? 'classic', outerwearId: o.outer?.id ?? 'none',
    outerwearOpen: o.open, outerwearInsert: !o.outer?.layering.detachable || needs.feels < 10 || needs.rainy, hairId: hair.id,
  });
  const reasons = [...weatherReasons(o, needs), ...s.reasons.sort((a, b) => b[0] - a[0]).slice(0, 2).map(([, r]) => r), ...(hair.reason ? [hair.reason] : [])];
  return {
    recipe, reasons,
    pieces: [['dress', o.dress], ['top', o.top], ['under', o.under], ['bottom', o.bottom], ['shoes', o.shoes], ['outerwear', o.outer]].filter(([, p]) => p).map(([slot, p]) => ({ slot, id: p.id, name: p.name })),
    warmth: { total: outfitWarmth(o), target: needs.target }, score: s.total, boldness: boldness(o),
  };
}

/**
 * Dress her for the day.
 * conditions: weather (see src/weather/conditions.js); options:
 *   seed       varies the choice among the best outfits
 *   daring     0 (easy to wear) to 1 (bold); DEFAULT_DARING by default
 *   keep       { top, bottom, shoes, outerwear, dress, hair }: ids she must wear ('none' for outerwear: no jacket)
 *   avoid      ids she must not wear today
 *   recent     recipes of the last few days, newest first
 *   shownToday recipes already suggested today
 *   learned    what the user's reactions taught her (taste.js)
 *   current    the recipe she is wearing (keeps its top and bottoms under a dress)
 */
export function composeOutfit(conditions, options = {}) {
  const c = context(conditions, options), { needs, rng, daring } = c;
  const bases = [];
  for (const d of c.dresses) bases.push({ dress: d });
  if (!c.keep.dress) for (const top of c.tops) for (const under of top.layering.overTop ? [null, ...c.underTops.filter(u => u.id !== top.id)] : [null]) for (const bottom of c.bottoms) bases.push({ top, under, bottom });
  const extras = new Set();
  for (const o of c.outerOptions) for (const s of c.shoes) extras.add((o ? warmthOf(o) - (c.openFor(o) ? .5 : 0) : 0) + (s ? (warmthOf(s) - 2) * .5 : 0));
  const beam = (list, size) => {
    pullToDaring(list, daring).sort((a, b) => b.s.total - a.s.total);
    const best = list.slice(0, size), rest = list.slice(size);
    for (let i = 0; i < size / 4 && rest.length; i++) best.push(rest.splice(Math.floor(rng() * rest.length), 1)[0]);
    return best;
  };
  for (const tolerance of [1.5, 2.5, Infinity]) {
    const feasible = o => { const base = outfitWarmth({ ...o, outer: null, shoes: null }); return [...extras].some(x => Math.abs(base + x - needs.target) <= tolerance); };
    let stage = bases.filter(feasible).map(o => ({ o, s: c.score(o) }));
    stage = beam(stage, 60).flatMap(({ o }) => c.shoes.map(s => ({ ...o, shoes: s }))).map(o => ({ o, s: c.score(o) }));
    stage = beam(stage, 60).flatMap(({ o }) => c.outerOptions.map(outer => ({ ...o, outer, open: c.openFor(outer) })))
      .filter(o => Math.abs(outfitWarmth(o) - needs.target) <= tolerance).map(o => ({ o, s: c.score(o, true) }));
    if (!stage.length) continue;
    pullToDaring(stage, daring).sort((a, b) => b.s.total - a.s.total);
    // Choose among the best few, favouring the higher scores, so she is not the same every morning. Only the best
    // outfit for each top or dress competes, so the choice varies in the piece that shows most.
    const lead = new Set(), top = stage.filter(x => { const id = (x.o.dress || x.o.top).id; return !lead.has(id) && lead.add(id); }).slice(0, 8);
    const weights = top.map(x => Math.exp((x.s.total - top[0].s.total) / .45));
    let r = rng() * weights.reduce((a, b) => a + b, 0);
    const chosen = top.find((x, i) => (r -= weights[i]) <= 0) || top[0];
    return finish(chosen.o, needs, chosen.s, rng, options);
  }
  return null;
}

// The outfit a recipe describes, as styling facts.
export function outfitOf(recipe) {
  const f = id => (id && id !== 'none' && id !== 'classic' ? stylingFacts(id) : null);
  const o = recipe.dressId !== 'none'
    ? { dress: f(recipe.dressId) }
    : { top: f(recipe.topId), under: f(recipe.underTopId), bottom: f(recipe.bottomId) };
  return { ...o, shoes: f(recipe.shoesId), outer: f(recipe.outerwearId), open: !!recipe.outerwearOpen };
}

// The smallest change to the look she is wearing: swap one piece, or two if one is not enough. Kept pieces stay.
// `want(candidate)` says whether a change is acceptable; the best-scoring acceptable change wins.
function smallestChange(conditions, recipe, options, slots, want) {
  const c = context(conditions, options), { needs } = c, now = outfitOf(recipe);
  const swaps = slot => {
    if (c.keep[slot === 'outer' ? 'outerwear' : slot]) return [];
    const list = { top: now.dress ? [] : c.tops, under: now.top?.layering.overTop ? [null, ...c.underTops.filter(u => u.id !== now.top.id)] : [], bottom: now.dress ? [] : c.bottoms, dress: now.dress ? c.dresses : [], shoes: c.shoes, outer: c.outerOptions }[slot] || [];
    return list.filter(p => (p?.id ?? null) !== (now[slot]?.id ?? null)).map(p => {
      const o = { ...now, [slot]: p };
      if (slot === 'top' && !p.layering.overTop) o.under = null;
      if (slot === 'outer') o.open = c.openFor(p);
      return o;
    });
  };
  const fits = o => Math.abs(outfitWarmth(o) - needs.target) <= Math.max(1.5, Math.abs(outfitWarmth(now) - needs.target));
  let found = [];
  const one = slots.flatMap(swaps).filter(fits);
  found = one.filter(want);
  if (!found.length) {
    for (const o of one) for (const slot of slots) for (const o2 of swaps(slot).map(x => ({ ...o, [slot]: x[slot], ...(slot === 'outer' ? { open: x.open } : {}) }))) if (fits(o2) && want(o2)) found.push(o2);
  }
  if (!found.length) return null;
  const scored = found.map(o => ({ o, s: c.score(o, true) })).sort((a, b) => b.s.total - a.s.total);
  const best = scored[0];
  const changed = ['dress', 'top', 'under', 'bottom', 'shoes', 'outer'].filter(k => (best.o[k]?.id ?? null) !== (now[k]?.id ?? null));
  const result = finish(best.o, needs, best.s, c.rng, { ...options, current: recipe, hairId: recipe.hairId });
  const name = p => p?.name ?? 'no jacket';
  result.changed = changed.map(k => ({ slot: k === 'outer' ? 'outerwear' : k, from: name(now[k]), to: name(best.o[k]) }));
  return result;
}

const SLOTS = ['top', 'under', 'bottom', 'dress', 'shoes', 'outer'];
// Bolder (direction 1) or easier (-1) than the look she is wearing, changing as little as possible.
export function adjustOutfit(conditions, recipe, direction, options = {}) {
  const now = boldness(outfitOf(recipe)), step = .12;
  return smallestChange(conditions, recipe, options, SLOTS, o => (boldness(o) - now) * direction >= step);
}
// The day's three looks: her pick, a bolder one and an easier one, chosen once and fixed for the day (the user's
// request, 9 October 2026: three fixed choices inspire; endless variations confuse). Each is a different outfit in the
// same weather; the bolder is bolder than her pick and the easier quieter, measured by boldness(). If a whole new
// outfit cannot be found in that direction, the smallest change to her pick is used instead.
export const DARING = { easier: .08, pick: .5, bolder: .95 };
export function composeTrio(conditions, options = {}) {
  const pick = composeOutfit(conditions, { ...options, daring: DARING.pick });
  if (!pick) return null;
  const lead = r => r.recipe.dressId !== 'none' ? r.recipe.dressId : r.recipe.topId;
  const away = (direction, shown) => {
    for (let i = 0; i < 4; i++) {
      const r = composeOutfit(conditions, { ...options, seed: (options.seed ?? 1) + 101 * (i + 1) * direction, daring: direction > 0 ? DARING.bolder : DARING.easier, shownToday: [...(options.shownToday || []), ...shown.map(x => x.recipe)] });
      if (r && (r.boldness - pick.boldness) * direction > .05 && !shown.some(x => lead(x) === lead(r))) return r;
    }
    return adjustOutfit(conditions, pick.recipe, direction, options) || pick;
  };
  const bolder = away(1, [pick]), easier = away(-1, [pick, bolder]);
  return { pick, bolder, easier };
}
