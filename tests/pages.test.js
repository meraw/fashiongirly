import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { startStudio } from '../src/doll/app.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
import { skyKind, paintSky } from '../src/today/sky.js';
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
});
