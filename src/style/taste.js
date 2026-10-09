// Her taste, written down. This file is where her sense of style lives: each principle below reads the styling facts of
// a candidate outfit (see facts.js) and says how much she likes it, and why. The stylist adds the scores up, keeps the
// outfits that suit the weather and picks among the best, so she does not wear the single top-scoring look every day.
//
// `daring` (0 to 1) shifts her between "easy to wear" and "inspiring": at 0 she avoids clashes and volume on volume;
// at 1 she seeks them out. The weather never relaxes with daring. The user chose "not extreme, not boring" on
// 9 October 2026, hence the default. To change her taste, change the principles or their weights here; the user can
// ask for that in words ("she should love colour clashes more", "never two prints at once").
//
// Her reactions to looks are also remembered in this browser (`learn()`): a saved look makes its pieces and pairings
// more likely, a piece set aside today less likely. None of this is AI; it is a set of written rules.
export const DEFAULT_DARING = .5;

const hueGap = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
const lead = p => p.main.find(c => !c.quiet) || null;
const colourWord = c => c.name.replace(/\b(stitching|topstitching|hardware|lining|print)\b/g, '').trim();
const short = p => p.name.replace(/\s*\(.*\)$/, '');

// Each principle returns [score, reason or null]. `o` holds the outfit's facts: top, under, bottom, dress, shoes, outer.
export const PRINCIPLES = [
  {
    id: 'statement', says: 'One statement piece carries the look; a second print only when she feels daring.',
    score(o, d, pieces) {
      const prints = pieces.filter(p => p.kind === 'print'), geo = pieces.filter(p => p.kind === 'geometric' || p.kind === 'detail');
      if (prints.length === 1 && geo.length) return [1.1 + .5 * d, `the ${short(prints[0])} is the statement, against the ${short(geo[0])}`];
      if (prints.length === 1) return [1.1, `the ${short(prints[0])} is the statement piece`];
      if (prints.length === 2) return [(d - .55) * 2.4, d > .55 ? 'two prints at once, on purpose' : null];
      if (prints.length > 2) return [-2, null];
      return geo.length ? [.3, null] : [-.4 - .6 * d, null];
    },
  },
  {
    id: 'colour', says: 'Colour carried from one piece to another, or opposite colours on purpose; never a muddle.',
    score(o, d, pieces) {
      let score = 0, reason = null;
      const leads = pieces.map(p => [p, lead(p)]).filter(([, c]) => c);
      if (!leads.length) return [-.3 - .5 * d, null];
      // An echo: a colour in one piece picked up by another (the shoes, the bottoms or the jacket).
      echo: for (const a of pieces) for (const b of pieces) {
        if (a === b || a.slot === b.slot || !['shoes', 'bottom', 'outerwear'].includes(b.slot)) continue;
        for (const ca of a.colours) for (const cb of b.main) if (!ca.quiet && !cb.quiet && hueGap(ca.h, cb.h) < 18) {
          score += .8; reason = `the ${colourWord(cb)} of the ${short(b)} picks up the ${colourWord(ca)} in the ${short(a)}`; break echo;
        }
      }
      for (let i = 0; i < leads.length; i++) for (let j = i + 1; j < leads.length; j++) {
        const gap = hueGap(leads[i][1].h, leads[j][1].h);
        if (gap >= 120) { score += .3 + .7 * d; reason ??= `${colourWord(leads[i][1])} against ${colourWord(leads[j][1])}: opposite colours on purpose`; i = leads.length; break; }
      }
      // Too many separate colour families reads as a muddle, less so when she is daring.
      const families = [];
      for (const [, c] of leads) if (!families.some(h => hueGap(h, c.h) < 35)) families.push(c.h);
      if (families.length > 3) score -= (families.length - 3) * (1.2 - d);
      return [score, reason];
    },
  },
  {
    id: 'proportion', says: 'Play with proportion: cropped over high or wide, big over slim, long over short.',
    score(o, d) {
      let score = 0, reason = null;
      const t = o.top?.shape, b = o.bottom?.shape, add = (s, r) => { score += s; if (r && s > 0) reason ??= r; };
      if (t && b) {
        if (t.length === 'cropped' && (b.leg === 'wide' || b.high)) add(.8, `cropped ${short(o.top)} over ${b.leg === 'wide' ? 'wide' : 'high-waisted'} ${short(o.bottom)}`);
        if (t.volume === 'big' && b.leg !== 'wide') add(.8, `volume on top, a slimmer line below`);
        if (t.volume === 'big' && b.leg === 'wide') add((d - .4) * 1.2, 'volume on volume');
        if (t.volume === 'slim' && b.leg === 'wide') add(.5, 'a fitted top over wide legs');
      }
      const outer = o.outer?.shape;
      if (outer?.length === 'long' && (o.dress || b?.length === 'ankle')) add(.4, `the long ${short(o.outer)} over shorter lengths`);
      // A top still showing under a closed jacket (scoreTaste swaps a hidden top for the jacket).
      if (o.top && o.outer && !o.open && o.top.id !== o.outer.id) add(.3, `the ${short(o.top)} shows below the short ${short(o.outer)}`);
      return [score, reason];
    },
  },
  {
    id: 'shoes', says: 'Shoes that finish the shape: boots under cropped legs, chunky soles with a mini.',
    score(o) {
      const s = o.shoes?.shape; if (!s) return [0, null];
      if (o.dress && (s.boot || s.chunky)) return [.6, `the mini dress with chunky ${short(o.shoes)}`];
      if (s.boot && o.bottom?.shape.length === 'ankle') return [.5, `boots under cropped legs`];
      if (s.chunky && o.bottom?.shape.leg === 'wide') return [.3, null];
      return [0, null];
    },
  },
  {
    id: 'mix', says: 'Sporty with soft: a track piece with lace, a hoodie with flowers.',
    score(o, d, pieces) {
      const sporty = pieces.find(p => p.sporty && !p.soft), soft = pieces.find(p => p.soft && !p.sporty);
      return sporty && soft ? [.2 + .6 * d, `sporty ${short(sporty)} with the softer ${short(soft)}`] : [0, null];
    },
  },
  {
    id: 'layers', says: 'Layers that show: a top peeking out from under another.',
    score(o, d) { return o.under ? [.3 + .4 * d, `the ${short(o.under)} peeking out from under the ${short(o.top)}`] : [0, null]; },
  },
];

// Whether the top shows under a closed jacket: below a waist-length jacket unless the top is cropped too, and below one
// that reaches the high hip only if the top is long.
export function topShows(o) {
  if (!o.top || !o.outer || o.open) return true;
  const jacket = o.outer.shape.length, top = o.top.shape.length;
  return (jacket === 'waist' && top !== 'cropped') || (jacket === 'cropped' && top === 'long');
}

export function scoreTaste(outfit, daring) {
  // She judges what shows. When a closed jacket hides the top, the jacket takes the top's place for proportion, and the
  // hidden top and under-top are left out of colour and print.
  const hidden = !!outfit.top && !topShows(outfit);
  const o = hidden ? { ...outfit, top: { ...outfit.outer, slot: 'top', shape: { length: ['waist', 'cropped'].includes(outfit.outer.shape.length) ? 'cropped' : 'regular', volume: outfit.outer.shape.volume } }, under: null } : outfit;
  const pieces = [hidden ? null : o.top, o.under, o.bottom, o.dress, o.shoes, o.outer].filter(Boolean);
  let total = 0; const reasons = [];
  for (const p of PRINCIPLES) { const [s, r] = p.score(o, daring, pieces); total += s; if (r && s > 0) reasons.push([s, r]); }
  return { total, reasons };
}

// What she has learned from the user's reactions in this browser: pieces and pairs they saved, and pieces set aside.
export const LEARNED_KEY = 'fashiongirly.taste.v1';
const clamp = v => Math.max(-3, Math.min(3, v));
export function cleanLearned(value) {
  const v = value && typeof value === 'object' ? value : {}, out = { pieces: {}, pairs: {} };
  for (const key of ['pieces', 'pairs']) for (const [k, n] of Object.entries(v[key] || {})) if (Number.isFinite(n)) out[key][k] = clamp(n);
  return out;
}
const pairKey = (a, b) => a < b ? `${a}|${b}` : `${b}|${a}`;
export function learnedBonus(learned, ids) {
  let bonus = 0;
  for (const id of ids) bonus += .25 * (learned.pieces[id] || 0);
  for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) bonus += .35 * (learned.pairs[pairKey(ids[i], ids[j])] || 0);
  return bonus;
}
// A saved look: its pieces and their pairings go up. A piece set aside: it goes down a little.
export function learn(learned, event, ids) {
  const next = cleanLearned(learned);
  if (event === 'saved') {
    for (const id of ids) next.pieces[id] = clamp((next.pieces[id] || 0) + .5);
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) next.pairs[pairKey(ids[i], ids[j])] = clamp((next.pairs[pairKey(ids[i], ids[j])] || 0) + 1);
  }
  if (event === 'set-aside') for (const id of ids) next.pieces[id] = clamp((next.pieces[id] || 0) - .5);
  return next;
}
