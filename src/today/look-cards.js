// A portrait is a memory of a daily look already tried, never a preview of an unopened alternative.
import { cleanRecipe } from '../doll/recipe.js';
export const PREVIEWS_KEY = 'fashiongirly.look-previews.v1';
const LOOKS = [['pick', 'Her pick', 'just right'], ['bolder', 'Bolder', 'turn it up'], ['easier', 'Easier', 'easy to wear']];
const signature = recipe => JSON.stringify(cleanRecipe(recipe));
export const validImage = value => typeof value === 'string' && value.length < 260000 && /^data:image\/(webp|png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(value);

export function mountLookCards(doc, { storage = null, renderPortrait = null } = {}) {
  let cache = { day: null, looks: {} }, closed = false, current = null;
  const pending = new Set(), failed = new Set();
  try {
    const saved = JSON.parse(storage?.getItem(PREVIEWS_KEY) || 'null');
    if (typeof saved?.day === 'string' && saved.looks && typeof saved.looks === 'object') {
      cache.day = saved.day;
      for (const [key] of LOOKS) {
        const entry = saved.looks[key];
        if (typeof entry?.signature === 'string' && entry.signature.length < 5000) cache.looks[key] = { signature: entry.signature, image: validImage(entry.image) ? entry.image : null };
      }
    }
  } catch {}
  const save = () => { try { storage?.setItem(PREVIEWS_KEY, JSON.stringify(cache)); } catch {} };
  const ticket = (key, sig) => JSON.stringify([cache.day, key, sig]);
  const make = (tag, className, text) => { const e = doc.createElement(tag); e.className = className; if (text) e.textContent = text; return e; };
  function draw(key, label, note) {
    const button = doc.getElementById(`look-${key}`), look = current?.trio?.[key], entry = cache.looks[key];
    const revealed = !!look && entry?.signature === signature(look.recipe);
    const image = revealed && entry.image, unavailable = revealed && failed.has(ticket(key, entry.signature));
    const picture = make('span', 'look-portrait'); picture.setAttribute('aria-hidden', 'true');
    const state = !look ? 'waiting' : !revealed ? 'concealed' : image ? 'ready' : unavailable ? 'unavailable' : 'loading';
    picture.dataset.state = state;
    if (image) { const img = make('img', 'look-photo'); img.src = image; img.alt = ''; img.width = 240; img.height = 280; picture.append(img); }
    else {
      picture.append(make('span', 'look-seal', state === 'concealed' ? '✦' : '✿'));
      picture.append(make('span', 'look-invitation', state === 'concealed' ? 'Tap to reveal' : state === 'waiting' ? 'Today’s look' : unavailable ? 'Preview unavailable' : 'Preparing portrait…'));
    }
    button.replaceChildren(picture, make('span', 'look-name', label), make('span', 'look-note', note));
    button.dataset.revealed = String(revealed);
    button.setAttribute('aria-label', `${label}. ${state === 'concealed' ? 'Surprise look. Tap to reveal.' : image ? 'Outfit preview revealed.' : 'Outfit preview.'}`);
    button.setAttribute('aria-pressed', String(current?.choice === key));
  }
  function request(key, entry) {
    if (!renderPortrait || entry.image) return;
    const id = ticket(key, entry.signature); if (pending.has(id) || failed.has(id)) return;
    const day = cache.day, sig = entry.signature, recipe = cleanRecipe(current.trio[key].recipe);
    pending.add(id);
    Promise.resolve().then(() => closed ? null : renderPortrait(recipe, key)).then(image => {
      if (closed || cache.day !== day || cache.looks[key]?.signature !== sig || !current?.trio?.[key] || signature(current.trio[key].recipe) !== sig) return;
      if (validImage(image)) { cache.looks[key].image = image; save(); }
      else if (image != null) failed.add(id);
      const [, label, note] = LOOKS.find(([k]) => k === key); draw(key, label, note);
    }).catch(() => {
      if (!closed && cache.day === day && cache.looks[key]?.signature === sig) {
        failed.add(id); const [, label, note] = LOOKS.find(([k]) => k === key); draw(key, label, note);
      }
    }).finally(() => pending.delete(id));
  }
  return {
    sync(state) {
      if (closed) return;
      current = state;
      if (cache.day !== state.day) { cache = { day: state.day, looks: {} }; failed.clear(); }
      for (const [key, label, note] of LOOKS) {
        const look = state.trio?.[key];
        if (look) {
          const sig = signature(look.recipe);
          if (cache.looks[key]?.signature !== sig) delete cache.looks[key];
          if (key === 'pick' || state.choice === key) cache.looks[key] ??= { signature: sig, image: null };
        }
        draw(key, label, note);
        if (look && cache.looks[key]) request(key, cache.looks[key]);
      }
      save();
    },
    dispose() { closed = true; },
  };
}
