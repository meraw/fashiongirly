import { LOOKS, PALETTE, clone, normalizeLook, interpretDescription, isTop, hasSleeves } from './recipes.js';
import { renderCharacter } from './illustration.js';
const $ = id => document.getElementById(id);
const STATE_KEY = 'fashiongirly.studio.v1', SAVED_KEY = 'fashiongirly.lookbook.v1';
let look = clone(LOOKS[0]), saved = [], toastTimer;
try { const stored = JSON.parse(localStorage.getItem(STATE_KEY)); if (stored) look = normalizeLook(stored); } catch { /* A damaged or old draft does not prevent opening the studio. */ }
try { const stored = JSON.parse(localStorage.getItem(SAVED_KEY)); if (Array.isArray(stored)) saved = stored.slice(0, 30).map(normalizeLook); } catch { /* Restore a clean lookbook if local data is invalid. */ }
const current = () => look.garments.find(g => g.id === look.selected);
function persist() { try { localStorage.setItem(STATE_KEY, JSON.stringify(look)); } catch { toast('Changes work here, but this browser could not save them.'); } }
function toast(message) { $('toast').textContent = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { $('toast').textContent = ''; }, 4000); }
function labelColour(color) { return PALETTE.find(([, hex]) => hex === color)?.[0] || 'custom colour'; }
function pieceName(g) { return `${labelColour(g.color)} ${g.family === 'tee' ? 'T-shirt' : g.family}`; }
function icon(g) {
  const shapes = {
    cardigan: 'M12 5L20 2L28 5L38 15L31 22L28 18V38H12V18L9 22L2 15Z',
    tee: 'M12 6L19 3L26 6L37 13L31 22L27 18V37H11V18L7 22L1 13Z',
    skirt: 'M12 5H28L37 37Q20 41 3 37Z', dress: 'M14 2H17V9H23V2H26L27 17L36 38H4L13 17Z',
    trousers: 'M8 4H32L35 38H23L20 18L17 38H5Z', tights: 'M11 3H29L30 38H23L20 18L17 38H10Z',
    shoes: 'M5 18H16L19 25L33 26Q39 26 39 32H4Z',
  };
  return `<svg viewBox="0 0 40 42" aria-hidden="true"><path d="${shapes[g.family] || shapes.cardigan}" fill="${g.color}" stroke="#302a32" stroke-opacity=".25" stroke-width="1"/>${['cardigan', 'jacket', 'shirt'].includes(g.family) ? '<path d="M20 7V37" stroke="#302a32" opacity=".3"/>' : ''}</svg>`;
}
function draw() {
  $('character').innerHTML = renderCharacter(look.garments, { title: `${look.title}: ${look.garments.map(pieceName).join(', ')}` });
  persist();
}
function render() {
  const index = LOOKS.findIndex(l => l.id === look.id);
  $('look-number').textContent = index < 0 ? 'YOUR REMIX' : `LOOK 0${index + 1} / 03`;
  $('look-title').textContent = look.title;
  $('look-mood').textContent = look.mood || 'a little sweet,\na little strange.';
  $('styling-note').textContent = look.note || '“A little experiment, all yours.”';
  $('styling-move').textContent = look.move || 'Play with colour, proportion, and unexpected layers.';
  $('saved-count').textContent = saved.length;
  $('outfit-tabs').replaceChildren(...LOOKS.map(base => {
    const b = document.createElement('button'); b.className = 'outfit-tab'; b.textContent = base.tab;
    b.setAttribute('aria-pressed', String(base.id === look.id));
    b.onclick = () => { look = clone(base); $('description').value = ''; $('edit-status').textContent = ''; render(); };
    return b;
  }));
  renderPieces(); renderEditor(); draw();
}
function renderPieces() {
  $('garment-list').replaceChildren(...look.garments.map(g => {
    const b = document.createElement('button'); b.className = 'garment-card'; b.setAttribute('aria-pressed', String(g.id === look.selected));
    b.setAttribute('aria-label', `Edit ${pieceName(g)}`); b.innerHTML = icon(g);
    const caption = document.createElement('span'); caption.textContent = g.family === 'tights' && g.length < .2 ? 'socks' : g.family;
    b.append(caption); b.onclick = () => { look.selected = g.id; $('description').value = ''; $('edit-status').textContent = ''; renderPieces(); renderEditor(); persist(); };
    return b;
  }));
}
function change(key, value) {
  current()[key] = value;
  $('edit-status').textContent = '';
  updateLabels(); renderPieces(); draw();
}
function updateLabels() {
  $('garment-name').textContent = pieceName(current());
  $('colour-name').textContent = labelColour(current().color);
  for (const b of $('palette').children) b.setAttribute('aria-pressed', String(b.dataset.color === current().color));
}
function range(key, title, low, high) {
  const label = document.createElement('label'); label.className = 'range-control';
  const text = document.createElement('span'); text.className = 'range-label';
  const name = document.createElement('span'); name.textContent = title;
  const output = document.createElement('output');
  const input = document.createElement('input'); input.type = 'range'; input.min = 0; input.max = 100; input.step = 1; input.value = current()[key] * 100; input.id = `range-${key}`;
  label.htmlFor = input.id;
  const describe = () => { output.textContent = Number(input.value) < 34 ? low : Number(input.value) > 66 ? high : 'Somewhere in between'; input.setAttribute('aria-valuetext', `${output.textContent}, ${input.value} percent`); };
  describe(); text.append(name, output); input.oninput = () => { describe(); change(key, Number(input.value) / 100); };
  label.append(text, input); return label;
}
function renderEditor() {
  const g = current(), controls = [];
  if (!['tights', 'shoes'].includes(g.family)) {
    controls.push(range('length', 'Hem length', isTop(g) ? 'Cropped' : g.family === 'trousers' ? 'Ankle' : 'Mini', isTop(g) ? 'Hip length' : g.family === 'trousers' ? 'Floor' : 'Maxi'));
    controls.push(range('volume', 'Silhouette', 'Close-fitting', 'Oversized'));
  }
  if (hasSleeves(g)) controls.push(range('sleeves', 'Sleeve volume', 'Slim', 'Delightfully enormous'));
  if (['cardigan', 'jacket'].includes(g.family)) {
    const label = document.createElement('label'); label.className = 'checkbox-control';
    const input = document.createElement('input'); input.type = 'checkbox'; input.checked = g.open; input.onchange = () => change('open', input.checked);
    label.append(input, 'Wear it open'); controls.push(label);
  }
  $('shape-controls').replaceChildren(...controls);
  $('palette').replaceChildren(...PALETTE.map(([name, color]) => {
    const b = document.createElement('button'); b.className = 'swatch'; b.style.backgroundColor = color; b.dataset.color = color; b.setAttribute('aria-label', name); b.title = name;
    b.onclick = () => change('color', color); return b;
  }));
  $('material').value = g.material; $('pattern').value = g.pattern;
  $('description').placeholder = hasSleeves(g) ? 'Make it butter yellow, cropped, with balloon sleeves…' : 'Try burgundy, striped, satin…';
  updateLabels();
}
$('description-form').onsubmit = e => {
  e.preventDefault();
  const { garment, message } = interpretDescription(current(), $('description').value);
  look.garments = look.garments.map(g => g.id === garment.id ? garment : g);
  renderPieces(); renderEditor(); draw(); $('edit-status').textContent = message;
};
$('material').onchange = e => change('material', e.target.value);
$('pattern').onchange = e => change('pattern', e.target.value);
$('reset-piece').onclick = () => {
  const original = LOOKS.find(l => l.id === look.id)?.garments.find(g => g.id === look.selected);
  if (!original) return;
  look.garments = look.garments.map(g => g.id === look.selected ? clone(original) : g);
  $('description').value = ''; $('edit-status').textContent = 'Restored this piece to its starting recipe.';
  renderPieces(); renderEditor(); draw();
};
$('vocabulary-toggle').onclick = () => { const hidden = !$('vocabulary').hidden; $('vocabulary').hidden = hidden; $('vocabulary-toggle').setAttribute('aria-expanded', String(!hidden)); };
function saveArchive(next) {
  try { localStorage.setItem(SAVED_KEY, JSON.stringify(next)); saved = next; $('saved-count').textContent = saved.length; return true; }
  catch { toast('The lookbook could not be saved. Your current look is still here.'); return false; }
}
$('save-look').onclick = () => {
  if (saved.length >= 30) { toast('Your lookbook holds 30 looks. Remove one to make room.'); return; }
  if (saveArchive([{ ...clone(look), savedId: crypto.randomUUID(), savedAt: new Date().toISOString() }, ...saved])) toast('A good look, kept. Find it in Saved looks.');
};
function renderArchive() {
  $('archive-list').replaceChildren();
  if (!saved.length) { const p = document.createElement('p'); p.className = 'empty-state'; p.textContent = 'Your favourite experiments go here. Tap the heart to save a look.'; $('archive-list').append(p); }
  saved.forEach((entry, i) => {
    const card = document.createElement('article'); card.className = 'saved-card';
    card.innerHTML = renderCharacter(entry.garments, { id: `saved-${i}`, title: entry.title });
    const title = document.createElement('h3'); title.textContent = entry.title;
    const actions = document.createElement('div'); actions.className = 'saved-actions';
    const wear = document.createElement('button'); wear.textContent = 'Wear again ↗'; wear.onclick = () => { look = normalizeLook(clone(entry)); $('description').value = ''; $('edit-status').textContent = ''; render(); $('archive').close(); };
    const remove = document.createElement('button'); remove.textContent = 'Remove'; remove.setAttribute('aria-label', `Remove saved look ${entry.title}`); remove.onclick = () => { if (saveArchive(saved.filter((_, j) => j !== i))) renderArchive(); };
    actions.append(wear, remove); card.append(title, actions); $('archive-list').append(card);
  });
}
$('archive-open').onclick = () => { renderArchive(); $('archive').showModal(); };
$('archive-close').onclick = () => $('archive').close();
render();
