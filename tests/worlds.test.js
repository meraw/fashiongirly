import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync, existsSync } from 'node:fs';
import { PALETTES } from '../src/art/worlds/palettes.js';
import { WORLD_IDS, DEFAULT_WORLD, worldFor, skyWeights, paintWorld, sunOnScreen, skyColour } from '../src/today/world.js';
import { paintSky } from '../src/today/sky.js';
import { presetConditions, cleanConditions } from '../src/weather/conditions.js';
import { toConditions, forecastUrl } from '../src/weather/open-meteo.js';
import { expressionFor, EXPRESSIONS } from '../src/doll/face.js';
import { makeDoll, setExpression } from '../src/doll/model.js';
import { startStudio } from '../src/doll/app.js';

const LONDON = JSON.parse(readFileSync('tests/fixtures/open-meteo-london-2026-10-09.json', 'utf8'));
const CSS = readFileSync('src/doll/studio.css', 'utf8');
const at = (h, m = 0) => h * 60 + m;
const days = n => Array.from({ length: n }, (_, i) => new Date(Date.UTC(2026, 0, 1 + i)).toISOString().slice(0, 10));

test('every world has its painted skies, land, ground and foreground, its colours and its pictures in the stylesheet', () => {
  assert.ok(WORLD_IDS.length >= 4, 'a collection of worlds');
  assert.equal(DEFAULT_WORLD, 'apricot-mountains', 'the original sunset is one of them');
  for (const id of WORLD_IDS) {
    for (const file of ['sky-golden', 'sky-day', 'sky-night', 'land', 'ground', 'front']) assert.ok(existsSync(`src/art/worlds/${id}/${file}.webp`), `${id}/${file}.webp`);
    const p = PALETTES[id];
    for (const phase of ['golden', 'day', 'night']) assert.ok(p.sky[phase].stops.length >= 2, `${id} ${phase} sky colours`);
    for (const key of ['golden', 'day', 'night', 'fill', 'rim']) assert.match(p.light[key], /^#[0-9a-f]{6}$/i, `${id} ${key} light`);
    // The default world's pictures are the stylesheet's defaults; the others are chosen by :root[data-world].
    if (id !== DEFAULT_WORLD) assert.match(CSS, new RegExp(`:root\\[data-world=${id}\\]\\{[^}]*worlds/${id}/front\\.webp`), `${id} in the stylesheet`);
  }
  assert.match(CSS, /:root\{[^}]*worlds\/apricot-mountains\/sky-golden\.webp/);
});

test('one world a day: the same day and weather always give the same world, the winter wood only when it is cold', () => {
  const mild = presetConditions('mild'), hot = presetConditions('hot');
  for (const day of days(30)) assert.equal(worldFor(day, mild), worldFor(day, mild));
  assert.equal(worldFor('2026-10-11', presetConditions('snowy')), 'winter-wood');
  assert.equal(worldFor('2026-10-11', presetConditions('freezing')), 'winter-wood');
  const warm = new Set(days(90).map(day => worldFor(day, hot)));
  assert.ok(!warm.has('winter-wood'), 'never snow underfoot on a hot day');
  assert.deepEqual([...warm].sort(), WORLD_IDS.filter(id => id !== 'winter-wood').sort(), 'every other world comes round');
  assert.ok(WORLD_IDS.includes(worldFor('2026-10-11', null)), 'a world before the weather is known');
});

test('the skies follow the sun: night, dawn, day, the golden hour and dusk', () => {
  const sum = w => w.night + w.golden + w.day;
  for (let t = 0; t < 1440; t += 15) assert.ok(Math.abs(sum(skyWeights(t, '07:30', '18:45')) - 1) < .01, `weights add up at ${t}`);
  assert.deepEqual(skyWeights(at(2), '07:30', '18:45'), { night: 1, golden: 0, day: 0, dawn: true });
  assert.equal(skyWeights(at(12), '07:30', '18:45').day, 1, 'noon is day');
  const dawn = skyWeights(at(7, 40), '07:30', '18:45');
  assert.ok(dawn.golden > .5 && dawn.dawn, 'just after sunrise the golden sky, as dawn');
  const evening = skyWeights(at(18, 30), '07:30', '18:45');
  assert.ok(evening.golden > .9 && !evening.dawn, 'just before sunset the golden hour');
  assert.equal(skyWeights(at(20, 30), '07:30', '18:45').night, 1, 'night after dusk');
  // The forecast's sun times move it: a winter afternoon is already dark at half past five.
  assert.equal(skyWeights(at(17, 30), '08:10', '16:20').night, 1);
  assert.equal(skyWeights(at(17, 30)).day, 1, 'without sun times, 7:00 and 19:00');
});

test('the forecast brings the sun times, and chosen weather has none', () => {
  assert.match(forecastUrl({ lat: 51.5, lon: -.13 }, '2026-10-09'), /daily=sunrise%2Csunset/);
  const c = toConditions({ ...LONDON, daily: { time: ['2026-10-09'], sunrise: ['2026-10-09T07:14'], sunset: ['2026-10-09T18:22'] } }, '2026-10-09');
  assert.equal(c.sunrise, '07:14'); assert.equal(c.sunset, '18:22');
  assert.equal(toConditions(LONDON, '2026-10-09').sunrise, null, 'an older answer without them');
  assert.equal(cleanConditions({ feels: 10, sunrise: '7:14', sunset: '26:00' }).sunset, null, 'only real times are kept');
  assert.equal(presetConditions('mild').sunrise, null);
});

test('the world is shown on the page and told to the 3D light', () => {
  const dom = new JSDOM('<html><body><div id="sky"></div></body></html>'), d = dom.window.document, heard = [];
  d.addEventListener('world-change', e => heard.push(e.detail));
  paintWorld(d, { world: 'rain-garden', weights: skyWeights(at(18, 30), '07:30', '18:45') });
  assert.equal(d.documentElement.dataset.world, 'rain-garden');
  assert.equal(heard.length, 1); assert.equal(heard[0].world, 'rain-garden');
  // The skies are stacked night, day, golden; the shares on the page add up to the weights.
  const w = heard[0].weights, s = d.documentElement.style, g = +s.getPropertyValue('--golden-a'), dayA = +s.getPropertyValue('--day-a');
  assert.ok(Math.abs(g - w.golden) < 1e-6 && Math.abs((1 - g) * dayA - w.day) < .01);
  paintWorld(d, { world: 'rain-garden', weights: w });
  assert.equal(heard.length, 1, 'nothing new, nothing told');
  paintWorld(d, { world: 'nowhere', weights: w });
  assert.equal(d.documentElement.dataset.world, DEFAULT_WORLD, 'an unknown world falls back to the first');
  assert.equal(sunOnScreen('apricot-mountains', { golden: 0, day: 0, night: 1 }, 390, 844), null, 'no sun at night');
  const sun = sunOnScreen('apricot-mountains', { golden: 1, day: 0, night: 0 }, 1800, 1200);
  assert.ok(Math.abs(sun.x - .6 * 1800) < 1 && Math.abs(sun.y - .36 * 1200) < 1, 'the painted sun, where it is painted');
  const night = skyColour('winter-wood', 0, { golden: 0, day: 0, night: 1 }), noon = skyColour('winter-wood', 0, { golden: 0, day: 1, night: 0 });
  assert.ok(night.reduce((a, b) => a + b) < noon.reduce((a, b) => a + b), 'the night sky is darker');
});

test('the sky is drawn over her world: three skies, then the weather, the land, the ground and a veil for the night', () => {
  const dom = new JSDOM('<div id="sky"></div>'), d = dom.window.document, el = d.getElementById('sky'), heard = [];
  d.addEventListener('weather-change', e => heard.push(e.detail));
  paintSky(el, presetConditions('rainy'));
  const order = [...el.children].map(c => c.className);
  assert.deepEqual(order.slice(0, 3), ['sky-night', 'sky-day', 'sky-golden']);
  assert.ok(order.indexOf('ground') < order.indexOf('night-veil') && order.indexOf('night-veil') < order.indexOf('drop'));
  assert.equal(d.documentElement.dataset.sky, 'rain', 'the land and the foreground take the weather through :root');
  assert.deepEqual(heard.at(-1), { kind: 'rain', feels: 12 }, 'her face hears how warm it feels');
  // A colder day under the same sky still tells her face; the same weather again does not.
  paintSky(el, presetConditions('chilly')); const n = heard.length;
  paintSky(el, presetConditions('cold'));
  assert.equal(heard.length, n + 1); assert.equal(heard.at(-1).feels, 3);
  paintSky(el, presetConditions('cold'));
  assert.equal(heard.length, n + 1);
});

test('her face follows the weather and comes back to her usual smile', () => {
  assert.equal(expressionFor({ kind: 'sun', feels: 24 }), 'beam');
  assert.equal(expressionFor({ kind: 'sun', feels: 14 }), 'smile');
  assert.equal(expressionFor({ kind: 'cloud', feels: 2 }), 'rosy');
  assert.equal(expressionFor({ kind: 'snow', feels: -1 }), 'rosy');
  assert.equal(expressionFor({ kind: 'rain', feels: 12 }), 'wistful');
  assert.equal(expressionFor({ kind: 'fog', feels: 9 }), 'dreamy');
  assert.equal(expressionFor({}), 'smile');
  const doll = makeDoll(), head = doll.getObjectByName('doll-head');
  const face = () => JSON.stringify(head.children.filter(o => ['stitched-smile', 'cheek', 'eyebrow'].includes(o.name)).map(o => [...o.geometry.attributes.position.array]));
  const usual = face(), blush = head.getObjectByName('cheek').material.opacity;
  assert.equal(setExpression(doll, 'smile'), false, 'already smiling');
  for (const mood of Object.keys(EXPRESSIONS).filter(m => m !== 'smile')) {
    assert.equal(setExpression(doll, mood), true);
    assert.notEqual(face(), usual, `${mood} changes her face`);
    for (const o of head.children) if (o.geometry) for (const v of o.geometry.attributes.position.array) assert.ok(Number.isFinite(v));
  }
  assert.ok(head.getObjectByName('cheek').material.opacity !== blush);
  setExpression(doll, 'smile');
  assert.equal(face(), usual, 'exactly her usual face again');
  assert.equal(head.getObjectByName('cheek').material.opacity, blush);
  assert.equal(setExpression(doll, 'no-such-mood'), false, 'an unknown mood is her usual smile');
});

test('the Today page shows the day\'s world at the hour, or any world and hour asked for in the address', async () => {
  const open = async (url, now) => {
    const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url }), d = dom.window.document;
    const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null, now: () => now });
    return { d, close() { app.dispose(); dom.window.close(); } };
  };
  const noon = new Date(2026, 9, 11, 12, 0).getTime();
  const a = await open('https://example.com/#today', noon);
  assert.ok(WORLD_IDS.includes(a.d.documentElement.dataset.world));
  assert.equal(a.d.documentElement.dataset.weights, '0,1,0', 'noon is day');
  assert.equal(a.d.documentElement.dataset.daylight, 'true');
  a.close();
  const b = await open('https://example.com/?world=winter-wood&at=21:30#today', noon);
  assert.equal(b.d.documentElement.dataset.world, 'winter-wood');
  assert.equal(b.d.documentElement.dataset.weights, '0,0,1', 'half past nine is night');
  assert.ok(b.d.querySelector('.foreground'), 'the foreground stands in front of her');
  b.close();
});
