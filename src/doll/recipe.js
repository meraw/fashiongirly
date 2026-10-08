export const DEFAULT = Object.freeze({ sweater: '#bf303e', trousers: '#283c59', sleeve: .74, hem: .3, barrel: .78, knit: true, shirt: true });
export const SWATCHES = [['Tomato', '#bf303e'], ['Butter', '#ead391'], ['Lilac', '#bd9bc8'], ['Cobalt', '#315cb3'], ['Moss', '#74804b'], ['Cream', '#f0e3cb']];
export function cleanRecipe(value = {}) {
  const v = value && typeof value === 'object' ? value : {};
  const result = { ...DEFAULT };
  for (const key of ['sweater', 'trousers']) if (/^#[0-9a-f]{6}$/i.test(v[key] || '')) result[key] = v[key];
  for (const key of ['sleeve', 'hem', 'barrel']) if (Number.isFinite(v[key])) result[key] = Math.max(0, Math.min(1, v[key]));
  for (const key of ['knit', 'shirt']) if (typeof v[key] === 'boolean') result[key] = v[key];
  return result;
}
export function editRecipe(current, sentence) {
  const next = cleanRecipe(current), changes = [], text = sentence.toLowerCase();
  for (const [name, colour] of SWATCHES) if (new RegExp(`\\b${name.toLowerCase()}\\b`).test(text)) { next.sweater = colour; changes.push(`${name.toLowerCase()} sweater`); }
  if (/\b(enormous|huge|balloon)\b/.test(text)) { next.sleeve = 1; changes.push('bigger sleeves'); }
  else if (/\b(slim|narrow) sleeves\b/.test(text)) { next.sleeve = .1; changes.push('slimmer sleeves'); }
  if (/\b(cropped|shorter)\b/.test(text)) { next.hem = .1; changes.push('cropped hem'); }
  else if (/\b(longer|hip length)\b/.test(text)) { next.hem = .9; changes.push('longer hem'); }
  if (/\b(wider|barrel|bigger) (jeans|trousers)\b/.test(text)) { next.barrel = 1; changes.push('fuller jeans'); }
  else if (/\b(straight|slimmer) (jeans|trousers)\b/.test(text)) { next.barrel = .05; changes.push('straighter jeans'); }
  return { recipe: next, changes };
}
