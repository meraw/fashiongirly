// The Today panel: each morning (from 5:00) she checks the weather and dresses herself, and the user can refine it.
// The weather comes from the phone's location by default, or a typed town, through Open-Meteo; without a forecast
// the user chooses the weather. Everything she remembers stays in this browser's storage.
import { composeOutfit } from '../style/stylist.js';
import { DEFAULT_DARING, LEARNED_KEY, cleanLearned, learn } from '../style/taste.js';
import { dayKey, describe, cleanConditions, presetConditions, PRESETS } from '../weather/conditions.js';
import { fetchConditions, findPlace } from '../weather/open-meteo.js';
import { cleanRecipe } from '../doll/recipe.js';
import { hairName } from '../hair/catalog.js';

export const TODAY_KEY = 'fashiongirly.today.v1', HISTORY_KEY = 'fashiongirly.days.v1', PLACE_KEY = 'fashiongirly.place.v1', WEATHER_KEY = 'fashiongirly.weather.v1';
const SLOT_NAMES = { dress: 'Dress', top: 'Top', under: 'Under it', bottom: 'Bottoms', shoes: 'Shoes', outerwear: 'Outerwear', hair: 'Hair' };
const LOCKABLE = new Set(['dress', 'top', 'bottom', 'shoes', 'outerwear', 'hair']);
const daringName = d => d < .3 ? 'easy to wear' : d > .7 ? 'daring' : 'playful';
const seedOf = day => [...day].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const sentence = s => s.charAt(0).toUpperCase() + s.slice(1) + '.';
const structuredCloneSafe = v => JSON.parse(JSON.stringify(v));

export function mountToday(doc, { storage = null, getRecipe, wear, fetch: fetchImpl = null, geolocation = null, now = () => Date.now() } = {}) {
  const $ = id => doc.getElementById(id);
  const read = (key, fallback) => { try { const v = JSON.parse(storage?.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { storage?.setItem(key, JSON.stringify(value)); } catch {} };
  let state = read(TODAY_KEY, null), busy = false, undo = [], disposed = false;
  if (!state || typeof state !== 'object' || typeof state.day !== 'string') state = null;

  // The page can go away while the weather is on its way; then there is nothing left to update.
  const gone = () => disposed || !$('today');
  function status(text) { if (!gone()) $('today-status').textContent = text || ''; }
  function setBusy(value) { busy = value; if (gone()) return; for (const id of ['today-another', 'today-bolder', 'today-easier', 'today-undo']) $(id).disabled = busy || !state?.result || (id === 'today-undo' && !undo.length); }
  function place() { const p = read(PLACE_KEY, null); return p?.mode === 'typed' && Number.isFinite(p.lat) && Number.isFinite(p.lon) ? p : { mode: 'device' }; }

  function render() {
    if (gone()) return;
    const day = state?.day ?? dayKey(now());
    $('today-date').textContent = new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const p = place();
    $('today-place').textContent = p.mode === 'typed' ? p.name : 'your location';
    $('today-weather').textContent = state?.conditions ? describe(state.conditions) : '';
    const list = $('today-pieces'); list.replaceChildren();
    const result = state?.result, keep = state?.keep || {};
    if (result) {
      const rows = [...result.pieces, { slot: 'hair', id: result.recipe.hairId, name: hairName(result.recipe.hairId) }];
      if (!result.pieces.some(r => r.slot === 'outerwear')) rows.splice(rows.length - 1, 0, { slot: 'outerwear', id: 'none', name: 'No jacket' });
      for (const row of rows) {
        const li = doc.createElement('li'), label = doc.createElement('span'), name = doc.createElement('span');
        label.className = 'today-slot'; label.textContent = SLOT_NAMES[row.slot]; name.textContent = row.name; li.append(label, name);
        if (LOCKABLE.has(row.slot)) {
          const kept = keep[row.slot] === row.id, lock = doc.createElement('button');
          lock.type = 'button'; lock.className = 'today-keep'; lock.textContent = kept ? 'Kept' : 'Keep';
          lock.setAttribute('aria-pressed', String(kept)); lock.setAttribute('aria-label', `${kept ? 'Stop keeping' : 'Keep'} ${row.name}`);
          lock.onclick = () => { state.keep = { ...state.keep }; if (kept) delete state.keep[row.slot]; else state.keep[row.slot] = row.id; save(); render(); status(kept ? `${row.name} can change again.` : `${row.name} stays when you ask for another idea.`); };
          li.append(lock);
          if (row.id !== 'none' && row.slot !== 'hair') {
            const aside = doc.createElement('button'); aside.type = 'button'; aside.className = 'today-aside'; aside.textContent = '×';
            aside.setAttribute('aria-label', `Not ${row.name} today`);
            aside.onclick = () => setAside(row); li.append(aside);
          }
        }
        list.append(li);
      }
    }
    $('today-reasons').replaceChildren(...(result?.reasons || []).map(r => { const li = doc.createElement('li'); li.textContent = sentence(r); return li; }));
    $('today-daring').textContent = daringName(state?.daring ?? DEFAULT_DARING);
    setBusy(busy);
  }
  function save() { write(TODAY_KEY, state); }
  function remember(recipe) {
    const history = read(HISTORY_KEY, []).filter(h => h?.day && h.day !== state.day).slice(0, 13);
    write(HISTORY_KEY, [{ day: state.day, recipe }, ...history]);
  }

  // Dress her with the current conditions, locks and set-aside pieces.
  function compose({ newIdea = false } = {}) {
    if (!state?.conditions) return false;
    if (newIdea && state.result) { state.shown = [...(state.shown || []), state.result.recipe].slice(-12); state.seed = (state.seed + 1) >>> 0; }
    const history = read(HISTORY_KEY, []).filter(h => h?.day && h.day < state.day).map(h => h.recipe).slice(0, 7);
    const result = composeOutfit(state.conditions, {
      seed: state.seed, daring: state.daring ?? DEFAULT_DARING, keep: state.keep || {}, avoid: state.avoid || [],
      recent: history, shownToday: state.shown || [], learned: read(LEARNED_KEY, null), current: getRecipe(),
    });
    if (!result) { status('Nothing in the wardrobe fits those choices. Try keeping fewer pieces.'); return false; }
    if (state.result) undo = [...undo, structuredCloneSafe(state)].slice(-10);
    state.result = result; save(); remember(result.recipe); wear(result.recipe); render();
    return true;
  }
  function locate() {
    return new Promise((resolve, reject) => {
      if (!geolocation?.getCurrentPosition) { reject(new Error('This browser cannot share its location.')); return; }
      geolocation.getCurrentPosition(
        pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude, name: 'Your location' }),
        err => reject(new Error(err?.code === 1 ? 'Location access is off.' : 'Your location could not be found.')),
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 6 * 3600e3 });
    });
  }
  async function forecast(day) {
    const p = place(), where = p.mode === 'typed' ? p : await locate();
    const key = `${day}|${where.lat.toFixed(2)},${where.lon.toFixed(2)}`, cached = read(WEATHER_KEY, null);
    if (cached?.key === key && cleanConditions(cached.conditions)) return cleanConditions(cached.conditions);
    const conditions = await fetchConditions(where, day, fetchImpl);
    write(WEATHER_KEY, { key, conditions });
    return conditions;
  }

  // A new day: check the weather and choose a new look. Without a forecast, ask for the weather.
  async function dressForToday() {
    const day = dayKey(now());
    state = { day, conditions: null, seed: seedOf(day), daring: state?.daring ?? DEFAULT_DARING, keep: {}, avoid: [], shown: [], result: null };
    undo = []; save(); render(); setBusy(true); status('Checking the weather…');
    try {
      state.conditions = await forecast(day);
      if (gone()) return;
      status('');
      compose();
    } catch (error) {
      if (gone()) return;
      status(`${error.message} Choose today's weather, or type a town.`);
      $('today-manual').open = true;
    } finally { setBusy(false); }
  }
  async function refetch() {
    if (!state || state.day !== dayKey(now())) return dressForToday();
    setBusy(true); status('Checking the weather…');
    try { state.conditions = await forecast(state.day); status(''); compose({ newIdea: !!state.result }); }
    catch (error) { if (!gone()) { status(`${error.message} Choose today's weather, or type a town.`); $('today-manual').open = true; } }
    finally { setBusy(false); }
  }
  function setAside(row) {
    state.avoid = [...new Set([...(state.avoid || []), row.id])];
    if (state.keep?.[row.slot] === row.id) { state.keep = { ...state.keep }; delete state.keep[row.slot]; }
    write(LEARNED_KEY, learn(read(LEARNED_KEY, null), 'set-aside', [row.id]));
    if (compose()) status(`Not the ${row.name} today.`);
  }

  $('today-another').onclick = () => { if (compose({ newIdea: true })) status('Another idea.'); };
  $('today-bolder').onclick = () => { state.daring = Math.min(1, (state.daring ?? DEFAULT_DARING) + .2); if (compose({ newIdea: true })) status(`A bit bolder: ${daringName(state.daring)}.`); };
  $('today-easier').onclick = () => { state.daring = Math.max(0, (state.daring ?? DEFAULT_DARING) - .2); if (compose({ newIdea: true })) status(`A bit easier: ${daringName(state.daring)}.`); };
  $('today-undo').onclick = () => { const prev = undo.pop(); if (!prev) return; state = prev; save(); remember(state.result.recipe); wear(state.result.recipe); render(); status('Back to the look before.'); };
  $('today-presets').replaceChildren(...PRESETS.map(p => {
    const b = doc.createElement('button'); b.type = 'button'; b.textContent = p.label;
    b.onclick = () => {
      if (!state || state.day !== dayKey(now())) state = { day: dayKey(now()), seed: seedOf(dayKey(now())), daring: state?.daring ?? DEFAULT_DARING, keep: {}, avoid: [], shown: [], result: null };
      state.conditions = presetConditions(p.id, state.day); if (compose({ newIdea: !!state.result })) status(`Dressed for ${p.label.toLowerCase()} weather.`);
    };
    return b;
  }));
  $('today-device').onclick = () => { write(PLACE_KEY, { mode: 'device' }); render(); refetch(); };
  $('today-place-form').onsubmit = async e => {
    e.preventDefault(); const name = $('today-place-input').value.trim(); if (!name) return;
    setBusy(true); status(`Looking for ${name}…`);
    try {
      const found = await findPlace(name, fetchImpl);
      if (!found) { status(`I couldn't find “${name}”. Try a nearby town.`); return; }
      write(PLACE_KEY, { mode: 'typed', ...found }); $('today-place-input').value = ''; render(); await refetch();
    } catch (error) { status(`${error.message} Choose today's weather instead.`); $('today-manual').open = true; }
    finally { setBusy(false); }
  };
  // Saving a look teaches her: its pieces and pairings become more likely.
  const onSave = () => { const r = cleanRecipe(getRecipe()); const ids = [r.dressId, ...(r.dressId === 'none' ? [r.topId, r.underTopId, r.bottomId] : []), r.shoesId, r.outerwearId].filter(id => id && id !== 'none' && id !== 'classic'); write(LEARNED_KEY, learn(read(LEARNED_KEY, null), 'saved', ids)); };
  $('save')?.addEventListener('click', onSave);
  // A phone left open overnight: on coming back after 5:00 she dresses for the new day.
  const onVisible = () => { if (doc.visibilityState !== 'hidden' && state?.day !== dayKey(now()) && !busy) dressForToday(); };
  doc.addEventListener('visibilitychange', onVisible);

  render();
  const ready = state?.day === dayKey(now()) ? Promise.resolve() : dressForToday();
  return {
    ready, getState: () => state && structuredCloneSafe(state),
    dispose() { disposed = true; doc.removeEventListener('visibilitychange', onVisible); $('save')?.removeEventListener('click', onSave); },
  };
}
