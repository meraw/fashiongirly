// Today: each morning (from 5:00) she checks the weather and chooses three looks for the day: her pick, a bolder one
// and an easier one. They stay the same all day (the user's request, 9 October 2026: three fixed choices inspire,
// endless variations confuse). Today offers only these three choices.
// The weather comes from the phone's location by default, or a typed town, through Open-Meteo; without a forecast
// the user chooses the weather. The card says what she dressed for, and "Too warm" and "Too cool" dress her a step
// lighter or warmer, remembered for the days after: she dresses as if the forecast were that much warmer or cooler
// (the user, 12 October 2026). Everything she remembers stays in this browser's storage.
import { composeTrio, RULES_VERSION } from '../style/stylist.js';
import { LEARNED_KEY, learn } from '../style/taste.js';
import { mountLookCards } from './look-cards.js';
import { swatch } from '../doll/swatch.js';
import { dayKey, describe, cleanConditions, presetConditions, PRESETS, forPerson, PERSONAL_LIMIT, inTheSun } from '../weather/conditions.js';
import { fetchConditions, findPlace } from '../weather/open-meteo.js';
import { cleanRecipe } from '../doll/recipe.js';
import { hairName, HAIR_COLOUR } from '../hair/catalog.js';
import { paintSky, skyKind, codeKind, weatherIcon } from './sky.js';
import { worldFor, skyWeights, paintWorld, WORLD_IDS } from './world.js';

export const TODAY_KEY = 'fashiongirly.today.v2', HISTORY_KEY = 'fashiongirly.days.v1', PLACE_KEY = 'fashiongirly.place.v1', WEATHER_KEY = 'fashiongirly.weather.v1', WARMTH_KEY = 'fashiongirly.warmth.v1';
export const LOOKS = [['pick', 'Her pick'], ['bolder', 'Bolder'], ['easier', 'Easier']];
const TITLES = { pick: 'Her pick for today.', bolder: 'Her bolder look.', easier: 'Her easier look.' };
const SLOT_NAMES = { dress: 'Dress', top: 'Top', under: 'Under it', bottom: 'Bottoms', shoes: 'Shoes', outerwear: 'Outerwear', hair: 'Hair' };
const seedOf = day => [...day].reduce((h, c) => Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
const sentence = s => s.charAt(0).toUpperCase() + s.slice(1) + '.';
const copy = v => JSON.parse(JSON.stringify(v));
const clampOffset = v => Number.isFinite(v) ? Math.max(-PERSONAL_LIMIT, Math.min(PERSONAL_LIMIT, v)) : 0;
// A forecast read before she dressed for the warm part of the day in the sun (it has no `shade`) is read again.
const outdated = c => c?.source === 'forecast' && !Number.isFinite(c.shade);
export function mountToday(doc, { storage = null, getRecipe, wear, getUnavailable = () => [], renderPortrait = null, fetch: fetchImpl = null, geolocation = null, now = () => Date.now() } = {}) {
  const $ = id => doc.getElementById(id);
  const cards = mountLookCards(doc, { storage, renderPortrait });
  const read = (key, fallback) => { try { const v = JSON.parse(storage?.getItem(key) || 'null'); return v ?? fallback; } catch { return fallback; } };
  const write = (key, value) => { try { storage?.setItem(key, JSON.stringify(value)); } catch {} };
  let state = read(TODAY_KEY, null), busy = false, disposed = false;
  // A preview of any world at any hour, for review: ?world=rain-garden&at=21:30 in the address.
  const ask = new URLSearchParams(doc.defaultView?.location?.search || ''), askWorld = WORLD_IDS.includes(ask.get('world')) ? ask.get('world') : null;
  const askAt = /^([01]\d|2[0-3]):[0-5]\d$/.test(ask.get('at') || '') ? ask.get('at') : null;
  if (!state || typeof state !== 'object' || typeof state.day !== 'string') state = null;

  // Discard mood-era choices and extra ideas; existing forecasts, history and personal warmth stay usable.
  if (state) {
    if (Object.hasOwn(state, 'mood') || state.choice === 'idea') state.rules = null;
    for (const field of ['mood', 'idea', 'ideas', 'undo']) delete state[field];
  }

  // The page can go away while the weather is on its way; then there is nothing left to update.
  const gone = () => disposed || !$('today');
  const status = text => { if (!gone()) $('today-status').textContent = text || ''; };
  const place = () => { const p = read(PLACE_KEY, null); return p?.mode === 'typed' && Number.isFinite(p.lat) && Number.isFinite(p.lon) ? p : { mode: 'device' }; };
  const current = () => state?.trio?.[state?.choice];
  // The day as she dresses for this person: the forecast, as much warmer or cooler as they have asked.
  const offset = () => clampOffset(read(WARMTH_KEY, 0)), dressFor = () => forPerson(state.conditions, offset());
  const save = () => write(TODAY_KEY, state);
  function remember(recipe) {
    const history = read(HISTORY_KEY, []).filter(h => h?.day && h.day !== state.day).slice(0, 13);
    write(HISTORY_KEY, [{ day: state.day, recipe }, ...history]);
  }
  function setBusy(value) {
    busy = value; if (gone()) return;
    for (const [key] of LOOKS) $(`look-${key}`).disabled = busy || !state?.trio;
    $('today-too-warm').disabled = $('today-too-cool').disabled = busy || !current();
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
    world();
    $('today-icon').replaceChildren(...(c ? [weatherIcon(doc, skyKind(c))] : []));
    // A few moments of her day, when the forecast gives them.
    $('today-hours').replaceChildren(...(c?.hours || []).map(x => {
      const li = doc.createElement('li'), time = doc.createElement('span'), deg = doc.createElement('span');
      time.className = 'hour-time'; time.textContent = `${x.hour}:00`;
      deg.className = 'hour-temp'; deg.textContent = `${Math.round(x.feels)}°`;
      li.append(time, weatherIcon(doc, codeKind(x.code, { rainChance: x.rain, snow: x.snow, feels: x.feels }), { animate: false }), deg);
      return li;
    }));
    cards.sync({ day, trio: state?.trio, choice: state?.choice });
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
    // What she dressed for: the temperature the look was chosen for, which part of the day that is, and how much warmer
    // or cooler she makes it for this person. When the day feels unlike that, the forecast was off.
    const dressed = $('today-dressed'), feels = Number.isFinite(result?.warmth?.feels) ? result.warmth.feels : c?.feels;
    dressed.replaceChildren();
    if (result && c && Number.isFinite(feels)) {
      const deg = doc.createElement('strong'), extra = Math.round(feels - c.feels);
      const when = c.source !== 'forecast' ? 'the weather you chose' : inTheSun(c) ? 'this afternoon, in the sun' : 'this afternoon';
      deg.textContent = `${Math.round(feels)}°`;
      dressed.append('Dressed for ', deg, ` · ${when}${extra ? ` · ${Math.abs(extra)}° ${extra > 0 ? 'warmer' : 'cooler'} for you` : ''}`);
    }
    const o = offset();
    $('today-offset').hidden = !o;
    $('today-offset-text').textContent = o ? `For you, she dresses as if it were ${Math.abs(o)}° ${o > 0 ? 'warmer' : 'cooler'} than the forecast.` : '';
    setBusy(busy);
  }

  // Her world for the day and the hour in it (src/today/world.js): the sun's times come with the forecast.
  function world() {
    if (gone()) return;
    const c = state?.conditions, d = new Date(now()), at = askAt ? +askAt.slice(0, 2) * 60 + +askAt.slice(3) : d.getHours() * 60 + d.getMinutes();
    paintWorld(doc, { world: askWorld ?? worldFor(state?.day ?? dayKey(now()), c), weights: skyWeights(at, c?.sunrise, c?.sunset) });
  }

  const recent = () => read(HISTORY_KEY, []).filter(h => h?.day && h.day < state.day).map(h => h.recipe).slice(0, 7);
  // Choose the day's three looks for the current weather and wear her pick.
  function chooseLooks({ putOn = true } = {}) {
    const trio = composeTrio(dressFor(), { avoid: getUnavailable(), seed: state.seed, recent: recent(), learned: read(LEARNED_KEY, null), current: getRecipe() });
    Object.assign(state, { trio, choice: trio && putOn ? 'pick' : null, rules: RULES_VERSION });
    save();
    if (!trio) { render(); status('Nothing in the wardrobe suits that weather.'); return false; }
    if (putOn) { remember(trio.pick.recipe); wear(trio.pick.recipe); }
    render();
    return true;
  }
  // Put on one of the three looks. These never change during the day.
  function choose(key) {
    if (!state?.trio || busy) return;
    state.choice = key; save(); remember(state.trio[key].recipe); wear(state.trio[key].recipe); render();
    status('');
  }
  // "Too warm" (direction 1) or "Too cool" (-1): she dresses lighter or warmer, as if the day were warmer or cooler,
  // and remembers it. The step is the least, in twos of degrees up to PERSONAL_LIMIT, that changes the warmth of the
  // look she is wearing; if none does, she is already dressed as lightly (or as warmly) as she would for this weather,
  // and nothing changes.
  function feel(direction) {
    if (!state?.trio || busy) return;
    const key = state.choice || 'pick', was = current()?.warmth.total ?? 0;
    for (let o = offset() + 2 * direction; Math.abs(o) <= PERSONAL_LIMIT; o += 2 * direction) {
      const trio = composeTrio(forPerson(state.conditions, o), { avoid: getUnavailable(), seed: state.seed, recent: recent(), learned: read(LEARNED_KEY, null), current: getRecipe() });
      if (!trio || (was - trio[key].warmth.total) * direction <= 0) continue;
      write(WARMTH_KEY, o);
      Object.assign(state, { trio, choice: key, rules: RULES_VERSION });
      save(); remember(trio[key].recipe); wear(trio[key].recipe); render();
      status(o === 0 ? 'She dresses for the forecast as it is again.' : `${direction > 0 ? 'Lighter' : 'Warmer'}. From now on she dresses as if it were ${Math.abs(o)}° ${o > 0 ? 'warmer' : 'cooler'} than the forecast.`);
      return;
    }
    status(`This is already as ${direction > 0 ? 'light' : 'warm'} as she dresses for this weather.`);
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
    if (cached?.key === key && cleanConditions(cached.conditions) && !outdated(cleanConditions(cached.conditions))) return cleanConditions(cached.conditions);
    const conditions = await fetchConditions(where, day, fetchImpl);
    write(WEATHER_KEY, { key, conditions });
    return conditions;
  }
  const fresh = day => ({ day, conditions: null, seed: seedOf(day), trio: null, choice: null });
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
  $('today-too-warm').onclick = () => feel(1);
  $('today-too-cool').onclick = () => feel(-1);
  $('today-offset-reset').onclick = () => { write(WARMTH_KEY, 0); if (state?.conditions && chooseLooks()) status('She dresses for the forecast as it is again.'); else render(); };
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
  const onVisible = () => { world(); if (doc.visibilityState !== 'hidden' && state?.day !== dayKey(now()) && !busy) dressForToday(); };
  doc.addEventListener('visibilitychange', onVisible);
  // The light moves on through the day: the skies are looked at again every few minutes, and when the screen changes
  // size (the painted sun's place on the page moves with it).
  const win = doc.defaultView, clock = win?.setInterval ? win.setInterval(world, 5 * 60e3) : null;
  win?.addEventListener('resize', world);

  render();
  const hasRemoved = value => {
    const ids = new Set(getUnavailable());
    const visit = v => typeof v === 'string' ? ids.has(v) : v && typeof v === 'object' ? Object.values(v).some(visit) : false;
    return visit(value);
  };
  // Today's looks chosen by an older version of her rules are chosen again, for the same weather.
  const ready = state?.day === dayKey(now()) && cleanConditions(state.conditions) && !outdated(state.conditions)
    ? Promise.resolve().then(() => { if ((!state.trio || state.rules !== RULES_VERSION || hasRemoved(state)) && !gone()) chooseLooks(); }) : dressForToday();
  return {
    refreshPreviews() { if (!gone()) cards.sync({ day: state?.day ?? dayKey(now()), trio: state?.trio, choice: state?.choice }); },
    ready, getState: () => state && copy(state), title: () => state?.choice ? TITLES[state.choice] : null,
    wardrobeChanged() { if (state?.conditions) chooseLooks({ putOn: false }); },
    dispose() { disposed = true; cards.dispose(); doc.removeEventListener('visibilitychange', onVisible); if (clock != null) win.clearInterval(clock); win?.removeEventListener('resize', world); $('save')?.removeEventListener('click', onSave); },
  };
}
