// Styling facts for the stylist, read the same way from every garment.
// Garment entries record their styling in three shapes: flat fields (most tops, bottoms, shoes and dresses), notes split
// into `observed`, `user` and `inferred` (outerwear), and a few prose fields. `stylingFacts()` reads all of them into
// one plain object, so the catalog needs no rewrite. Unknowns stay null: nothing is invented here.
//
// Warmth uses one scale for every slot: 0 open or bare (slides, sandals), 1 light (mesh, tees, linen, thin shells),
// 2 mid (shirts, light knits, sweatshirts, jeans, closed sneakers), 3 warm (heavy knits, fleece, padded or wool
// jackets, boots), 4 very warm (a sherpa-lined knee-length parka).
import { GARMENTS } from '../wardrobe/catalog.js';

// Colour words as hue (degrees), saturation and lightness (0–1). A palette entry takes its last colour word, so
// 'muted blue-green emerald' reads as emerald; 'pale', 'dark' and similar adjust it.
const COLOURS = {
  black: [0, 0, .08], white: [0, 0, .97], cream: [45, .45, .9], ecru: [42, .35, .87], ivory: [48, .4, .93], 'off-white': [40, .2, .93],
  beige: [36, .2, .78], sand: [38, .2, .72], stone: [35, .15, .7], taupe: [30, .14, .55], tan: [32, .45, .58], brown: [25, .45, .3],
  grey: [0, 0, .55], gray: [0, 0, .55], charcoal: [0, 0, .25], silver: [0, 0, .75], gunmetal: [210, .05, .3], bronze: [30, .55, .45],
  gold: [46, .7, .5], yellow: [52, .85, .6], ochre: [40, .7, .45], orange: [25, .85, .55], peach: [22, .75, .78], coral: [10, .75, .62],
  rust: [16, .65, .4], red: [356, .75, .45], raspberry: [338, .65, .48], pink: [345, .6, .78], rose: [350, .45, .7], mauve: [310, .2, .6],
  lilac: [275, .35, .75], lavender: [265, .4, .8], violet: [270, .5, .5], purple: [280, .5, .38], navy: [222, .55, .16], indigo: [228, .45, .3],
  blue: [215, .6, .5], cobalt: [220, .7, .45], sky: [200, .6, .75], turquoise: [178, .6, .5], teal: [182, .55, .35], mint: [150, .45, .82],
  sage: [100, .18, .6], lime: [80, .7, .55], green: [130, .45, .38], emerald: [150, .5, .35], olive: [65, .35, .35], khaki: [55, .25, .5],
  military: [80, .25, .3], gum: [30, .5, .45], denim: [215, .35, .45], crystal: [0, 0, .85],
};
const MODIFIERS = [[/\b(pale|light|soft|powder|baby)\b/, 0, -.1, .15], [/\b(dark|deep|forest)\b/, 0, 0, -.18], [/\b(dusty|muted|washed|faded|vintage)\b/, 0, -.2, 0], [/\b(neon|bright|hot)\b/, 0, .25, .05]];
// Details that colour a piece only a little: stitching, hardware, linings and the like.
const ACCENT_WORDS = /\b(stitching|topstitching|hardware|lining|cords?|piping|print|laces?|outsole|sole|gum|buttons?|logo)\b/;

export function readColour(text) {
  const words = String(text).toLowerCase().replace(/\([^)]*\)/g, ' ').replace(/sky blue/g, 'sky');
  let found = null;
  for (const m of words.matchAll(/[a-z-]+/g)) for (const word of [m[0], ...m[0].split('-')]) if (COLOURS[word]) found = { word, at: m.index };
  if (!found) return null;
  let [h, s, l] = COLOURS[found.word];
  for (const [re, dh, ds, dl] of MODIFIERS) if (re.test(words)) { h += dh; s = Math.max(0, Math.min(1, s + ds)); l = Math.max(0, Math.min(1, l + dl)); }
  return { name: String(text), h: (h + 360) % 360, s, l, accent: ACCENT_WORDS.test(words) };
}
// Quiet colours go with anything: black, white, greys, creams, beiges, navy and other very dark shades.
export const isQuiet = c => c.s < .22 || c.l < .17 || (c.l >= .86 && c.s < .5);

const list = v => Array.isArray(v) ? v : typeof v === 'string' ? v.split(/,| with | and /).map(s => s.trim()).filter(Boolean) : [];
const text = (...parts) => parts.flat().filter(v => v != null).map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(' ').toLowerCase();

// Rain: 'ok' where a note says it copes with showers, 'avoid' where it says it does not or the material marks, else null.
function readRain(st, slot, open) {
  if (st.rain === 'ok' || st.rain === 'avoid') return st.rain;
  if (open) return 'avoid';
  const t = text(st.weather, st.inferred?.weather, st.material, st.observed?.material);
  if (/sheds light rain|suits? (a )?light showers?|(?<!not )suits? rain|copes with a shower|hood suits/.test(t)) return 'ok';
  if (/not for rain|not suit (heavy )?rain|does not suit|not waterproof|marks? in rain|mark in rain|in rain or|rain spots|suede|canvas|\bdry\b/.test(t)) return 'avoid';
  return slot === 'shoes' && /leather|rubber|lug/.test(t) ? 'ok' : null;
}

// Pattern: plain (0), geometric such as stripes or checks (1), or a statement print (2). Embellishment counts as 1.
function readPattern(st) {
  const t = text(st.pattern ?? st.observed?.pattern);
  if (!t) return { kind: 'unknown', boldness: 0 };
  if (/print|flower|floral|portrait|painting|painted|painterly|tie-dye|paisley|ikat|cartoon|landscape|patchwork|fresco|spray|camo|cow|halftone|crochet/.test(t) && !/^plain/.test(t)) return { kind: 'print', boldness: 2 };
  if (/stripe|check|plaid|gingham|windowpane|colour-block|colour block|tipping|piping/.test(t)) return { kind: 'geometric', boldness: 1 };
  if (/crystal|sequin|embroider|lettering|crest|logo|heart|slogan/.test(t) && !/small (chest )?logo|tonal/.test(t)) return { kind: 'detail', boldness: 1 };
  return { kind: 'plain', boldness: 0 };
}

function readShape(g, st) {
  const sil = text(st.silhouette, st.observed?.silhouette, g.fit?.silhouette, g.fit?.length, g.fit?.rise, g.family);
  const cov = text(st.coverage, st.observed?.coverage);
  if (g.slot === 'top') return {
    length: /cropped|waist length|at the waist/.test(sil) ? 'cropped' : /thigh|tucked/.test(sil) ? 'long' : 'regular',
    volume: /oversized|boxy|batwing/.test(sil) ? 'big' : /slim|fitted/.test(sil) ? 'slim' : 'regular',
  };
  if (g.slot === 'bottom') return {
    leg: /wide|barrel|baggy|flare|culotte|pooling/.test(sil) ? 'wide' : /slim|skinny|taper|mom|jogger/.test(sil) ? 'slim' : 'straight',
    length: /crop|ankle|culotte/.test(sil) ? 'ankle' : 'full', high: /high|ultra/.test(sil),
  };
  if (g.slot === 'shoes') return { chunky: /chunky|platform|lug|stacked/.test(sil), boot: /boot/.test(sil), high: /high-top|boot/.test(sil) };
  if (g.slot === 'outerwear') return {
    length: /knee/.test(sil) ? 'long' : /cropped|waist-length/.test(sil) ? 'cropped' : 'hip', hood: /hood/.test(sil + cov),
    volume: /oversized|boxy/.test(sil) ? 'big' : /fitted|slim/.test(sil) ? 'slim' : 'regular',
  };
  if (g.slot === 'dress') return { length: 'mini' };
  return {};
}

const cache = new Map();
export function stylingFacts(garment) {
  const g = typeof garment === 'string' ? GARMENTS[garment] : garment;
  if (!g) return null;
  if (cache.has(g)) return cache.get(g);
  const st = g.styling || {};
  const warmth = Number.isFinite(st.warmth) ? st.warmth : null;
  const cov = text(st.coverage, st.observed?.coverage);
  const open = g.slot === 'shoes' && (warmth === 0 || /open toe|bare feet|sandal|slide/.test(cov + text(g.family)));
  const palette = list(st.palette ?? st.observed?.palette);
  // Denim blues act as quiet colours: jeans go with anything.
  const denim = /denim/.test(text(st.material, g.material?.construction));
  const colours = palette.map(readColour).filter(Boolean).map(c => ({ ...c, quiet: isQuiet(c) || (denim && c.h >= 190 && c.h <= 240) }));
  const main = colours.filter(c => !c.accent);
  const words = text(g.name, g.family, st.mood, st.inferred?.mood, st.material, st.observed?.material, st.pattern);
  const facts = {
    id: g.id, slot: g.slot, name: g.name, warmth,
    warmthBasis: st.warmthBasis ?? (warmth == null ? null : 'recorded'),
    rain: readRain(st, g.slot, open), open, palette, colours, main: main.length ? main : colours,
    ...readPattern(st), shape: readShape(g, st),
    // A neck that wants to be seen (a collar, mock or stand neck, a hood) suits hair worn up.
    highNeck: /high|mock|stand|polo|rugby|hood|point collar|big collar/.test(text(st.coverage?.neck, st.observed?.coverage)),
    bareLegs: !!g.layering?.bareLegs, cropped: /cropped/.test(text(st.coverage?.midriff)),
    sporty: /track|hood|windbreaker|anorak|sneaker|racing|jogger|rugby|polo|sweatshirt|varsity|cargo|trainer|superstar|gazelle|campus|550/.test(words),
    soft: /lace|floral|flower|crochet|pointelle|fur|ditsy|rose|pink|lilac|ruffle|frill|cherub|heart|cardigan/.test(words),
    mood: text(st.mood, st.inferred?.mood),
    layering: g.layering || {},
  };
  cache.set(g, facts);
  return facts;
}

// Every garment the stylist may choose, by slot. The built-in study pieces (the classic knit, shirt, jeans, loafers and
// skirt) are not the user's clothes, so they are not offered.
export function wardrobe(garments = GARMENTS) {
  const slots = { top: [], bottom: [], shoes: [], outerwear: [], dress: [] };
  for (const g of Object.values(garments)) if (slots[g.slot]) slots[g.slot].push(stylingFacts(g));
  return slots;
}
