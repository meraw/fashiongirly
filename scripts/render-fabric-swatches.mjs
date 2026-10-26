// Run from the repository root, with npm run dev running:
// node scripts/render-fabric-swatches.mjs [http://127.0.0.1:5173/]
// Needs Playwright (or PLAYWRIGHT_MODULE pointing to its index.mjs). CHROMIUM_PATH is optional.
// Samples use existing garment materials and UVs. Printed fabrics use unlit colour;
// shaded surfaces use neutral white light to reveal their existing grain and finish.
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
  { id: 'desigual-crochet-flowers-v1', mesh: 'crochet-body', y: 1.55, cutouts: true },
  { id: 'cream-pointelle-flower-jumper-v1', mesh: 'pointelle-body', y: 1.55, cutouts: true, details: ['embroidered-flower'] },
  { id: 'desigual-silver-cable-jumper-v1', mesh: 'silver-cable-body', y: 1.62 },
  { id: 'tommy-green-cable-sweater-v1', mesh: 'cable-knit-body', y: 1.55 },
  { id: 'pull-bear-grey-chenille-high-neck-v1', mesh: 'chenille-body', y: 1.6 },
  { id: 'striped-waffle-snap-collar-jumper-v1', mesh: 'waffle-knit-body', y: 1.55 },
  { id: 'lapis-blue-linen-button-down-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'white-linen-button-down-shirt-v1', mesh: 'mesh-shirt-body', y: 1.55 },
  { id: 'paisley-print-relaxed-shirt-v1', mesh: 'mesh-shirt-body', atlas: ['paisley-shirt-atlas.js', 'PAISLEY_SHIRT_ATLAS'], y: 1.55, side: 'back' },
  { id: 'polo-ralph-lauren-usrl-racing-hoodie-v1', mesh: 'hoodie-body', y: 1.65, details: ['applique-letters', 'embroidered-signature', 'round-badge', 'eagle-patch', 'flag-patch'] },
  { id: 'champion-purple-tie-dye-velour-hoodie-v1', mesh: 'hoodie-body', y: 1.6 },
  { id: 'tommy-ultra-high-mom-v1', mesh: 'jeans-hips', atlas: ['tommy-mom-denim.js', 'TOMMY_MOM_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'stradivarius-relaxed-v1', mesh: 'jeans-hips', atlas: ['stradivarius-denim.js', 'STRADIVARIUS_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'bershka-grey-wide-leg-v1', mesh: 'jeans-hips', atlas: ['bershka-grey-denim.js', 'BERSHKA_GREY_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'tommy-remastered-carpenter-v1', mesh: 'jeans-hips', atlas: ['tommy-carpenter-denim.js', 'TOMMY_CARPENTER_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'zara-cargo-joggers-v1', mesh: 'jeans-hips', atlas: ['zara-cargo-fabric.js', 'ZARA_CARGO_FABRIC'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'topshop-washed-black-wide-crop-v1', mesh: 'jeans-hips', atlas: ['topshop-black-crop-denim.js', 'TOPSHOP_BLACK_CROP_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'pleated-linen-wide-trousers-v1', mesh: 'jeans-hips', atlas: ['pleated-linen-fabric.js', 'PLEATED_LINEN_FABRIC'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'bershka-low-rise-balloon-jeans-v1', mesh: 'jeans-hips', atlas: ['bershka-balloon-denim.js', 'BERSHKA_BALLOON_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'mango-claudia-slim-crop-jeans-v1', mesh: 'jeans-hips', atlas: ['mango-claudia-denim.js', 'MANGO_CLAUDIA_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'mango-sienna-flare-crop-jeans-v1', mesh: 'jeans-hips', atlas: ['mango-sienna-denim.js', 'MANGO_SIENNA_DENIM'], y: 1.08, x: 0.12, width: 0.22 },
  { id: 'adidas-originals-cropped-hoodie-black-v1', mesh: 'hoodie-body', y: 1.65, shaded: true, details: ['embroidered-logo', 'woven-patch'] },
  { id: 'desigual-navy-rugby-tiger-patches-v1', mesh: 'mesh-shirt-body', y: 1.65, details: ['applique-patch', 'contrast-placket'] },
  { id: 'black-yoke-henley-blouse-v1', mesh: 'blouse-body', y: 1.7, shaded: true, details: ['yoke-seam', 'blouse-placket', 'blouse-button'] },
  { id: 'crystal-straight-jeans-v1', mesh: 'jeans-leg', y: 0.65, atlas: ['crystal-jeans-denim.js', 'CRYSTAL_JEANS_DENIM'], x: -0.16, width: 0.22, shaded: true, details: ['crystal-grid', 'crystal-settings'] },
  { id: 'nike-piped-track-pants-v1', mesh: 'jeans-hips', y: 1.1, atlas: ['nike-track-fabric.js', 'NIKE_TRACK_FABRIC'], width: 0.45, details: ['piping', 'embroidered-tick'] },
  { id: 'laced-flame-print-mini-skirt-v1', mesh: 'mini-skirt-body', y: 1.06, atlas: ['laced-flame-skirt-atlas.js', 'LACED_FLAME_SKIRT_ATLAS'], width: 0.44 },
  { id: 'buffalo-aspha-mid-olive-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'dr-martens-cow-slide-v1', mesh: 'cow-strap', y: 0, plane: true, shaded: false },
  { id: 'ugg-lowmel-cream-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'dr-martens-blaire-quad-chain-v1', mesh: 'patent-strap', y: 0, plane: true, shaded: true },
  { id: 'sam-edelman-front-zip-lug-boot-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'adidas-superstar-pink-suede-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'converse-modern-lift-hi-egret-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'new-balance-550-cream-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'adidas-gazelle-bold-cream-green-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'adidas-campus-00s-grey-v1', mesh: 'boot-upper', y: 0, plane: true, shaded: true },
  { id: 'marikoo-two-tone-windbreaker-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'desigual-black-faux-leather-jacket-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'red-bull-racing-stone-windbreaker-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'emerald-dyed-sherpa-hood-parka-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'bomboogie-pink-faux-fur-jacket-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'woolrich-cream-fur-hood-bomber-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'adidas-cream-cropped-windbreaker-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'only-carmakoma-taupe-wool-coat-v1', mesh: 'jacket-body', y: 1.55, shaded: true, side: 'back' },
  { id: 'bomboogie-black-teddy-hood-jacket-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'bomboogie-green-teddy-hood-jacket-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'levis-colourblock-half-zip-anorak-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'only-onlerin-dark-silver-jacket-v1', mesh: 'jacket-body', y: 1.55, shaded: true },
  { id: 'navy-half-zip-track-dress-v1', mesh: 'dress-body', y: 1.55 },
  { id: 'desigual-ivory-lace-shift-dress-v1', mesh: 'dress-body', y: 1.55, cutouts: true, details: ['lace-frill'] },
  // Plain satin: lit, so its lustre shows.
  { id: 'black-satin-oversized-shirt-v1', mesh: 'mesh-shirt-body', y: 1.45, shaded: true },
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
    const pmrem = new T.PMREMGenerator(renderer);
    const environmentScene = new T.Scene(); environmentScene.background = new T.Color('#c0c0c0');
    const environmentTarget = pmrem.fromScene(environmentScene);
    const neutralEnvironment = environmentTarget.texture;
    const results = [];
    for (const sample of samples) {
      const textures = {};
      if (sample.atlas) {
        const [path, name] = sample.atlas, data = (await import(new URL('src/wardrobe/' + path, base).href))[name];
        const map = await new T.TextureLoader().loadAsync(data); map.colorSpace = T.SRGBColorSpace; textures[sample.id] = map;
      }
      const slot = GARMENTS[sample.id]?.slot;
      if (!['top', 'bottom', 'shoes', 'outerwear', 'dress'].includes(slot)) throw new Error(`Unsupported swatch slot for ${sample.id}`);
      const outfit = makeOutfit(cleanRecipe({ [slot + 'Id']: sample.id, knit: false, shirt: false }), textures);
      const source = outfit.getObjectByName(sample.mesh);
      if (!source) throw new Error(`No ${sample.mesh} for ${sample.id}`);
      const materials = (Array.isArray(source.material) ? source.material : [source.material]).map(m => {
        if (!m.map && !sample.shaded) throw new Error(`No colour texture for ${sample.id}`);
        if (sample.shaded) { const mat = m.clone(); mat.onBeforeCompile = m.onBeforeCompile; mat.customProgramCacheKey = m.customProgramCacheKey; return mat; }
        return new T.MeshBasicMaterial({ color: m.color.clone(), map: m.map, vertexColors: m.vertexColors, alphaTest: sample.cutouts ? m.alphaTest : 0, side: T.FrontSide });
      });
      const width = sample.width ?? .46, height = width * 160 / 384;
      const geometry = sample.plane ? new T.PlaneGeometry(width, height).translate(sample.x ?? 0, sample.y, 0) : source.geometry.clone();
      const patch = new T.Mesh(geometry, Array.isArray(source.material) ? materials : materials[0]);
      const scene = new T.Scene(); scene.background = new T.Color('#fffdf9'); scene.add(patch);
      if (sample.shaded) {
        scene.add(new T.HemisphereLight(0xffffff, 0xffffff, 1.8));
        const light = new T.DirectionalLight(0xffffff, 2.2); light.position.set(-2, 3, 4); scene.add(light);
        // A neutral environment keeps metallic finishes visible without tinting the fabric.
        scene.environment = neutralEnvironment;
      }
      // Sample sewn-on details from their existing meshes too (e.g. the pointelle's flowers).
      const detailGeometries = [];
      if (sample.details?.length) {
        outfit.updateMatrixWorld(true);
        const toSource = source.matrixWorld.clone().invert();
        const found = new Set();
        outfit.traverse(group => {
          if (!sample.details.includes(group.name)) return;
          found.add(group.name);
          group.traverse(mesh => {
            if (!mesh.isMesh) return;
            const geometry = mesh.geometry.clone().applyMatrix4(toSource.clone().multiply(mesh.matrixWorld));
            const flat = m => { const mat = sample.shaded ? m.clone() : new T.MeshBasicMaterial({ color: m.color.clone(), map: m.map, vertexColors: m.vertexColors, alphaTest: m.alphaTest, side: T.DoubleSide }); materials.push(mat); return mat; };
            const detailMaterial = Array.isArray(mesh.material) ? mesh.material.map(flat) : flat(mesh.material);
            if (mesh.isInstancedMesh) {
              // Preserve every crystal's placement, rather than sampling one uninstanced setting.
              geometry.copy(mesh.geometry);
              const detail = new T.InstancedMesh(geometry, detailMaterial, mesh.count);
              detail.instanceMatrix.copy(mesh.instanceMatrix);
              detail.matrixAutoUpdate = false; detail.matrix.copy(toSource.clone().multiply(mesh.matrixWorld));
              scene.add(detail);
            } else scene.add(new T.Mesh(geometry, detailMaterial));
            detailGeometries.push(geometry);
          });
        });
        for (const name of sample.details) if (!found.has(name)) throw new Error(`No ${name} detail for ${sample.id}`);
      }
      const camera = new T.OrthographicCamera(-width / 2, width / 2, sample.y + height / 2, sample.y - height / 2, .01, 10);
      camera.position.set(sample.x ?? 0, 0, sample.side === 'back' ? -4 : 4); camera.lookAt(sample.x ?? 0, 0, 0);
      renderer.render(scene, camera);
      results.push({ id: sample.id, data: renderer.domElement.toDataURL('image/webp', .96).split(',')[1] });
      patch.geometry.dispose(); detailGeometries.forEach(g => g.dispose()); materials.forEach(m => m.dispose()); disposeObject(outfit);
      Object.values(textures).forEach(t => t.dispose());
    }
    environmentTarget.dispose(); pmrem.dispose(); renderer.dispose();
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
