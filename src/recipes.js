export const PALETTE = [
  ['butter yellow', '#e8dc8b'], ['burgundy', '#733b54'], ['lilac', '#c3a8d4'],
  ['cobalt', '#365bbb'], ['red', '#ce463c'], ['pink', '#e6a6af'],
  ['cream', '#f0e5d0'], ['olive', '#77815a'], ['navy', '#303b50'],
  ['black', '#2b282e'], ['white', '#faf6ee'],
];
const garment = (id, family, name, color, extra = {}) => ({ id, family, name, color, length: 0.5, volume: 0.45, sleeves: 0.3, material: 'cotton', pattern: 'solid', open: false, ...extra });
export const LOOKS = [
  { id: 'butter', title: 'Butter, with a bite.', tab: 'The colour clash', mood: 'a little sweet,\na little strange.',
    note: '“The cardigan is sweet. The cobalt tights are absolutely not behaving. That’s the whole point.”',
    move: 'Steal the move: a quiet top, a loud pair of tights.',
    garments: [
      garment('tights', 'tights', 'Cobalt tights', '#365bbb'),
      garment('skirt', 'skirt', 'Plum pleated skirt', '#733b54', { length: 0.61, volume: 0.6, material: 'satin' }),
      garment('tee', 'tee', 'Cream little tee', '#f0e5d0', { length: 0.25 }),
      garment('cardigan', 'cardigan', 'Butter cardigan', '#e8dc8b', { length: 0.32, sleeves: 0.72, volume: 0.65, material: 'knit', open: true }),
      garment('shoes', 'shoes', 'Oxblood Mary Janes', '#593344'),
    ], selected: 'cardigan' },
  { id: 'sport', title: 'Not going to the gym.', tab: 'The unexpected layer', mood: 'romance,\nwith a detour.',
    note: '“A slip dress with a track jacket. She has dinner at eight and absolutely no intention of running.”',
    move: 'Steal the move: something sporty over something delicate.',
    garments: [
      garment('tights', 'tights', 'Soft pink socks', '#e6a6af', { length: 0.1 }),
      garment('dress', 'dress', 'Lilac slip dress', '#c3a8d4', { length: 0.8, volume: 0.3, material: 'satin' }),
      garment('jacket', 'jacket', 'Tomato track jacket', '#ce463c', { length: 0.22, sleeves: 0.6, volume: 0.65, open: true }),
      garment('shoes', 'shoes', 'Cream platform shoes', '#f0e5d0', { volume: 0.8 }),
    ], selected: 'jacket' },
  { id: 'volume', title: 'A matter of proportions.', tab: 'The big silhouette', mood: 'more sleeve.\nless restraint.',
    note: '“The shirt gets to peek out. The trousers get all the room. A red knit keeps the whole thing awake.”',
    move: 'Steal the move: let a striped shirt escape from your knit.',
    garments: [
      garment('trousers', 'trousers', 'Ink barrel trousers', '#303b50', { volume: 0.83, length: 0.83, material: 'denim' }),
      garment('shirt', 'shirt', 'Blue striped shirt', '#a9c4d9', { length: 0.8, volume: 0.58, pattern: 'stripe' }),
      garment('knit', 'knit', 'Tomato cropped knit', '#ce463c', { length: 0.18, sleeves: 0.8, volume: 0.7, material: 'knit' }),
      garment('shoes', 'shoes', 'Black Mary Janes', '#2b282e'),
    ], selected: 'knit' },
];
export const FAMILIES = ['tights', 'skirt', 'tee', 'cardigan', 'dress', 'jacket', 'trousers', 'shirt', 'knit', 'shoes'];
export const isTop = g => ['tee', 'cardigan', 'jacket', 'shirt', 'knit'].includes(g.family);
export const hasSleeves = g => isTop(g) && g.family !== 'tee';
export const clone = value => structuredClone(value);
export function normalizeGarment(g) {
  if (!g || !FAMILIES.includes(g.family) || typeof g.id !== 'string') throw new Error('Invalid garment');
  const normalized = { ...g, name: String(g.name || g.family).slice(0, 80), color: /^#[a-f\d]{6}$/i.test(g.color) ? g.color : '#f0e5d0',
    material: ['knit', 'cotton', 'satin', 'denim'].includes(g.material) ? g.material : 'cotton', pattern: g.pattern === 'stripe' ? 'stripe' : 'solid', open: g.open === true };
  for (const key of ['length', 'volume', 'sleeves']) normalized[key] = Math.max(0, Math.min(1, Number.isFinite(g[key]) ? g[key] : 0.5));
  return normalized;
}
export function normalizeLook(look) {
  if (!look || !Array.isArray(look.garments) || !look.garments.length || look.garments.length > 12) throw new Error('Invalid look');
  const garments = look.garments.map(normalizeGarment);
  if (new Set(garments.map(g => g.id)).size !== garments.length) throw new Error('Duplicate garment');
  return { ...look, title: String(look.title || 'A little experiment').slice(0, 100), garments, selected: garments.some(g => g.id === look.selected) ? look.selected : garments[0].id };
}
// Intentionally bounded, deterministic interpretation. No AI or remote service.
// Only supported garment properties are changed; input is never evaluated or injected.
export function interpretDescription(original, input) {
  const g = normalizeGarment(original), text = input.toLowerCase().replaceAll('-', ' '); const changes = [];
  const change = (key, value, label) => { g[key] = value; changes.push(label); };
  let colour = null, last = -1;
  for (const [name, hex] of [...PALETTE, ['yellow', '#e8dc8b'], ['plum', '#733b54'], ['blue', '#365bbb'], ['tomato', '#ce463c']]) {
    const match = new RegExp(`\\b${name}\\b`, 'g');
    for (const found of text.matchAll(match)) if (found.index > last) { colour = [name, hex]; last = found.index; }
  }
  if (colour) change('color', colour[1], colour[0]);
  if (isTop(g)) {
    if (/\b(cropped|shorter)\b/.test(text)) change('length', .15, 'cropped');
    else if (/\bhip\b/.test(text)) change('length', .9, 'hip length');
    else if (/\bwaist\b/.test(text)) change('length', .4, 'waist length');
    else if (/\blonger\b/.test(text)) change('length', Math.min(1, g.length + .25), 'longer');
  } else if (['skirt', 'dress'].includes(g.family)) {
    if (/\bmini\b/.test(text)) change('length', .08, 'mini');
    else if (/\bmidi\b/.test(text)) change('length', .6, 'midi');
    else if (/\bmaxi\b/.test(text)) change('length', .95, 'maxi');
  } else if (g.family === 'trousers') {
    if (/\bankle\b/.test(text)) change('length', .35, 'ankle length');
    else if (/\bfloor\b/.test(text)) change('length', 1, 'floor length');
  }
  if (hasSleeves(g)) {
    if (/\b(enormous|huge|balloon|puff)\b/.test(text)) change('sleeves', /enormous|huge/.test(text) ? 1 : .8, 'balloon sleeves');
    else if (/\b(slim|narrow) sleeves\b/.test(text)) change('sleeves', .1, 'slim sleeves');
  }
  if (!['tights', 'shoes'].includes(g.family)) {
    if (/\b(oversized|boxy|wide)\b/.test(text)) change('volume', .88, 'generous volume');
    else if (/\bfitted\b/.test(text)) change('volume', .15, 'fitted');
    else if (/\brelaxed\b/.test(text)) change('volume', .55, 'relaxed');
  }
  if (/\b(stripe|stripes|striped)\b/.test(text)) change('pattern', 'stripe', 'stripes');
  else if (/\bsolid\b/.test(text)) change('pattern', 'solid', 'solid colour');
  for (const material of ['knit', 'satin', 'denim', 'cotton']) if (new RegExp(`\\b${material}\\b`).test(text)) change('material', material, material);
  if (['cardigan', 'jacket'].includes(g.family)) {
    if (/\bopen\b/.test(text)) change('open', true, 'worn open');
    else if (/\bclosed\b/.test(text)) change('open', false, 'buttoned up');
  }
  return { garment: g, changes, message: changes.length ? `Applied: ${changes.join(', ')}. Only these details were interpreted.` : 'No supported changes found. Try “burgundy, cropped, balloon sleeves” or use the controls below.' };
}
