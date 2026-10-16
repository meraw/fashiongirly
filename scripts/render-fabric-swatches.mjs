// Run from the repository root, with npm run dev running:
// node scripts/render-fabric-swatches.mjs [http://127.0.0.1:5173/]
// Needs Playwright (or PLAYWRIGHT_MODULE pointing to its index.mjs). CHROMIUM_PATH is optional.
// These are rectangular samples of existing garment materials and UVs in neutral, unlit colour:
// no guessed palette, procedural substitute, fake sheen, or change to the garments themselves.
import { mkdir, writeFile } from 'node:fs/promises';
import { FABRIC_SWATCHES } from '../src/wardrobe/fabric-swatches.js';

export const SAMPLES = [
  { id: 'desigual-bronze-mesh-v1', mesh: 'reference-top-body', atlas: ['bronze-atlas.js', 'BRONZE_ATLAS'], y: 1.64, width: .32 },
  { id: 'lilac-portrait-mockneck-v1', mesh: 'reference-top-body', atlas: ['lilac-atlas.js', 'LILAC_ATLAS'], y: 1.77, width: .38 },
  // The back's continuous mountain print avoids the photographed front placket and buttons.
  { id: 'desigual-mountain-landscape-mesh-shirt-v1', mesh: 'mesh-shirt-body', atlas: ['mountain-shirt-atlas.js', 'MOUNTAIN_SHIRT_ATLAS'], y: 1.63, width: .38, x: -.06, side: 'back' },
  { id: 'levis-oversized-plaid-flannel-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'replay-cream-rose-embroidered-sweatshirt-v1', mesh: 'sweatshirt-body', y: 1.54 },
  { id: 'motel-tie-dye-mesh-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'desigual-spray-floral-mesh-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'desigual-split-floral-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'mango-halftone-dot-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'pink-ditsy-floral-yoke-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'cream-ditsy-rose-fitted-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'levis-wildflower-print-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'pepe-jeans-ikat-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'levis-lilac-gingham-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'tommy-jeans-red-varsity-crest-jumper-v1', mesh: 'sweatshirt-body', y: 1.66 },
  { id: 'van-gogh-patchwork-tee-v1', mesh: 'printed-tee-body', atlas: ['vangogh-tee-atlas.js', 'VANGOGH_TEE_ATLAS'], y: 1.55 },
  { id: 'desigual-fresco-rib-vneck-tee-v1', mesh: 'printed-tee-body', atlas: ['fresco-tee-atlas.js', 'FRESCO_TEE_ATLAS'], y: 1.55 },
  { id: 'black-mickey-print-long-tee-v1', mesh: 'printed-tee-body', y: 1.55 },
  { id: 'desigual-painted-floral-knit-jumper-v1', mesh: 'printed-tee-body', y: 1.55 },
  { id: 'desigual-hawaii-patch-stripe-tee-v1', mesh: 'printed-tee-body', y: 1.58 },
  { id: 'desigual-garden-print-mesh-tee-v1', mesh: 'mesh-tee-body', atlas: ['garden-mesh-tee-atlas.js', 'GARDEN_MESH_TEE_ATLAS'], y: 1.55 },
  { id: 'desigual-painterly-patchwork-vneck-tee-v1', mesh: 'printed-tee-body', atlas: ['painterly-tee-atlas.js', 'DESIGUAL_PAINTERLY_TEE_ATLAS'], y: 1.55 },
  { id: 'laced-flame-print-mockneck-top-v1', mesh: 'laced-top-body', atlas: ['laced-flame-top-atlas.js', 'LACED_FLAME_TOP_ATLAS'], y: 1.55 },
  { id: 'levis-floral-batwing-sweatshirt-v1', mesh: 'sweatshirt-body', y: 1.65 },
  { id: 'desigual-life-is-awesome-jumper-v1', mesh: 'sweatshirt-body', y: 1.65 },
  { id: 'mango-plaid-jumper-v1', mesh: 'plaid-jumper-body', y: 1.55 },
  { id: 'bershka-asymmetric-stripe-jumper-v1', mesh: 'stripe-jumper-body', y: 1.55 },
  { id: 'desigual-lacroix-flower-sweater-v1', mesh: 'lacroix-body', y: 1.55 },
  { id: 'tommy-stripe-knit-polo-v1', mesh: 'polo-knit-body', y: 1.55 },
  { id: 'petit-bateau-striped-cardigan-v1', mesh: 'cardigan-body', y: 1.27 },
  { id: 'topshop-barrel-jeans-v1', mesh: 'jeans-hips', atlas: ['topshop-denim.js', 'TOPSHOP_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'desigual-davinia-jeans-v1', mesh: 'jeans-hips', atlas: ['desigual-davinia-denim.js', 'DAVINIA_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'levis-94-wide-leg-v1', mesh: 'jeans-hips', atlas: ['levis-94-denim.js', 'LEVIS_94_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'mango-washed-black-v1', mesh: 'jeans-hips', atlas: ['mango-denim.js', 'MANGO_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'levis-ribcage-straight-ankle-jeans-v1', mesh: 'jeans-hips', atlas: ['levis-ribcage-denim.js', 'LEVIS_RIBCAGE_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
];

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = new URL(process.argv[2] || 'http://127.0.0.1:5173/');
const browser = await chromium.launch({
  ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
  args: ['--no-sandbox', '--ignore-gpu-blocklist', '--enable-unsafe-swiftshader'],
});
try {
  const page = await browser.newPage();
  await page.route('**/__fabric_swatches__', r => r.fulfill({ contentType: 'text/html', body: `<!doctype html><script type="importmap">{"imports":{"three":"${new URL('node_modules/three/build/three.module.js', base)}"}}</script>` }));
  await page.goto(new URL('__fabric_swatches__', base).href);
  const results = await page.evaluate(async ({ samples, base }) => {
    const T = await import(new URL('node_modules/three/build/three.module.js', base).href);
    const { makeOutfit, disposeObject } = await import(new URL('src/doll/model.js', base).href);
    const { cleanRecipe } = await import(new URL('src/doll/recipe.js', base).href);
    const { GARMENTS } = await import(new URL('src/wardrobe/catalog.js', base).href);
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(384, 160); renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.NoToneMapping;
    const results = [];
    for (const sample of samples) {
      const textures = {};
      if (sample.atlas) {
        const [path, name] = sample.atlas, data = (await import(new URL('src/wardrobe/' + path, base).href))[name];
        const map = await new T.TextureLoader().loadAsync(data); map.colorSpace = T.SRGBColorSpace; textures[sample.id] = map;
      }
      const slot = GARMENTS[sample.id]?.slot;
      if (!['top', 'bottom'].includes(slot)) throw new Error(`Unsupported swatch slot for ${sample.id}`);
      const outfit = makeOutfit(cleanRecipe({ [slot + 'Id']: sample.id, knit: false, shirt: false }), textures);
      const source = outfit.getObjectByName(sample.mesh);
      if (!source) throw new Error(`No ${sample.mesh} for ${sample.id}`);
      const materials = (Array.isArray(source.material) ? source.material : [source.material]).map(m => {
        if (!m.map) throw new Error(`No colour texture for ${sample.id}`);
        return new T.MeshBasicMaterial({ color: m.color.clone(), map: m.map, vertexColors: m.vertexColors, side: T.FrontSide });
      });
      const patch = new T.Mesh(source.geometry.clone(), Array.isArray(source.material) ? materials : materials[0]);
      const scene = new T.Scene(); scene.background = new T.Color('#fffdf9'); scene.add(patch);
      const width = sample.width ?? .46, height = width * 160 / 384;
      const camera = new T.OrthographicCamera(-width / 2, width / 2, sample.y + height / 2, sample.y - height / 2, .01, 10);
      camera.position.set(sample.x ?? 0, 0, sample.side === 'back' ? -4 : 4); camera.lookAt(sample.x ?? 0, 0, 0);
      renderer.render(scene, camera);
      results.push({ id: sample.id, data: renderer.domElement.toDataURL('image/webp', .96).split(',')[1] });
      patch.geometry.dispose(); materials.forEach(m => m.dispose()); disposeObject(outfit);
      Object.values(textures).forEach(t => t.dispose());
    }
    renderer.dispose();
    return results;
  }, { samples: SAMPLES, base: base.href });
  for (const result of results) {
    const url = new URL(FABRIC_SWATCHES[result.id]);
    await mkdir(new URL('./', url), { recursive: true });
    const bytes = Buffer.from(result.data, 'base64');
    await writeFile(url, bytes);
    console.log(`${result.id}: ${bytes.length} bytes`);
  }
} finally { await browser.close(); }
