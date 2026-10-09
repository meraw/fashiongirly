// The Wardrobe page: every garment in the catalog, grouped by kind, each a button that puts it on her while the rest
// of her outfit stays. A row of dots shows each piece's colours, read from its styling facts.
import { GARMENTS } from '../wardrobe/catalog.js';
import { stylingFacts } from '../style/facts.js';

const GROUPS = [['top', 'Tops'], ['bottom', 'Bottoms'], ['dress', 'Dresses'], ['outerwear', 'Coats and jackets'], ['shoes', 'Shoes']];
const KEY = { top: 'topId', bottom: 'bottomId', shoes: 'shoesId', outerwear: 'outerwearId', dress: 'dressId' };
const hsl = c => `hsl(${Math.round(c.h)} ${Math.round(c.s * 100)}% ${Math.round(c.l * 100)}%)`;

// What wearing a piece changes in the recipe. A top or bottoms take a dress off; a jacket starts as it is usually worn.
export function wearPatch(g) {
  if (g.slot === 'top') return { dressId: 'none', topId: g.id, knit: false, shirt: false };
  if (g.slot === 'bottom') return { dressId: 'none', bottomId: g.id };
  if (g.slot === 'outerwear') return { outerwearId: g.id, outerwearOpen: !!g.layering?.openByDefault, outerwearInsert: true };
  return { [KEY[g.slot]]: g.id };
}

export function mountWardrobe(doc, { wear }) {
  const root = doc.getElementById('wardrobe-groups'), buttons = [];
  if (!root) return { sync() {}, dispose() {} };
  for (const [slot, title] of GROUPS) {
    const items = Object.values(GARMENTS).filter(g => g.slot === slot).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) continue;
    const section = doc.createElement('section'), h = doc.createElement('h3'), grid = doc.createElement('div');
    section.className = 'wardrobe-group'; h.textContent = `${title} · ${items.length}`; grid.className = 'piece-grid';
    for (const g of items) {
      const b = doc.createElement('button'), dots = doc.createElement('span'), name = doc.createElement('span');
      b.type = 'button'; b.className = 'piece'; b.dataset.id = g.id; b.dataset.slot = slot;
      dots.className = 'dots'; dots.setAttribute('aria-hidden', 'true');
      for (const c of (stylingFacts(g)?.colours || []).slice(0, 5)) { const i = doc.createElement('i'); i.style.background = hsl(c); dots.append(i); }
      name.textContent = g.name; b.append(dots, name);
      b.onclick = () => wear(wearPatch(g), g);
      grid.append(b); buttons.push(b);
    }
    section.append(h, grid); root.append(section);
  }
  return {
    // Mark what she is wearing now.
    sync(recipe) {
      const dress = recipe.dressId !== 'none';
      for (const b of buttons) {
        const on = recipe[KEY[b.dataset.slot]] === b.dataset.id && (b.dataset.slot === 'dress' || !dress || !['top', 'bottom'].includes(b.dataset.slot));
        b.setAttribute('aria-pressed', String(on));
      }
    },
    dispose() { root.replaceChildren(); },
  };
}
