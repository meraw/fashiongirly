// Today: each morning (from 5:00) she checks the weather and chooses three looks for the day: her pick, a bolder one
// and an easier one. They stay the same all day (the user's request, 9 October 2026: three fixed choices inspire,
// endless variations confuse). "Another idea" shows one more outfit, and Undo goes back.
// The weather comes from the phone's location by default, or a typed town, through Open-Meteo; without a forecast
// the user chooses the weather. Everything she remembers stays in this browser's storage.
import { composeTrio, composeOutfit } from '../style/stylist.js';
import { LEARNED_KEY, learn } from '../style/taste.js';
import { swatch, outfitSwatch } from '../doll/swatch.js';
import { dayKey, describe, cleanConditions, presetConditions, PRESETS } from '../weather/conditions.js';
import { fetchConditions, findPlace } from '../weather/open-meteo.js';
import { cleanRecipe } from '../doll/recipe.js';
import { hairName, HAIR_COLOUR } from '../hair/catalog.js';
import { paintSky, skyKind, codeKind, weatherIcon } from './sky.js';

export const TODAY_KEY = 'fashiongirly.today.v2', HISTORY_KEY = 'fashiongirly.days.v1', PLACE_KEY = 'fashiongirly.place.v1', WEATHER_KEY = 'fashiongirly.weather.v1';
export const LOOKS = [['pick', 'Her pick'], ['bolder', 'Bolder'], ['easier', 'Easier']];
const NOTES = { pick: 'just right', bolder: 'turn it up', easier: 'easy to wear' };
const TITLES = { pick: 'Her pick for today.', bolder: 'Her bolder look.', easier: 'Her easier look.', idea: 'Another idea.' };
const SLOT_NAMES = { dress: 'Dress', top: 'Top', under: 'Under it', bottom: 'Bottoms', shoes: 'Shoes', outerwear: 'Outerwear', hair: 'Hair' };
const seedOf = day => [...day].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const sentence = s => s.charAt(0).toUpperCase() + s.slice(1) + '.';
const copy = v => JSON.parse(JSON.stringify(v));
export function mountToday(doc, { storage = null, getRecipe, wear, fetch: fetchImpl = null, geolocation = null, now = () => Date.now() } = {}) {
  const $ = id => doc.getElementById(id);
  const read = (key, fallback) => { try { const v = JSON.parse(storage?.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { storage?.setItem(key, JSON.stringify(value)); } catch {} };
  let state = read(TODAY_KEY, null), busy = false, disposed = false;
  if (!state || typeof state !== 'object' || typeof state.day !== 'string') state = null;

  // The page can go away while the weather is on its way; then there is nothing left to update.
  const gone = () => disposed || !$('today');
  const status = text => { if (!gone()) $('today-status').textContent = text || ''; };
  const place = () => { const p = read(PLACE_KEY, null); return p?.mode === 'typed' && Number.isFinite(p.lat) && Number.isFinite(p.lon) ? p : { mode: 'device' }; };
  const current = () => state?.choice === 'idea' ? state.idea : state?.trio?.[state?.choice];
  const save = () => write(TODAY_KEY, state);
  function remember(recipe) {
    const history = read(HISTORY_KEY, []).filter(h => h?.day && h.day !== state.day).slice(0, 13);
    write(HISTORY_KEY, [{ day: state.day, recipe }, ...history]);
  }
  function setBusy(value) {
    busy = value; if (gone()) return;
    $('today-another').disabled = busy || !state?.trio;
    $('today-undo').disabled = busy || !state?.undo?.length;
    for (const [key] of LOOKS) $(`look-${key}`).disabled = busy || !state?.trio;
  }

  function render() {
    if (gone()) return;
    const day = state?.day ?? dayKey(now()), c = state?.conditions;
    $('today-date').textContent = new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });
    const p = place();
    $('today-place').textContent = p.mode === 'typed' ? p.name : 'your location';
    $('today-temp').textContent = c ? `${Math.round(c.feels)}°` : '';
    $('today-weather').textContent = c ? describe(c) : '';
    paintSky($('sky'), c);
    $('today-icon').replaceChildren(...(c ? [weatherIcon(doc, skyKind(c))] : []));
    // A few moments of her day, when the forecast gives them.
    $('today-hours').replaceChildren(...(c?.hours || []).map(x => {
      const li = doc.createElement('li'), time = doc.createElement('span'), deg = doc.createElement('span');
      time.className = 'hour-time'; time.textContent = `${x.hour}:00`;
      deg.className = 'hour-temp'; deg.textContent = `${Math.round(x.feels)}°`;
      li.append(time, weatherIcon(doc, codeKind(x.code, { rainChance: x.rain, snow: x.snow, feels: x.feels }), { animate: false }), deg);
      return li;
    }));
    // The three looks under the doll, each with its colours; the one she wears is pressed.
    for (const [key, label] of LOOKS) {
      const b = $(`look-${key}`), look = state?.trio?.[key], name = doc.createElement('span'), note = doc.createElement('span');
      name.className = 'look-name'; name.textContent = label;
      note.className = 'look-note'; note.textContent = NOTES[key];
      b.replaceChildren(outfitSwatch(doc, look?.pieces), name, note);
      b.setAttribute('aria-pressed', String(state?.choice === key));
    }
    const result = current(), list = $('today-pieces');
    $('today-look').textContent = state?.choice ? TITLES[state.choice] : '';
    list.replaceChildren();
    if (result) {
      const rows = [...result.pieces, ...(result.pieces.some(r => r.slot === 'outerwear') ? [] : [{ slot: 'outerwear', id: 'none', name: 'No jacket' }]), { slot: 'hair', id: result.recipe.hairId, name: hairName(result.recipe.hairId) }];
      for (const row of rows) {
        const li = doc.createElement('li'), label = doc.createElement('span'), name = doc.createElement('span');
        label.className = 'today-slot'; label.textContent = SLOT_NAMES[row.slot]; name.textContent = row.name;
        const cloth = row.slot === 'hair' ? doc.createElement('span') : row.id === 'none' ? doc.createElement('span') : swatch(doc, row.id, 'piece-cloth');
        if (row.slot === 'hair') { cloth.className = 'piece-cloth hair'; cloth.style.background = HAIR_COLOUR; }
        if (row.id === 'none') cloth.className = 'piece-cloth empty';
        li.append(cloth, label, name);
        list.append(li);
      }
    }
    $('today-reasons').replaceChildren(...(result?.reasons || []).map(r => { const li = doc.createElement('li'); li.textContent = sentence(r); return li; }));
    setBusy(busy);
  }

  const recent = () => read(HISTORY_KEY, []).filter(h => h?.day && h.day < state.day).map(h => h.recipe).slice(0, 7);
  // Choose the day's three looks for the current weather and wear her pick.
  function chooseLooks() {
    const trio = composeTrio(state.conditions, { seed: state.seed, recent: recent(), learned: read(LEARNED_KEY, null), current: getRecipe() });
    if (!trio) { status('Nothing in the wardrobe suits that weather.'); return false; }
    Object.assign(state, { trio, choice: 'pick', idea: null, ideas: [], undo: [] });
    save(); remember(trio.pick.recipe); wear(trio.pick.recipe); render();
    return true;
  }
  // Put on one of the three looks. These never change during the day.
  function choose(key) {
    if (!state?.trio || busy) return;
    state.choice = key; save(); remember(state.trio[key].recipe); wear(state.trio[key].recipe); render();
    status('');
  }
  // One more outfit, different from the three and from earlier ideas; Undo goes back to what she wore before.
  function another() {
    if (!state?.trio || busy) return;
    const shown = [...LOOKS.map(([k]) => state.trio[k].recipe), ...(state.ideas || [])];
    const idea = composeOutfit(state.conditions, { seed: state.seed + 7 * (state.ideas.length + 1), recent: recent(), shownToday: shown, learned: read(LEARNED_KEY, null), current: getRecipe() });
    if (!idea) { status('No other outfit suits this weather.'); return; }
    state.undo = [...(state.undo || []), { choice: state.choice, idea: state.idea }].slice(-10);
    Object.assign(state, { choice: 'idea', idea, ideas: [...state.ideas, idea.recipe].slice(-12) });
    save(); remember(idea.recipe); wear(idea.recipe); render();
    status('');
  }
  function undo() {
    const prev = state?.undo?.pop(); if (!prev) return;
    Object.assign(state, prev); save();
    const r = current(); remember(r.recipe); wear(r.recipe); render();
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
  const fresh = day => ({ day, conditions: null, seed: seedOf(day), trio: null, choice: null, idea: null, ideas: [], undo: [] });
  const failed = error => { if (gone()) return; status(`${error.message} Choose today's weather, or type a town.`); $('today-manual').open = true; };

  // A new day: check the weather and choose the day's looks. Without a forecast, ask for the weather.
  async function dressForToday() {
    state = fresh(dayKey(now())); save(); render(); setBusy(true); status('Checking the weather…');
    try { state.conditions = await forecast(state.day); if (gone()) return; status(''); chooseLooks(); }
    catch (error) { failed(error); }
    finally { setBusy(false); }
  }
  // The place changed: new weather, so new looks.
  async function refetch() {
    if (!state || state.day !== dayKey(now())) return dressForToday();
    setBusy(true); status('Checking the weather…');
    try { state.conditions = await forecast(state.day); status(''); chooseLooks(); }
    catch (error) { failed(error); }
    finally { setBusy(false); }
  }

  for (const [key] of LOOKS) $(`look-${key}`).onclick = () => choose(key);
  $('today-another').onclick = another;
  $('today-undo').onclick = undo;
  $('today-presets').replaceChildren(...PRESETS.map(p => {
    const b = doc.createElement('button'); b.type = 'button'; b.textContent = p.label;
    b.onclick = () => {
      if (!state || state.day !== dayKey(now())) state = fresh(dayKey(now()));
      state.conditions = presetConditions(p.id, state.day);
      if (chooseLooks()) status(`Dressed for ${p.label.toLowerCase()} weather.`);
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
  const ready = state?.day === dayKey(now()) && state.trio ? Promise.resolve() : dressForToday();
  return {
    ready, getState: () => state && copy(state), title: () => state?.choice ? TITLES[state.choice] : null,
    dispose() { disposed = true; doc.removeEventListener('visibilitychange', onVisible); $('save')?.removeEventListener('click', onSave); },
  };
}
