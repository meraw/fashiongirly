import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { skyKind, paintSky, codeKind, weatherIcon } from '../src/today/sky.js';
import { swatchBackground, outfitSwatch } from '../src/doll/swatch.js';
import { presetConditions } from '../src/weather/conditions.js';

async function studio(hash = '') {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: `https://example.com/${hash}` }), d = dom.window.document;
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null });
  return { dom, d, app, close() { app.dispose(); dom.window.close(); } };
}

test('the studio has three pages, chosen by the address and marked in the tabs', async () => {
  const s = await studio('#wardrobe'), visible = () => [...s.d.querySelectorAll('.page')].filter(p => !p.hidden).map(p => p.dataset.page);
  assert.deepEqual(visible(), ['wardrobe']);
  assert.equal(s.d.querySelector('.tabs [aria-current=page]').dataset.page, 'wardrobe');
  s.dom.window.location.hash = '#dress'; s.dom.window.dispatchEvent(new s.dom.window.HashChangeEvent('hashchange'));
  assert.deepEqual(visible(), ['dress']);
  s.dom.window.location.hash = '#nowhere'; s.dom.window.dispatchEvent(new s.dom.window.HashChangeEvent('hashchange'));
  assert.deepEqual(visible(), ['today'], 'anything else shows Today');
  s.close();
});

test('the wardrobe page lists every garment by kind and puts a piece on her without changing the rest', async () => {
  const s = await studio('#wardrobe'), d = s.d;
  const pieces = [...d.querySelectorAll('#wardrobe-groups .piece')];
  assert.equal(pieces.length, Object.keys(GARMENTS).length);
  const before = s.app.getRecipe();
  const shoes = pieces.find(b => b.dataset.slot === 'shoes' && b.dataset.id !== before.shoesId);
  shoes.click();
  assert.equal(s.app.getRecipe().shoesId, shoes.dataset.id);
  assert.equal(s.app.getRecipe().topId, before.topId, 'the rest stays');
  assert.equal(shoes.getAttribute('aria-pressed'), 'true');
  const dress = pieces.find(b => b.dataset.slot === 'dress'); dress.click();
  assert.equal(s.app.getRecipe().dressId, dress.dataset.id);
  const top = pieces.find(b => b.dataset.slot === 'top'); top.click();
  assert.equal(s.app.getRecipe().dressId, 'none', 'a top takes the dress off');
  assert.equal(s.app.getRecipe().topId, top.dataset.id);
  s.close();
});

test('controls that do not apply are put away on the Dress her page', async () => {
  const s = await studio('#dress'), d = s.d, change = (id, v) => { d.getElementById(id).value = v; d.getElementById(id).dispatchEvent(new s.dom.window.Event('change')); };
  const plainTop = Object.values(GARMENTS).find(g => g.slot === 'top' && !g.layering?.overTop), cardigan = Object.values(GARMENTS).find(g => g.layering?.overTop);
  change('top-select', plainTop.id);
  assert.equal(d.getElementById('under-field').hidden, true);
  change('top-select', cardigan.id);
  assert.equal(d.getElementById('under-field').hidden, false, 'a cardigan can take a top under it');
  change('outerwear-select', 'none');
  assert.equal(d.getElementById('outerwear-options').hidden, true);
  assert.equal(d.getElementById('classic-controls').hidden, d.getElementById('bottom-select').value !== 'classic');
  s.close();
});

test('the sky follows the weather', () => {
  const c = (over = {}) => ({ feels: 15, rainChance: 0, rainMm: 0, windKmh: 0, snow: false, code: null, ...over });
  assert.equal(skyKind(null), 'none');
  assert.equal(skyKind(c({ code: 0 })), 'sun');
  assert.equal(skyKind(c({ code: 2 })), 'partly');
  assert.equal(skyKind(c({ code: 3 })), 'cloud');
  assert.equal(skyKind(c({ code: 61, rainChance: 70 })), 'rain');
  assert.equal(skyKind(c({ code: 65, rainChance: 90, rainMm: 12 })), 'heavy-rain');
  assert.equal(skyKind(c({ snow: true })), 'snow');
  assert.equal(skyKind(c({ code: 45 })), 'fog');
  assert.equal(skyKind(presetConditions('hot')), 'sun');
  assert.equal(skyKind(presetConditions('pouring')), 'heavy-rain');
  const dom = new JSDOM('<div id="sky"></div>'), el = dom.window.document.getElementById('sky');
  paintSky(el, presetConditions('rainy'));
  assert.equal(el.dataset.kind, 'rain');
  assert.ok(el.querySelectorAll('.drop').length > 20 && el.querySelectorAll('.cloud').length > 0);
  paintSky(el, presetConditions('pouring'));
  assert.ok(el.querySelectorAll('.drop').length > 80, 'heavy rain has more drops');
  paintSky(el, presetConditions('hot'));
  assert.equal(el.querySelectorAll('.sun').length, 1); assert.equal(el.querySelectorAll('.drop').length, 0);
  paintSky(el, presetConditions('windy'));
  assert.ok(el.querySelectorAll('.gust').length > 0);
  // The painted mountains and her hill sit behind whatever falls, which falls in front of them.
  paintSky(el, presetConditions('rainy'));
  const order = [...el.children].map(c => c.className);
  assert.ok(order.indexOf('land') >= 0 && order.indexOf('land') < order.indexOf('ground') && order.indexOf('ground') < order.indexOf('drop'));
  assert.ok(order.indexOf('cloud') < order.indexOf('land'), 'clouds are behind the mountains');
});

test('the weather has a small picture, for the day and for each hour', () => {
  assert.equal(codeKind(61, { rainChance: 80 }), 'rain');
  assert.equal(codeKind(0), 'sun');
  assert.equal(codeKind(73), 'snow');
  assert.equal(codeKind(null, { feels: 25 }), 'sun');
  const d = new JSDOM('').window.document;
  const rain = weatherIcon(d, 'rain'), sun = weatherIcon(d, 'sun', { animate: false });
  assert.equal(rain.querySelectorAll('.wx-cloud').length, 1);
  assert.equal(rain.querySelectorAll('.wx-drop').length, 3);
  assert.equal(weatherIcon(d, 'heavy-rain').querySelectorAll('.wx-drop').length, 5);
  assert.equal(sun.querySelectorAll('.wx-sun').length, 1);
  assert.ok(sun.classList.contains('still'));
  assert.equal(rain.getAttribute('aria-hidden'), 'true');
});

test('every garment has a fabric swatch with a hint of its pattern', () => {
  for (const [id, g] of Object.entries(GARMENTS)) assert.ok(swatchBackground(id), `${id} has a swatch`);
  const kind = id => swatchBackground(id);
  assert.match(kind('pink-ditsy-floral-yoke-shirt-v1'), /radial-gradient/, 'a print scatters its colours');
  assert.match(kind('mango-plaid-jumper-v1'), /repeating-linear-gradient\(90deg[\s\S]*repeating-linear-gradient\(0deg/, 'a check crosses');
  assert.match(kind('tommy-stripe-knit-polo-v1'), /repeating-linear-gradient\(0deg/, 'stripes run across');
  assert.equal(swatchBackground('no-such-garment'), null);
  const d = new JSDOM('').window.document;
  const strip = outfitSwatch(d, [{ slot: 'top', id: 'pink-ditsy-floral-yoke-shirt-v1' }, { slot: 'under', id: 'desigual-bronze-mesh-v1' }, { slot: 'bottom', id: 'mango-washed-black-v1' }, { slot: 'shoes', id: 'new-balance-550-cream-v1' }]);
  assert.equal(strip.children.length, 3, 'the under-top is not shown');
  assert.ok(Number(strip.children[0].style.flexGrow) > Number(strip.children[2].style.flexGrow), 'the top shows more than the shoes');
});
