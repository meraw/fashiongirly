// Render her in the real app for review: the same outfit, world, hour and framing every time, so a change can be judged
// before and after. It opens index.html (the shipped renderer, nothing changed for it) in headless Chromium with a
// pinned outfit and no forecast, and saves views of her:
//   phone     the whole screen of a 390 x 844 phone at three to one, as she is seen in the app
//   face      head and shoulders          body   her whole figure, from the front
//   side      her whole figure, turned     sideface  head and shoulders, turned     back   from behind
// The close views enlarge the part of the page that is hers (#frame), which the view frames her in, so the same camera,
// lens and light draw more pixels over her. The studio views show her head alone in neutral light, to judge its making
// before the world's coloured light is laid over it: the app's renderer settings and lights (key, fill, rim, sky and
// ground, reflections) in white and greys, against a grey backdrop.
//   studio-front, studio-three (three-quarter), studio-side, studio-back, studio-top (from above and behind),
//   studio-eyes (her face, closer)
// Needs Playwright with Chromium (npm i --no-save playwright, or a global install) and the dev server (npm run dev).
//   node scripts/render-doll.mjs <out-prefix> [views=phone,face,body,side] [base=http://localhost:5173]
// The outfit is the RECIPE environment variable (a recipe as JSON; default: the Rose sweatshirt study); WORLD and AT pick
// the world and the hour (default apricot-mountains at 11:00).
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

async function playwright() {
  try { return await import('playwright'); }
  catch {
    try { return await import(pathToFileURL(join(execSync('npm root -g').toString().trim(), 'playwright', 'index.mjs')).href); }
    catch { console.error('Playwright is needed: npm i --no-save playwright (Chromium comes with it).'); process.exit(1); }
  }
}
const [out, views = 'phone,face,body,side', base = 'http://localhost:5173'] = process.argv.slice(2);
if (!out) { console.error('usage: node scripts/render-doll.mjs <out-prefix> [views] [base]'); process.exit(1); }
const ROSE = { topId: 'replay-cream-rose-embroidered-sweatshirt-v1', bottomId: 'mango-washed-black-v1', shoesId: 'classic', knit: false, shirt: false };
const recipe = process.env.RECIPE ? JSON.parse(process.env.RECIPE) : ROSE;
const url = `${base}/index.html?world=${process.env.WORLD || 'apricot-mountains'}&at=${process.env.AT || '11:00'}`;
const { chromium } = await playwright();
const browser = await chromium.launch({ args: ['--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'] });

async function open(viewport, dpr) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: dpr, reducedMotion: 'reduce', locale: 'en-GB' });
  // No forecast and no location: she wears the recipe, in the world's light at the hour.
  await context.route(/^https?:\/\/[^/]*open-meteo\.com\//, r => r.abort());
  await context.addInitScript(r => localStorage.setItem('fashiongirly.plush-draft.v1', JSON.stringify(r)), recipe);
  const page = await context.newPage();
  page.on('pageerror', e => console.error('[page]', e.message));
  await page.goto(url);
  await page.waitForFunction(() => document.querySelector('#stage canvas') && !document.getElementById('loading'), null, { timeout: 120000 });
  return { context, page };
}
const settle = page => page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(r, 300)))));
// She is turned by dragging, as a person turns her, from the app's starting angle.
async function turn(page, degrees, viewport) {
  const dx = degrees * Math.PI / 180 / .012, y = viewport.height / 2, x0 = viewport.width / 2 - dx / 2;
  await page.mouse.move(x0, y); await page.mouse.down(); await page.waitForTimeout(700);
  for (let i = 1; i <= 10; i++) await page.mouse.move(x0 + dx * i / 10, y);
  await page.mouse.up();
}
// The phone's frame (index.html's phone layout: the top 58% of the screen, under the 54 px header), enlarged k times;
// (cx, cy) is the point of it put in the middle of the picture.
const FRAME = { w: 390, h: .58 * 844 - 54 };
const CLOSE = {
  face: { k: 2.75, cx: 195, cy: 158, viewport: { width: 640, height: 640 }, turn: 0 },
  sideface: { k: 2.75, cx: 195, cy: 158, viewport: { width: 640, height: 640 }, turn: -45 },
  body: { k: 2, cx: 195, cy: FRAME.h / 2, viewport: { width: 780, height: 871 }, turn: 0 },
  side: { k: 2, cx: 195, cy: FRAME.h / 2, viewport: { width: 780, height: 871 }, turn: -45 },
  back: { k: 2, cx: 195, cy: FRAME.h / 2, viewport: { width: 780, height: 871 }, turn: 205 },
};
// The studio: her head (the doll's own, from makeDoll) on its own, lit as the app lights her but in neutral colours.
const STUDIO = { 'studio-front': [0, 3.6], 'studio-three': [-45, 3.6], 'studio-side': [-80, 3.6], 'studio-back': [200, 3.6], 'studio-top': [160, 2.6, 2.6], 'studio-eyes': [0, 2.1] };
const studioPage = `<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;overflow:hidden}</style>
<script type="importmap">{"imports":{"three":"./node_modules/three/build/three.module.js"}}</script></head><body><script type="module">
import * as T from 'three';
import { makeDoll } from './src/doll/model.js';
const q = new URLSearchParams(location.search), turn = +q.get('turn'), dist = +q.get('dist'), lift = +q.get('lift'), w = innerWidth, h = innerHeight;
const r = new T.WebGLRenderer({ antialias: true }); r.setPixelRatio(devicePixelRatio); r.setSize(w, h); document.body.append(r.domElement);
r.outputColorSpace = T.SRGBColorSpace; r.toneMapping = T.ACESFilmicToneMapping; r.toneMappingExposure = 1.2; r.shadowMap.enabled = true; r.shadowMap.type = T.PCFSoftShadowMap;
const scene = new T.Scene(); scene.background = new T.Color('#a7a7a7');
// light.js's lights at their daytime strengths, in white and greys.
const key = new T.DirectionalLight('#ffffff', 2.8), fill = new T.DirectionalLight('#ffffff', 1.1), rim = new T.DirectionalLight('#ffffff', 1.2), hemi = new T.HemisphereLight('#e4e4e4', '#9c9c9c', 1.5);
key.position.set(2.6, 3.4, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: .1, far: 12 }); key.shadow.normalBias = .006; key.shadow.bias = -.0004; key.shadow.intensity = .75;
fill.position.set(-3.2, 1.6, 2.4); rim.position.set(-1.2, 2.6, -3); scene.add(key, fill, rim, hemi);
// Reflections: a grey room, lighter above, with a white softbox where the key is.
const room = new T.Scene(), sphere = new T.SphereGeometry(50, 48, 32), p = sphere.attributes.position, colours = [];
for (let i = 0; i < p.count; i++) { const y = p.getY(i) / 50, g = y > 0 ? .62 + .2 * y : .62 + .3 * y; colours.push(g, g, g); }
sphere.setAttribute('color', new T.Float32BufferAttribute(colours, 3)); room.add(new T.Mesh(sphere, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, toneMapped: false })));
const box = new T.Mesh(new T.SphereGeometry(3.2, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(6, 6, 6), toneMapped: false })); box.position.set(30, 30, 24); room.add(box);
const pmrem = new T.PMREMGenerator(r); scene.environment = pmrem.fromScene(room, .035).texture; scene.environmentIntensity = .55;
const model = new T.Group(), doll = makeDoll(); model.add(doll); scene.add(model); model.rotation.y = -.12 + turn * Math.PI / 180;
const head = doll.getObjectByName('doll-head'), inHead = o => { for (let a = o; a; a = a.parent) if (a === head) return true; return false; };
doll.traverse(o => { if (o.isMesh && !inHead(o)) o.visible = false; });
model.updateMatrixWorld(true); const c = head.localToWorld(new T.Vector3(0, .02, 0));
const cam = new T.PerspectiveCamera(20, w / h, .1, 40); cam.position.set(c.x, c.y + lift, c.z + dist); cam.lookAt(c);
r.render(scene, cam); document.title = 'ready';
</script></body></html>`;
for (const view of views.split(',')) {
  if (STUDIO[view]) {
    const [deg, dist, lift = 0] = STUDIO[view], context = await browser.newContext({ viewport: { width: 700, height: 700 }, deviceScaleFactor: 2 }), page = await context.newPage();
    page.on('pageerror', e => console.error('[page]', e.message));
    await page.route('**/__studio.html*', r => r.fulfill({ contentType: 'text/html', body: studioPage }));
    await page.goto(`${base}/__studio.html?turn=${deg}&dist=${dist}&lift=${lift}`);
    await page.waitForFunction(() => document.title === 'ready', null, { timeout: 120000 });
    await page.screenshot({ path: `${out}-${view}.png`, timeout: 180000 }); await context.close();
  } else if (view === 'phone') {
    const { context, page } = await open({ width: 390, height: 844 }, 3);
    await settle(page); await page.screenshot({ path: `${out}-phone.png`, timeout: 180000 }); await context.close();
  } else if (CLOSE[view]) {
    const c = CLOSE[view], { context, page } = await open(c.viewport, 2);
    await page.addStyleTag({ content: `.sheet,.topbar,.foreground,.tabs,#drag-hint,.tuck-key{display:none!important}
      #frame{position:fixed!important;left:${c.viewport.width / 2 - c.cx * c.k}px!important;top:${c.viewport.height / 2 - c.cy * c.k}px!important;width:${FRAME.w * c.k}px!important;height:${FRAME.h * c.k}px!important;right:auto!important;bottom:auto!important}` });
    await settle(page); if (c.turn) await turn(page, c.turn, c.viewport); await settle(page);
    await page.screenshot({ path: `${out}-${view}.png`, timeout: 180000 }); await context.close();
  } else console.error(`unknown view: ${view}`);
  console.log(`${out}-${view}.png`);
}
await browser.close();
