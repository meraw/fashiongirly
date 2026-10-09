// The sky behind her, from the day's weather: sun, a few clouds, overcast, rain, heavy rain, snow or fog, with wind
// slanting the rain. Plain elements animated by CSS (studio.css); with reduced motion they hold still.
const RAINY = new Set([51, 53, 55, 56, 57, 61, 63, 66, 80, 81]), HEAVY = new Set([65, 67, 82, 95, 96, 99]);

export function skyKind(c) {
  if (!c) return 'none';
  if (c.snow || (c.code >= 71 && c.code <= 77) || c.code === 85 || c.code === 86) return 'snow';
  const wet = c.rainChance >= 50 || c.rainMm >= 1 || RAINY.has(c.code) || HEAVY.has(c.code);
  if (wet) return HEAVY.has(c.code) || c.rainMm >= 6 ? 'heavy-rain' : 'rain';
  if (c.code === 45 || c.code === 48) return 'fog';
  if (c.code === 0 || c.code === 1) return 'sun';
  if (c.code === 2) return 'partly';
  if (c.code === 3) return 'cloud';
  return c.feels >= 20 ? 'sun' : c.feels >= 12 ? 'partly' : 'cloud';
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
  for (let i = 0; i < drops; i++) add('drop', { '--x': `${(scatter(i + 11) * 112 - 6).toFixed(1)}%`, '--y': `${(scatter(i + 13) * 100).toFixed(1)}%`, '--d': `${((kind === 'heavy-rain' ? .45 : .8) + scatter(i + 17) * .4).toFixed(2)}s`, '--delay': `${(-scatter(i + 19) * 2).toFixed(2)}s` });
  for (let i = 0; i < flakes; i++) add('flake', { '--x': `${(scatter(i + 23) * 100).toFixed(1)}%`, '--y': `${(scatter(i + 29) * 100).toFixed(1)}%`, '--s': (.5 + scatter(i + 31)).toFixed(2), '--d': `${(6 + scatter(i + 37) * 6).toFixed(1)}s`, '--delay': `${(-scatter(i + 41) * 12).toFixed(1)}s` });
  if (windy && kind !== 'rain' && kind !== 'heavy-rain') for (let i = 0; i < 5; i++) add('gust', { '--y': `${20 + scatter(i + 43) * 55}%`, '--d': `${2.5 + scatter(i + 47) * 2}s`, '--delay': `${-scatter(i + 53) * 4}s` });
  el.replaceChildren(...parts);
  return kind;
}
