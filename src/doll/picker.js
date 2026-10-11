// Dress her as a visual picker (the user's choice, 11 October 2026). Each slot on the Dress her page (her hair, top,
// what goes under it, bottoms, shoes, outerwear, a dress) is a chip showing what she wears there, as its cloth and its
// name. A tap opens the slot's pieces as cloth swatches, as on the Wardrobe page, and a tap on one puts it on.
//
// Each slot's select stays in the page, hidden: it holds the choice, and the page's own handlers (src/doll/app.js)
// do the dressing, so choosing here is exactly choosing from the select. The selects' options, which the catalog
// fills in, are what the picker shows.
import { swatchBackground } from './swatch.js';
import { HAIR_COLOUR } from '../hair/catalog.js';

// The slots, in the page's order, with the picker's title for each.
const SLOTS = [
  ['hair-select', 'Style her hair'], ['top-select', 'Choose her top'], ['under-select', 'Choose what goes under it'],
  ['bottom-select', 'Choose her bottoms'], ['shoes-select', 'Choose her shoes'], ['outerwear-select', 'Choose her outerwear'],
  ['dress-select', 'Choose a dress'],
];
const LOAFERS = '#64362e';
const SHEEN = 'linear-gradient(155deg, rgb(255 255 255 / .28), rgb(255 255 255 / 0) 42%, rgb(0 0 0 / .14))';

// Each hairstyle as a little drawing of her head: the hair behind her face, her face, then what lies in front.
const SKIN = '#f6d6c2';
const HEAD = '<circle cx="24" cy="24" r="13"/>', FRINGE = '<path d="M12 25C12 13 36 13 36 25C31 20 17 20 12 25Z"/>';
const LONG = '<path d="M11 24L11 40L24 46L37 40L37 24Z"/>';
const HAIR = {
  bob: ['<rect x="10" y="21" width="28" height="15" rx="6"/>', ''],
  'straight-v': [LONG, ''],
  'wavy-v': ['<path d="M11 24C8 30 13 34 10 40L24 46L38 40C35 34 40 30 37 24Z"/>', ''],
  'high-ponytail': ['<path d="M29 12C40 6 46 18 41 32C39 25 36 18 29 15Z"/><circle cx="30" cy="12" r="2.6" fill="#5b3f37"/>', ''],
  'high-bun': ['<circle cx="24" cy="9" r="6.5"/>', ''],
  'low-ponytail': ['<path d="M32 30C41 31 41 40 37 45C36 39 33 35 30 33Z"/>', ''],
  'low-bun': ['<circle cx="35" cy="35" r="5.5"/>', ''],
  'half-up': [`${LONG}<circle cx="24" cy="11" r="3.6"/>`, ''],
  'side-braid': ['', '<g><ellipse cx="33" cy="33" rx="3.6" ry="3"/><ellipse cx="35" cy="38" rx="3.4" ry="2.8"/><ellipse cx="36" cy="42.5" rx="3" ry="2.5"/></g>'],
};
export function hairIcon(id) {
  const [back, front] = HAIR[id] || HAIR.bob;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><g fill="${HAIR_COLOUR}">${back}${HEAD}</g><ellipse cx="24" cy="27" rx="10" ry="10" fill="${SKIN}"/><g fill="${HAIR_COLOUR}">${FRINGE}${front}</g></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}") center / 86% no-repeat, radial-gradient(circle at 35% 30%, #fff8f0, #f3e2d2)`;
}

// A piece's name as the picker shows it: the dropdown's own wording (it names the brand), without the "· study" that
// marks a reference study there.
export const displayName = text => String(text ?? '').replace(/\s*·\s*(reference )?study$/i, '');

// The cloth for one option of a slot: a catalog garment's own swatch; the built-in study pieces in the colours she wears
// them in; nothing (an empty swatch) for "none". Hair is a drawing of the style.
export function clothFor(selectId, value, recipe = {}) {
  if (selectId === 'hair-select') return hairIcon(value);
  if (value === 'none') return null;
  if (value === 'classic') {
    const colour = selectId === 'top-select' ? recipe.sweater : selectId === 'bottom-select' ? recipe.trousers : selectId === 'shoes-select' ? LOAFERS : null;
    return colour ? `${SHEEN}, ${colour}` : null;
  }
  return swatchBackground(value);
}

export function mountPicker(doc, { getRecipe = () => ({}) } = {}) {
  const Event = doc.defaultView?.Event, chips = [];
  // One dialog, filled with the pieces of whichever slot is tapped.
  const dialog = doc.createElement('dialog'), heading = doc.createElement('div'), title = doc.createElement('h2'), close = doc.createElement('button'), grid = doc.createElement('div');
  dialog.id = 'picker'; dialog.className = 'picker'; dialog.setAttribute('aria-labelledby', 'picker-title');
  heading.className = 'dialog-heading'; title.id = 'picker-title';
  close.type = 'button'; close.className = 'picker-close'; close.setAttribute('aria-label', 'Close'); close.textContent = '×';
  grid.className = 'picker-grid';
  heading.append(title, close); dialog.append(heading, grid); doc.body.append(dialog);
  let open = null;
  const shut = () => { if (dialog.close) { if (dialog.open) dialog.close(); } else dialog.removeAttribute('open'); };
  const onClose = () => { const chip = open?.chip; open = null; grid.replaceChildren(); chip?.focus?.(); };
  dialog.addEventListener('close', onClose);
  close.onclick = () => { shut(); if (!dialog.close) onClose(); };
  // A tap on the backdrop, outside the dialog's box, closes it too (a tap on its own padding does not).
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) close.onclick();
  });

  function choose(select, value) {
    if (select.value !== value) { select.value = value; if (Event) select.dispatchEvent(new Event('change', { bubbles: true })); }
    close.onclick();
  }
  function show(select, chip, heading) {
    const recipe = getRecipe(), options = [...select.options];
    // Nothing first, the user's own pieces by name, then the built-in study piece she started with.
    const rank = o => o.value === 'none' ? 0 : o.value === 'classic' ? 2 : 1;
    if (select.id !== 'hair-select') options.sort((a, b) => rank(a) - rank(b) || a.textContent.localeCompare(b.textContent));
    title.textContent = heading;
    grid.replaceChildren(...options.map(o => {
      const b = doc.createElement('button'), cloth = doc.createElement('span'), name = doc.createElement('span'), bg = clothFor(select.id, o.value, recipe);
      b.type = 'button'; b.className = 'piece'; b.dataset.value = o.value; b.setAttribute('aria-pressed', String(o.value === select.value));
      cloth.className = `piece-swatch${bg ? '' : ' empty'}${select.id === 'hair-select' ? ' hair' : ''}`; cloth.setAttribute('aria-hidden', 'true');
      if (bg) cloth.style.background = bg;
      name.className = 'piece-name'; name.textContent = displayName(o.textContent);
      b.append(cloth, name); b.onclick = () => choose(select, o.value);
      return b;
    }));
    open = { select, chip };
    if (dialog.showModal) { if (!dialog.open) dialog.showModal(); } else dialog.setAttribute('open', '');
    (grid.querySelector('[aria-pressed=true]') || grid.firstChild)?.focus?.();
  }

  for (const [id, heading] of SLOTS) {
    const select = doc.getElementById(id), field = select?.closest('.field'), label = field?.querySelector('label');
    if (!select || !field) continue;
    const chip = doc.createElement('button'), cloth = doc.createElement('span'), name = doc.createElement('span'), more = doc.createElement('span');
    chip.type = 'button'; chip.className = 'slot-chip'; chip.id = id.replace('-select', '-chip'); chip.setAttribute('aria-haspopup', 'dialog');
    cloth.className = 'slot-cloth'; cloth.setAttribute('aria-hidden', 'true'); name.className = 'slot-name';
    more.className = 'slot-more'; more.setAttribute('aria-hidden', 'true'); more.textContent = '›';
    chip.append(cloth, name, more);
    chip.onclick = () => show(select, chip, heading);
    // A note on the slot (the hair style's) describes the chip, as it did the select.
    const note = select.getAttribute('aria-describedby'); if (note) chip.setAttribute('aria-describedby', note);
    select.hidden = true; select.after(chip);
    if (label) label.htmlFor = chip.id;
    chips.push({ select, chip, cloth, name, label: label?.textContent || heading });
  }
  // Show what she wears in each slot (the page calls this whenever her outfit changes).
  function sync() {
    const recipe = getRecipe();
    for (const { select, chip, cloth, name, label } of chips) {
      const option = select.selectedOptions?.[0] || select.options[select.selectedIndex], text = displayName(option?.textContent);
      const bg = clothFor(select.id, select.value, recipe);
      name.textContent = text; chip.disabled = select.disabled; chip.setAttribute('aria-label', `${label}: ${text}`);
      cloth.style.background = bg || ''; cloth.classList.toggle('empty', !bg); cloth.classList.toggle('hair', select.id === 'hair-select');
    }
    // The open picker follows a change made elsewhere (a look chosen on another page while it is open).
    if (open) for (const b of grid.children) b.setAttribute('aria-pressed', String(b.dataset.value === open.select.value));
  }
  sync();
  return {
    sync,
    dispose() {
      dialog.removeEventListener('close', onClose); shut(); dialog.remove();
      for (const { select, chip } of chips) { chip.remove(); select.hidden = false; const label = select.closest('.field')?.querySelector('label'); if (label) label.htmlFor = select.id; }
    },
  };
}
