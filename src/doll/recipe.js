import { BRONZE_TOP_ID, LILAC_TOP_ID, CROCHET_TOP_ID, GARMENTS } from '../wardrobe/catalog.js';
export const DEFAULT = Object.freeze({ sweater: '#bf303e', trousers: '#283c59', sleeve: .74, hem: .3, barrel: .78, knit: true, shirt: true, skirt: false, skirtColour: '#bd9bc8', topId: 'classic' });
export const SWATCHES = [['Tomato', '#bf303e'], ['Butter', '#ead391'], ['Lilac', '#bd9bc8'], ['Cobalt', '#315cb3'], ['Moss', '#74804b'], ['Cream', '#f0e3cb']];
export function cleanRecipe(value = {}) {
  const v = value && typeof value === 'object' ? value : {};
  const result = { ...DEFAULT };
  for (const key of ['sweater', 'trousers', 'skirtColour']) if (/^#[0-9a-f]{6}$/i.test(v[key] || '')) result[key] = v[key];
  for (const key of ['sleeve', 'hem', 'barrel']) if (Number.isFinite(v[key])) result[key] = Math.max(0, Math.min(1, v[key]));
  for (const key of ['knit', 'shirt', 'skirt']) if (typeof v[key] === 'boolean') result[key] = v[key];
  if (Object.hasOwn(GARMENTS,v.topId)) result.topId=v.topId;
  if(result.topId!== 'classic'){result.knit=false;result.shirt=false;}
  return result;
}
export function editRecipe(current, sentence) {
  const next = cleanRecipe(current), changes = [], text = sentence.toLowerCase();
  if(next.topId==='classic'){
  for (const [name, colour] of SWATCHES) if (new RegExp(`\\b${name.toLowerCase()}\\b`).test(text)) { next.sweater = colour; changes.push(`${name.toLowerCase()} sweater`); }
  if (/\b(enormous|huge|balloon)\b/.test(text)) { next.sleeve = 1; changes.push('bigger sleeves'); }
  else if (/\b(slim|narrow) sleeves\b/.test(text)) { next.sleeve = .1; changes.push('slimmer sleeves'); }
  if (/\b(cropped|shorter)\b/.test(text)) { next.hem = .1; changes.push('cropped hem'); }
  else if (/\b(longer|hip length)\b/.test(text)) { next.hem = .9; changes.push('longer hem'); }
  }
  if (/\b(wider|barrel|bigger) (jeans|trousers)\b/.test(text)) { next.barrel = 1; changes.push('fuller jeans'); }
  else if (/\b(straight|slimmer) (jeans|trousers)\b/.test(text)) { next.barrel = .05; changes.push('straighter jeans'); }
  if (/\b(no skirt|remove (the )?skirt)\b/.test(text)) { next.skirt=false; changes.push('skirt removed'); }
  else if (/\b(add (a |the )?skirt|skirt over jeans)\b/.test(text)) { next.skirt=true; changes.push('skirt over jeans'); }
  return { recipe: next, changes };
}

export const OUTFITS = [
  { name: 'Crochet flower study', note: 'Reference study: joined crochet flowers, open lace, a filet neckband and scalloped edges. The motif repeat is drawn from the photos, not copied.', recipe: { ...DEFAULT, topId: CROCHET_TOP_ID, knit: false, shirt: false, trousers: '#d9cbb2', barrel: .3 } },
  { name: 'Lilac portrait study', note: 'Portrait and floral front, silvery back, navy patterned sleeves and a raised collar. Artwork is an interpretation of the references.', recipe: { ...DEFAULT, topId: LILAC_TOP_ID, knit: false, shirt: false, trousers: '#39363b', barrel: .12 } },
  { name: 'Bronze mesh study', note: 'Reference study: fitted mesh, bronze stripes and Buddha print. Sleeve artwork is approximate.', recipe: { ...DEFAULT, topId: BRONZE_TOP_ID, knit: false, shirt: false, trousers: '#39363b', barrel: .2 } },
  { name: 'Tomato mischief', note: 'A cropped red knit, lilac pleats over indigo jeans. The unexpected layer does the talking.', recipe: { ...DEFAULT, hem: .12, sleeve: .9, skirt: true } },
  { name: 'Butter club', note: 'Butter yellow, washed denim and a peeking striped shirt. Big sleeves, a neat little crop.', recipe: { ...DEFAULT, sweater: '#ead391', trousers: '#71899b', sleeve: 1, hem: .08, barrel: .5 } },
  { name: 'Garden party crasher', note: 'Cobalt knit, moss skirt and ecru jeans. Two strong colours, grounded by a pale trouser.', recipe: { ...DEFAULT, sweater: '#315cb3', trousers: '#d9cbb2', skirtColour: '#74804b', skirt: true, shirt: false, hem: .18, barrel: .25 } },
];
