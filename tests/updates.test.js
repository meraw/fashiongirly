import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { readFileSync } from 'node:fs';
import { mountUpdates } from '../src/doll/updates.js';
import { startStudio } from '../src/doll/app.js';

const now = Date.UTC(2026, 9, 26, 22, 30);
const versionFile = version => async url => { assert.equal(url, './version.json'); return { ok: true, json: async () => ({ version }) }; };
function page(t) {
  const dom = new JSDOM(readFileSync('index.html', 'utf8'), { url: 'https://example.com/' }), d = dom.window.document;
  t.after(() => dom.window.close());
  return { dom, d, text: () => d.getElementById('version-status').textContent, banner: () => d.getElementById('update-banner') };
}
// A stand-in for the Android app's window.FashiongirlyApp.
function fakeApp(status) {
  const calls = [];
  return { calls, set(next) { Object.assign(status, next); }, status: () => JSON.stringify(status), check() { calls.push('check'); }, showUpdate() { calls.push('show'); } };
}

test('in a browser the page shows its version and no check', async t => {
  const p = page(t), updates = mountUpdates(p.d, { fetch: versionFile(570), now: () => now });
  t.after(() => updates.dispose());
  await updates.ready;
  assert.equal(p.text(), 'Version 570. In a browser, reloading the page brings the newest clothes.');
  assert.equal(p.d.getElementById('version-check').hidden, true);
  assert.equal(p.banner().hidden, true);
});

test('without version.json (a development copy) the version is unknown', async t => {
  const p = page(t), updates = mountUpdates(p.d, { fetch: async () => ({ ok: false }), now: () => now });
  t.after(() => updates.dispose());
  await updates.ready;
  assert.match(p.text(), /^Version unknown\./);
});

test('in the Android app each step of a check is shown, and Check now asks the app to look', async t => {
  const p = page(t), app = fakeApp({ state: 'idle', version: 563, latest: 0, ready: 0, checkedAt: 0 });
  const updates = mountUpdates(p.d, { fetch: versionFile(563), bridge: app, now: () => now });
  t.after(() => updates.dispose());
  await updates.ready;
  assert.equal(p.text(), 'Version 563.');
  const button = p.d.getElementById('version-check');
  assert.equal(button.hidden, false);
  button.click();
  assert.deepEqual(app.calls, ['check']);
  const step = next => { app.set(next); p.dom.window.dispatchEvent(new p.dom.window.Event('app-update')); };
  step({ state: 'checking' });
  assert.equal(p.text(), 'Version 563. Checking for new clothes…'); assert.equal(button.disabled, true);
  step({ state: 'downloading', latest: 570 });
  assert.equal(p.text(), 'Version 563. Version 570 found, downloading…'); assert.equal(button.disabled, true);
  assert.equal(p.banner().hidden, true);
  step({ state: 'current', ready: 570, checkedAt: now - 3 * 60000 });
  assert.equal(p.text(), 'Version 563. Version 570 has arrived: tap Show them at the top. Last checked 3 min ago.');
  assert.equal(button.disabled, false);
  assert.equal(p.banner().hidden, false);
  assert.equal(p.d.getElementById('update-text').textContent, 'New clothes have arrived.');
  p.d.getElementById('update-show').click();
  assert.deepEqual(app.calls, ['check', 'show']);
});

test('an up-to-date app says so; a failed check says why; Not now hides the banner until a newer version', async t => {
  const p = page(t), app = fakeApp({ state: 'current', version: 570, latest: 570, ready: 0, checkedAt: now - 20000 });
  const updates = mountUpdates(p.d, { fetch: versionFile(570), bridge: app, now: () => now });
  t.after(() => updates.dispose());
  await updates.ready;
  assert.equal(p.text(), 'Version 570. Up to date. Last checked just now.');
  const step = next => { app.set(next); p.dom.window.dispatchEvent(new p.dom.window.Event('app-update')); };
  step({ state: 'failed', checkedAt: now - 2 * 3600000 });
  assert.equal(p.text(), 'Version 570. Could not check just now (no connection?). Last checked 2 h ago.');
  step({ state: 'current', ready: 571 });
  assert.equal(p.banner().hidden, false);
  p.d.getElementById('update-later').click();
  assert.equal(p.banner().hidden, true);
  step({ state: 'current' });
  assert.equal(p.banner().hidden, true, 'the same version stays dismissed');
  step({ ready: 572 });
  assert.equal(p.banner().hidden, false, 'a newer one is announced again');
});

test('a broken answer from the app still shows the page’s own version', async t => {
  const p = page(t), updates = mountUpdates(p.d, { fetch: versionFile(570), bridge: { status: () => 'nonsense', check() { throw Error(); }, showUpdate() {} }, now: () => now });
  t.after(() => updates.dispose());
  await updates.ready;
  assert.equal(p.text(), 'Version 570.');
  p.d.getElementById('version-check').click();
  assert.equal(p.banner().hidden, true);
});

test('the studio mounts the version on the Wardrobe page with the app it is given', async t => {
  const p = page(t), app = fakeApp({ state: 'current', version: 570, latest: 570, ready: 0, checkedAt: now });
  const studio = await startStudio(p.d, () => ({ update() {}, turn() {}, dispose() {} }), { fetch: versionFile(570), geolocation: null, now: () => now, appBridge: app });
  t.after(() => studio.dispose());
  await studio.updates.ready;
  assert.ok(p.d.querySelector('#page-wardrobe #version-status'));
  assert.equal(p.text(), 'Version 570. Up to date. Last checked just now.');
});
