// The Wardrobe page: every garment in the catalog, grouped by kind, each a button that puts it on her while the rest
// of her outfit stays. A fabric swatch shows each piece's colours and pattern, from its styling facts.
//
// Filters (the user's choice, 11 October 2026): what suits today's weather (the pieces she would consider today, from
// src/style/stylist.js), how warm a piece is (light, mid or warm, on the catalog's one warmth scale) and its colour (the
// families of its two main colours). They combine: a piece shows when it passes every filter that is on. A kind with
// nothing to show is put away, and what she is wearing stays marked.
import { GARMENTS } from '../wardrobe/catalog.js';
import { stylingFacts } from '../style/facts.js';
import { suitedToday } from '../style/stylist.js';
import { swatch } from './swatch.js';

const GROUPS = [['top', 'Tops'], ['bottom', 'Bottoms'], ['dress', 'Dresses'], ['outerwear', 'Coats and jackets'], ['shoes', 'Shoes']];
const KEY = { top: 'topId', bottom: 'bottomId', shoes: 'shoesId', outerwear: 'outerwearId', dress: 'dressId' };

// Warmth on the catalog's scale (src/style/facts.js): 1 light, 2 mid, 3 and 4 warm. A piece of unknown warmth is in none.
export const WARMTH = [['light', 'Light'], ['mid', 'Mid'], ['warm', 'Warm']];
export const warmthBand = w => !Number.isFinite(w) ? null : w < 1.5 ? 'light' : w < 2.5 ? 'mid' : 'warm';

// Colour families, as clothes are sorted by colour: navy is blue, cream goes with white, rust and ochre with orange.
export const COLOURS = [
  ['black', 'Black', '#211b24'], ['white', 'White and cream', '#f6eddf'], ['grey', 'Grey', '#a19ca3'],
  ['brown', 'Beige and brown', '#a67c5b'], ['red', 'Red and pink', '#e0607e'], ['orange', 'Orange and yellow', '#efa63f'],
  ['green', 'Green', '#5f9a5c'], ['blue', 'Blue', '#4a78c2'], ['purple', 'Purple', '#9a79c9'],
];
// The family of one colour, from its hue, saturation and lightness as the styling facts read them.
export function colourFamily({ h, s, l }) {
  if (l < .1 || (l < .2 && s < .3)) return 'black';
  if (s < .12) return l >= .8 ? 'white' : 'grey';
  if (l >= .85 && s < .5 && (h < 65 || h >= 330)) return 'white';
  if (h >= 15 && h < 60 && s <= .55) return 'brown';
  if (h >= 15 && h < 65) return 'orange';
  if (h >= 330 || h < 15) return 'red';
  return h < 170 ? 'green' : h < 250 ? 'blue' : 'purple';
}
// A piece's colour families: those of its two main colours, its ground and its strongest other colour.
export function coloursOf(id) {
  return new Set((stylingFacts(id)?.main || []).slice(0, 2).map(colourFamily));
}

// What wearing a piece changes in the recipe. A top or bottoms take a dress off; a jacket starts as it is usually worn.
export function wearPatch(g) {
  if (g.slot === 'top') return { dressId: 'none', topId: g.id, knit: false, shirt: false };
  if (g.slot === 'bottom') return { dressId: 'none', bottomId: g.id };
  if (g.slot === 'outerwear') return { outerwearId: g.id, outerwearOpen: !!g.layering?.openByDefault, outerwearInsert: true };
  return { [KEY[g.slot]]: g.id };
}

export function mountWardrobe(doc, { wear, getConditions = () => null, inventory, onChange = () => {} }) {
  const root = doc.getElementById('wardrobe-groups'), buttons = [], groups = [];
  if (!root) return { sync() {}, dispose() {} };
  const filters = { today: false, warmth: null, colour: null };
  const make = (tag, className, text) => { const e = doc.createElement(tag); if (className) e.className = className; if (text != null) e.textContent = text; return e; };
  const toggle = (text, onClick) => { const b = make('button', 'filter-chip', text); b.type = 'button'; b.setAttribute('aria-pressed', 'false'); b.onclick = onClick; return b; };
  const row = (label, ...items) => {
    const name = make('span', 'filter-label', label), chips = make('div', 'filter-chips');
    chips.setAttribute('role', 'group'); chips.setAttribute('aria-label', label); chips.append(...items);
    return [name, chips];
  };

  // The filters, above the groups.
  const bar = make('div', 'wardrobe-filters');
  const todayChip = toggle('Suits today', () => { filters.today = !filters.today; apply(); });
  const warmthChips = WARMTH.map(([key, text]) => { const b = toggle(text, () => { filters.warmth = filters.warmth === key ? null : key; apply(); }); b.dataset.warmth = key; return b; });
  const colourChips = COLOURS.map(([key, name, dot]) => {
    const b = toggle(null, () => { filters.colour = filters.colour === key ? null : key; apply(); });
    b.className = 'filter-colour'; b.dataset.colour = key; b.setAttribute('aria-label', name); b.title = name; b.style.setProperty('--dot', dot);
    return b;
  });
  const [weatherLabel, weatherRow] = row('Weather', todayChip);
  bar.append(weatherLabel, weatherRow, ...row('Warmth', ...warmthChips), ...row('Colour', ...colourChips));
  const status = make('p', 'filter-status'), count = make('span'), clear = make('button', 'filter-clear', 'Clear the filters');
  status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite'); clear.type = 'button';
  clear.onclick = () => { filters.today = false; filters.warmth = null; filters.colour = null; apply(); };
  status.append(count, clear);
  root.before(bar, status);

  const manage = make('button', 'wardrobe-manage', 'Manage pieces');
  manage.type = 'button'; manage.setAttribute('aria-pressed', 'false');
  let managing = false;
  manage.onclick = () => { managing = !managing; manage.setAttribute('aria-pressed', String(managing)); manage.textContent = managing ? 'Done' : 'Manage pieces'; apply(); };
  const removed = make('details', 'removed-pieces'), summary = make('summary'), removedList = make('div');
  removed.append(summary, removedList);
  const feedback = make('p', 'wardrobe-feedback'); feedback.setAttribute('role', 'status');
  const dialog = make('dialog', 'remove-piece-dialog'), heading = make('h2', null, 'Remove this piece?'), explanation = make('p');
  dialog.id = 'remove-piece-dialog'; heading.id = 'remove-piece-title'; dialog.setAttribute('aria-labelledby', heading.id);
  const confirm = make('button', null, 'Remove piece'), cancel = make('button', null, 'Keep it');
  confirm.type = cancel.type = 'button';
  let pending = null;
  const close = () => { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); };
  cancel.onclick = close;
  confirm.onclick = () => {
    if (!pending) return;
    const g = pending; pending = null;
    const saved = inventory.remove(g.id);
    close(); onChange(); apply(); manage.focus();
    feedback.textContent = `${g.name} removed.${saved ? '' : ' Only for this visit: your wardrobe could not be saved.'} Restore it under Removed pieces.`;
  };
  dialog.append(heading, explanation, confirm, cancel); doc.body.append(dialog);
  root.before(manage, feedback); root.after(removed);

  for (const [slot, title] of GROUPS) {
    const items = Object.values(GARMENTS).filter(g => g.slot === slot).sort((a, b) => a.name.localeCompare(b.name));
    if (!items.length) continue;
    const section = make('section', 'wardrobe-group'), h = make('h3'), grid = make('div', 'piece-grid'), mine = [];
    for (const g of items) {
      const b = make('button', 'piece'), name = make('span', 'piece-name', g.name);
      b.type = 'button'; b.dataset.id = g.id; b.dataset.slot = slot;
      b.append(swatch(doc, g.id, 'piece-swatch'), name);
      b.onclick = () => wear(wearPatch(g), g);
      const card = make('div', 'wardrobe-piece'), remove = make('button', 'piece-remove', 'Remove');
      remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${g.name}`);
      remove.onclick = () => {
        pending = g; explanation.textContent = `${g.name} will leave your wardrobe and her outfit suggestions. If she is wearing it, it will be taken off or replaced. You can restore it later. Changes stay on this device.`;
        if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', '');
        cancel.focus();
      };
      card.append(b, remove); grid.append(card); buttons.push(b); mine.push(b);
    }
    section.append(h, grid); root.append(section); groups.push({ section, h, title, buttons: mine });
  }

  // What suits the day is worked out once for each day's weather.
  let suitedKey = null, suited = null;
  const suitedFor = conditions => { const avoid = inventory?.removed() ?? [], key = JSON.stringify([conditions, avoid]); if (key !== suitedKey) { suitedKey = key; suited = suitedToday(conditions, { avoid }); } return suited; };
  function apply() {
    const conditions = getConditions(), known = !!conditions && Number.isFinite(conditions.feels);
    if (!known) filters.today = false;
    weatherLabel.hidden = weatherRow.hidden = !known;
    todayChip.textContent = known ? `Suits today · ${Math.round(conditions.feels)}°` : 'Suits today';
    todayChip.setAttribute('aria-pressed', String(filters.today));
    for (const b of warmthChips) b.setAttribute('aria-pressed', String(b.dataset.warmth === filters.warmth));
    for (const b of colourChips) b.setAttribute('aria-pressed', String(b.dataset.colour === filters.colour));
    const fits = filters.today ? suitedFor(conditions) : null;
    let shown = 0;
    for (const g of groups) {
      let n = 0;
      for (const b of g.buttons) {
        const id = b.dataset.id;
        const ok = (inventory?.has(id) ?? true) && (!fits || fits.has(id)) && (!filters.warmth || warmthBand(stylingFacts(id)?.warmth) === filters.warmth) && (!filters.colour || coloursOf(id).has(filters.colour));
        b.hidden = b.parentElement.hidden = !ok;
        b.parentElement.querySelector('.piece-remove').hidden = !managing || !inventory;
        if (ok) n++;
      }
      g.section.hidden = !n; g.h.textContent = `${g.title} · ${n}`; shown += n;
    }
    const on = filters.today || !!filters.warmth || !!filters.colour;
    status.hidden = !on;
    // Said only when it changes, so a screen reader hears it once.
    const said = !on ? '' : shown ? `${shown} ${shown === 1 ? 'piece matches' : 'pieces match'}.` : 'Nothing in her wardrobe matches all of these.';
    if (count.textContent !== said) count.textContent = said;
    manage.hidden = !inventory;
    const ids = inventory?.removed() ?? [];
    removed.hidden = !ids.length; summary.textContent = `Removed pieces · ${ids.length}`;
    // Preserve the focused restore button when ordinary outfit/filter updates run.
    const key = JSON.stringify(ids);
    if (removedList.dataset.ids !== key) {
      removedList.dataset.ids = key;
      removedList.replaceChildren(...ids.map(id => {
        const g = GARMENTS[id], row = make('div', 'removed-piece'), name = make('span', null, g.name), restore = make('button', null, 'Restore');
        restore.type = 'button'; restore.dataset.restore = id; restore.setAttribute('aria-label', `Restore ${g.name}`);
        restore.onclick = () => { const saved = inventory.restore(id); onChange(); apply(); manage.focus(); feedback.textContent = `${g.name} restored.${saved ? '' : ' Only for this visit: your wardrobe could not be saved.'}`; };
        row.append(name, restore); return row;
      }));
    }
  }
  apply();
  return {
    // Mark what she is wearing now, and show the day's weather in the filter as it comes.
    sync(recipe) {
      const dress = recipe.dressId !== 'none';
      for (const b of buttons) {
        const on = recipe[KEY[b.dataset.slot]] === b.dataset.id && (b.dataset.slot === 'dress' || !dress || !['top', 'bottom'].includes(b.dataset.slot));
        b.setAttribute('aria-pressed', String(on));
      }
      apply();
    },
    dispose() { root.replaceChildren(); bar.remove(); status.remove(); manage.remove(); feedback.remove(); removed.remove(); dialog.remove(); },
  };
}
