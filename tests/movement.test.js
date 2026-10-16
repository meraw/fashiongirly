import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { wantsTwirl, spinAt, TWIRL_MS } from '../src/doll/twirl.js';
import { ATTITUDES, attitudeOf, pose, posePoint, headPose } from '../src/doll/pose.js';
import { createWind, windOffset } from '../src/hair/wind.js';
import { makeDoll, makeOutfit, fitDoll } from '../src/doll/model.js';
import { makeHair } from '../src/hair/model.js';
import { cleanRecipe } from '../src/doll/recipe.js';
import { paintSky } from '../src/today/sky.js';
import { presetConditions } from '../src/weather/conditions.js';
import { startStudio } from '../src/doll/app.js';

const positions = root => { const out = []; root.traverse(o => { if (o.geometry?.attributes?.position) out.push([...o.geometry.attributes.position.array, ...o.position.toArray()]); }); return out; };
const same = (a, b, eps = 1e-6) => a.length === b.length && a.every((x, i) => x.length === b[i].length && x.every((v, j) => Math.abs(v - b[i][j]) < eps));

test('she twirls when she changes clothes or hair, and not for a tuck, an open jacket or a slider', () => {
  const a = cleanRecipe({ topId: 'desigual-bronze-mesh-v1', knit: false, shirt: false });
  assert.equal(wantsTwirl(a, { ...a, shoesId: 'new-balance-550-cream-v1' }), true);
  assert.equal(wantsTwirl(a, { ...a, hairId: 'high-bun' }), true);
  assert.equal(wantsTwirl(a, { ...a, dressId: 'desigual-ivory-lace-shift-dress-v1' }), true);
  for (const change of [{ tucked: true }, { outerwearOpen: true }, { sleeve: .9 }, { sweater: '#ffcc00' }]) assert.equal(wantsTwirl(a, { ...a, ...change }), false, JSON.stringify(change));
  assert.equal(wantsTwirl(null, a), false, 'nothing to twirl from at the start');
  // One turn, eased: still at either end, her back to us halfway, when the change is put on.
  assert.equal(spinAt(0), 0); assert.ok(Math.abs(spinAt(.5) - Math.PI) < 1e-9); assert.ok(Math.abs(spinAt(1) - 2 * Math.PI) < 1e-9);
  for (let t = 0; t < 1; t += .05) assert.ok(spinAt(t + .05) >= spinAt(t), 'always turning the same way');
  assert.ok(spinAt(.05) < .01 * 2 * Math.PI, 'slow to start');
  assert.ok(TWIRL_MS >= 600 && TWIRL_MS <= 1500);
});

test('an attitude for each look: posed again from her unposed shape, so attitudes never add up, and her head turns whole', () => {
  assert.equal(attitudeOf('bolder'), ATTITUDES.bolder); assert.equal(attitudeOf('idea'), ATTITUDES.pick, 'another idea stands at rest');
  const model = new T.Group(), doll = makeDoll(); model.add(doll);
  const raw = positions(doll);
  pose(doll, model, 0, ATTITUDES.pick); const pick = positions(doll);
  pose(doll, model, 0, ATTITUDES.pick); assert.ok(same(positions(doll), pick), 'posing twice is posing once');
  pose(doll, model, 0, ATTITUDES.bolder); const bolder = positions(doll);
  pose(doll, model, 0, ATTITUDES.easier); const easier = positions(doll);
  assert.ok(!same(pick, raw) && !same(bolder, pick) && !same(easier, pick) && !same(bolder, easier), 'three different stances');
  pose(doll, model, 0, ATTITUDES.pick); assert.ok(same(positions(doll), pick), 'back to her pick exactly');
  // Her face, ears and bob are never bent: the head turns as a whole.
  const head = doll.getObjectByName('doll-head'), headRaw = positions(head);
  pose(doll, model, 0, ATTITUDES.bolder); assert.ok(same(positions(head), headRaw, 1e-9));
  for (const a of Object.values(ATTITUDES)) { const r = headPose(a); assert.ok(Math.abs(r.x) <= .08 && Math.abs(r.y) <= .1 && Math.abs(r.z + .105) <= .08, 'a small turn of the head'); }
  // The bolder look sets her feet apart and pops her hip further than her pick.
  const p = (a, x, y, z) => posePoint(new T.Vector3(x, y, z), null, a);
  assert.ok(p(ATTITUDES.bolder, .17, .2, 0).x > p(ATTITUDES.pick, .17, .2, 0).x, 'her right foot further out');
  assert.ok(p(ATTITUDES.bolder, 0, .85, 0).x > p(ATTITUDES.pick, 0, .85, 0).x, 'her hip further over');
  assert.ok(p(ATTITUDES.easier, 0, .85, 0).x < 0, 'the easier look rests her weight the other way');
});

test('her clothes are posed with her in each attitude, and stay finite', () => {
  const model = new T.Group(), doll = makeDoll(); model.add(doll);
  const outfit = makeOutfit(cleanRecipe({ topId: 'lilac-portrait-mockneck-v1', bottomId: 'levis-ribcage-straight-ankle-jeans-v1', shoesId: 'dr-martens-cow-slide-v1', outerwearId: 'desigual-black-faux-leather-jacket-v1', outerwearOpen: true, knit: false, shirt: false }));
  model.add(outfit); fitDoll(doll, outfit);
  for (const a of Object.values(ATTITUDES)) {
    pose(doll, model, doll.position.y, a); pose(outfit, model, doll.position.y, a);
    for (const part of [...positions(doll), ...positions(outfit)]) for (const v of part) assert.ok(Number.isFinite(v));
  }
  pose(outfit, model, doll.position.y, ATTITUDES.bolder); const bolder = positions(outfit);
  pose(outfit, model, doll.position.y, ATTITUDES.easier); pose(outfit, model, doll.position.y, ATTITUDES.bolder);
  assert.ok(same(positions(outfit), bolder), 'clothes pose from their unposed shape too');
});

test('clothes with instanced parts, the crystals on the jeans and the fur on the bomber, are posed with her too', () => {
  const matrices = root => { const out = []; root.traverse(o => { if (o.isInstancedMesh) out.push([...o.instanceMatrix.array]); }); return out; };
  for (const r of [{ bottomId: 'crystal-straight-jeans-v1' }, { outerwearId: 'woolrich-cream-fur-hood-bomber-v1' }]) {
    const model = new T.Group(), doll = makeDoll(), outfit = makeOutfit(cleanRecipe({ ...r, knit: false, shirt: false })), id = Object.values(r)[0];
    model.add(doll, outfit); fitDoll(doll, outfit);
    const raw = matrices(outfit);
    assert.ok(raw.length, `${id} has instanced parts`);
    pose(outfit, model, doll.position.y, ATTITUDES.bolder); const bolder = matrices(outfit);
    assert.ok(!same(bolder, raw), `${id}: they move with her`);
    for (const m of bolder) for (const v of m) assert.ok(Number.isFinite(v));
    pose(outfit, model, doll.position.y, ATTITUDES.easier); pose(outfit, model, doll.position.y, ATTITUDES.bolder);
    assert.ok(same(matrices(outfit), bolder), `${id}: posed from where they were made`);
  }
});

test('on a windy day her loose hair moves with the wind and is set back exactly when it drops', () => {
  const across = new T.Vector3(1, 0, 0);
  assert.equal(windOffset(0, 1, .2, across).length(), 0, 'still at the root');
  assert.ok(windOffset(1, 1, -.6, across).x > 0, 'the ends lean with the wind');
  // Hair down her back is never pushed into her by a wind from behind; it still sways in a wind from the side.
  const fromBehind = new T.Vector3(0, 0, 1), behind = windOffset(1, 1, -.6, fromBehind, 1, new T.Vector3(), 0, -.35);
  assert.ok(behind.z <= 1e-12, 'not pushed in towards her back');
  assert.ok(Math.abs(windOffset(1, 1, -.6, across, 1, new T.Vector3(), 0, -.35).x) > .01, 'swayed by a wind from the side');
  for (const id of ['high-ponytail', 'low-ponytail', 'straight-v', 'wavy-v', 'half-up', 'side-braid']) {
    const group = makeHair(id), wind = createWind(group), before = positions(group);
    const scalp = group.getObjectByName('styled-scalp'), scalpBefore = [...scalp.geometry.attributes.position.array];
    assert.ok(wind.active, `${id} has loose hair`);
    assert.equal(wind.update(2.5, across, 1), true);
    assert.ok(!same(positions(group), before), `${id} moves`);
    assert.deepEqual([...scalp.geometry.attributes.position.array], scalpBefore, `${id}: the hair on her head stays put`);
    for (const part of positions(group)) for (const v of part) assert.ok(Number.isFinite(v));
    wind.calm(); assert.ok(same(positions(group), before, 1e-12), `${id} set back exactly`);
  }
  for (const id of ['high-bun', 'low-bun']) assert.equal(createWind(makeHair(id)).active, false, `${id}: nothing loose to blow`);
  assert.equal(createWind(null).update(1, across), false, 'the original bob is short');
  // The weather tells her hair: windy days are 30 km/h or more.
  const dom = new JSDOM('<div id="sky"></div>'), el = dom.window.document.getElementById('sky'), heard = [];
  dom.window.document.addEventListener('weather-change', e => heard.push(e.detail));
  paintSky(el, presetConditions('windy'));
  assert.equal(heard.at(-1).windy, true); assert.equal(heard.at(-1).wind, 45); assert.equal(el.dataset.wind, '45');
});

test('the page tells her view the attitude of the look she wears', async () => {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/#today' }), d = dom.window.document, heard = [];
  d.addEventListener('attitude-change', e => heard.push(e.detail.attitude));
  const app = await startStudio(d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: null, geolocation: null, now: () => new Date(2026, 9, 11, 9).getTime() });
  d.getElementById('today-manual').open = true;
  [...d.querySelectorAll('#today-presets button')].find(b => b.textContent === 'Mild').click();
  assert.equal(d.documentElement.dataset.attitude, 'pick', 'her pick: her resting pose');
  d.querySelector('[data-mood=notare]').click();
  d.getElementById('look-bolder').click();
  assert.equal(d.documentElement.dataset.attitude, 'bolder'); assert.equal(heard.at(-1), 'bolder');
  d.querySelector('[data-mood=coccole]').click();
  d.getElementById('look-easier').click();
  assert.equal(d.documentElement.dataset.attitude, 'easier');
  // Dressing her differently by hand is no longer the look: she stands at rest.
  const shoes = d.getElementById('shoes-select'), other = [...shoes.options].find(o => o.value !== shoes.value);
  shoes.value = other.value; shoes.dispatchEvent(new dom.window.Event('change'));
  assert.equal(d.documentElement.dataset.attitude, 'pick');
  app.dispose(); dom.window.close();
});
