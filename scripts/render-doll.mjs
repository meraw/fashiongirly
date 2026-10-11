// Render her in the real app for review: the same outfit, world, hour and framing every time, so a change can be judged
// before and after. It opens index.html (the shipped renderer, nothing changed for it) in headless Chromium with a
// pinned outfit and no forecast, and saves views of her:
//   phone     the whole screen of a 390 x 844 phone at three to one, as she is seen in the app
//   face      head and shoulders          body   her whole figure, from the front
//   side      her whole figure, turned     sideface  head and shoulders, turned     back   from behind
// The close views enlarge the part of the page that is hers (#frame), which the view frames her in, so the same camera,
// lens and light draw more pixels over her. Needs Playwright with Chromium (npm i --no-save playwright, or a global
// install) and the dev server (npm run dev).
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
for (const view of views.split(',')) {
  if (view === 'phone') {
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
