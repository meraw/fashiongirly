// The scene behind her, from the day's weather: a sky (sun, a few clouds, overcast, rain, heavy rain, snow or fog,
// with gusts in wind), the painted mountains from src/art/mountains.webp, and the hill she stands on. Rain and snow
// fall in front of the mountains. Plain elements animated by CSS (studio.css); with reduced motion they hold still.
// weatherIcon() draws the same weather small, for the Today page.
const RAINY = new Set([51, 53, 55, 56, 57, 61, 63, 66, 80, 81]), HEAVY = new Set([65, 67, 82, 95, 96, 99]);
const SNOWY = new Set([71, 73, 75, 77, 85, 86]);

// The kind of weather from a WMO code and the chance of rain, for one hour or a whole day.
export function codeKind(code, { rainChance = 0, rainMm = 0, snow = false, feels = 15 } = {}) {
  if (snow || SNOWY.has(code)) return 'snow';
  const wet = rainChance >= 50 || rainMm >= 1 || RAINY.has(code) || HEAVY.has(code);
  if (wet) return HEAVY.has(code) || rainMm >= 6 ? 'heavy-rain' : 'rain';
  if (code === 45 || code === 48) return 'fog';
  if (code === 0 || code === 1) return 'sun';
  if (code === 2) return 'partly';
  if (code === 3) return 'cloud';
  return feels >= 20 ? 'sun' : feels >= 12 ? 'partly' : 'cloud';
}
export function skyKind(c) {
  return c ? codeKind(c.code, c) : 'none';
}

const COUNTS = { sun: [0, 0, 0], partly: [2, 0, 0], cloud: [4, 0, 0], rain: [3, 45, 0], 'heavy-rain': [4, 110, 0], snow: [2, 0, 45], fog: [0, 0, 0], none: [0, 0, 0] };
// A repeatable scatter, so the sky does not jump when the page redraws.
const scatter = i => { const x = Math.sin(i * 12.9898) * 43758.5453; return x - Math.floor(x); };

export function paintSky(el, conditions) {
  if (!el) return 'none';
  const kind = skyKind(conditions), windy = (conditions?.windKmh ?? 0) >= 30;
  if (el.dataset.kind === kind && (el.dataset.windy === 'true') === windy && el.childElementCount) return kind;
  el.dataset.kind = kind; el.dataset.windy = String(windy);
  const doc = el.ownerDocument, parts = [];
  const add = (cls, vars = {}) => { const s = doc.createElement('span'); s.className = cls; for (const [k, v] of Object.entries(vars)) s.style.setProperty(k, v); parts.push(s); };
  if (kind === 'sun' || kind === 'partly') add('sun');
  if (kind === 'fog') for (let i = 0; i < 4; i++) add('fog-band', { '--y': `${18 + i * 18}%`, '--d': `${26 + i * 7}s`, '--delay': `${-i * 6}s` });
  const [clouds, drops, flakes] = COUNTS[kind];
  for (let i = 0; i < clouds; i++) add(`cloud${kind === 'heavy-rain' ? ' dark' : ''}`, { '--x': `${(scatter(i + 9) * 80).toFixed(1)}%`, '--y': `${4 + scatter(i + 1) * 26}%`, '--s': (.7 + scatter(i + 7) * .7).toFixed(2), '--d': `${70 + scatter(i + 3) * 60}s`, '--delay': `${-scatter(i + 5) * 90}s` });
  // The mountains and her hill, painted over with brushwork, then whatever falls in front of them.
  add('land'); add('ground'); add('brush');
  for (let i = 0; i < drops; i++) add('drop', { '--x': `${(scatter(i + 11) * 112 - 6).toFixed(1)}%`, '--y': `${(scatter(i + 13) * 100).toFixed(1)}%`, '--d': `${((kind === 'heavy-rain' ? .45 : .8) + scatter(i + 17) * .4).toFixed(2)}s`, '--delay': `${(-scatter(i + 19) * 2).toFixed(2)}s` });
  for (let i = 0; i < flakes; i++) add('flake', { '--x': `${(scatter(i + 23) * 100).toFixed(1)}%`, '--y': `${(scatter(i + 29) * 100).toFixed(1)}%`, '--s': (.5 + scatter(i + 31)).toFixed(2), '--d': `${(6 + scatter(i + 37) * 6).toFixed(1)}s`, '--delay': `${(-scatter(i + 41) * 12).toFixed(1)}s` });
  if (windy && kind !== 'rain' && kind !== 'heavy-rain') for (let i = 0; i < 5; i++) add('gust', { '--y': `${20 + scatter(i + 43) * 55}%`, '--d': `${2.5 + scatter(i + 47) * 2}s`, '--delay': `${-scatter(i + 53) * 4}s` });
  el.replaceChildren(...parts);
  return kind;
}

// A small weather picture: the sun, a cloud, drops or flakes, as for the sky.
export function weatherIcon(doc, kind, { animate = true } = {}) {
  const icon = doc.createElement('span');
  icon.className = `wx${animate ? '' : ' still'}`; icon.dataset.kind = kind; icon.setAttribute('aria-hidden', 'true');
  const add = cls => { const s = doc.createElement('span'); s.className = cls; icon.append(s); };
  if (kind === 'sun' || kind === 'partly' || kind === 'none') add('wx-sun');
  if (kind !== 'sun' && kind !== 'none') add('wx-cloud');
  if (kind === 'rain' || kind === 'heavy-rain') for (let i = 0; i < (kind === 'rain' ? 3 : 5); i++) add('wx-drop');
  if (kind === 'snow') for (let i = 0; i < 3; i++) add('wx-flake');
  if (kind === 'fog') for (let i = 0; i < 2; i++) add('wx-fog');
  return icon;
}
