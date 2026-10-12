// Her fabric: she is a plush doll (the user's direction, 11 October 2026), sewn from a fine, short-nap fabric. Seen
// from a little way off the nap is not grain but a soft sheen that brightens where her surfaces turn away; up close it
// is a fine combed pile. So the nap is a normal map of short fibres combed one way, drawn once, tiled, and filtered with
// mipmaps: at phone size its fibres average away to a smooth surface instead of sparkling into noise (an unfiltered
// noise map, minified, reads as speckle), and close up they show.
import * as T from 'three';

// A repeating height field of short fibres lying along v: white noise smeared along the pile and barely across it.
// `along` and `across` are the fibres' length and width in pixels.
const heights = new Map();
export function napHeight(size = 256, along = 9, across = 1.2, seed = 7) {
  const key = `${size}|${along}|${across}|${seed}`;
  if (heights.has(key)) return heights.get(key);
  let s = seed >>> 0; const rand = () => { s = (1664525 * s + 1013904223) >>> 0; return s / 4294967296; };
  let a = new Float32Array(size * size), b = new Float32Array(size * size);
  for (let i = 0; i < a.length; i++) a[i] = rand() - .5;
  // Separable Gaussian blur that wraps, along the pile (v, rows) and across it (u, columns).
  const blur = (src, dst, sigma, horizontal) => {
    const r = Math.ceil(sigma * 2.5), w = []; let sum = 0;
    for (let k = -r; k <= r; k++) { const v = Math.exp(-k * k / (2 * sigma * sigma)); w.push(v); sum += v; }
    for (let k = 0; k < w.length; k++) w[k] /= sum;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      let v = 0;
      for (let k = -r; k <= r; k++) v += w[k + r] * (horizontal ? src[y * size + (x + k + size) % size] : src[((y + k + size) % size) * size + x]);
      dst[y * size + x] = v;
    }
  };
  blur(a, b, along / 2.5, false); blur(b, a, across, true);
  let mean = 0, sq = 0; for (const v of a) mean += v; mean /= a.length; for (const v of a) sq += (v - mean) ** 2;
  const sd = Math.sqrt(sq / a.length) || 1; for (let i = 0; i < a.length; i++) a[i] = Math.max(-3, Math.min(3, (a[i] - mean) / sd)) / 3;
  heights.set(key, a);
  return a;
}

// A texture that holds detail finer than a pixel at phone size: mipmapped, so it averages smoothly as it shrinks, and
// filtered at a slant, so a surface turning away stays sharp instead of smearing.
export function filtered(texture, anisotropy = 8) {
  texture.magFilter = T.LinearFilter; texture.minFilter = T.LinearMipmapLinearFilter; texture.generateMipmaps = true;
  texture.anisotropy = anisotropy; texture.needsUpdate = true;
  return texture;
}

// The nap as a tangent-space normal map (green along +v, as three.js reads it), from the height field above.
const napNormals = new Map();
export function napNormalTexture({ size = 256, along = 9, across = 1.2, seed = 7, strength = 2.2 } = {}) {
  const key = `${size}|${along}|${across}|${seed}|${strength}`;
  if (!napNormals.has(key)) {
    const h = napHeight(size, along, across, seed), data = new Uint8Array(size * size * 4);
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (h[y * size + (x + 1) % size] - h[y * size + (x + size - 1) % size]) / 2 * strength;
      const dy = (h[((y + 1) % size) * size + x] - h[((y + size - 1) % size) * size + x]) / 2 * strength;
      const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
      data[i] = Math.round((-dx / l * .5 + .5) * 255); data[i + 1] = Math.round((-dy / l * .5 + .5) * 255); data[i + 2] = Math.round((1 / l * .5 + .5) * 255); data[i + 3] = 255;
    }
    napNormals.set(key, data);
  }
  const t = new T.DataTexture(napNormals.get(key), size, size, T.RGBAFormat);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  return filtered(t);
}

// Her pile seen as a whole rather than as fibres: a soft, even unevenness about a millimetre across at her size (her
// head is about nine centimetres wide), where the short pile clumps and leans, with a finer, fainter unevenness within
// it. `blob` is the unevenness's size in pixels of the tile. Heights in [-1, 1].
const piles = new Map();
export function pileHeight({ size = 256, blob = 9, seed = 3 } = {}) {
  const key = `${size}|${blob}|${seed}`;
  if (piles.has(key)) return piles.get(key);
  const coarse = napHeight(size, 2.5 * blob, blob, seed), fine = napHeight(size, 2.5 * blob * .3, blob * .3, seed + 17), h = new Float32Array(size * size);
  let lo = Infinity, hi = -Infinity;
  for (let i = 0; i < h.length; i++) { h[i] = coarse[i] + .3 * fine[i]; lo = Math.min(lo, h[i]); hi = Math.max(hi, h[i]); }
  for (let i = 0; i < h.length; i++) h[i] = (h[i] - lo) / (hi - lo) * 2 - 1;
  piles.set(key, h);
  return h;
}
// The pile as a tangent-space normal map, encoded strongly for precision; the material's normalScale brings it down.
const pileNormals = new Map();
export function pileNormalTexture(options = {}) {
  const { size = 256 } = options, key = JSON.stringify(options);
  if (!pileNormals.has(key)) {
    const h = pileHeight(options), data = new Uint8Array(size * size * 4), k = 9;
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (h[y * size + (x + 1) % size] - h[y * size + (x + size - 1) % size]) / 2 * k, dy = (h[((y + 1) % size) * size + x] - h[((y + size - 1) % size) * size + x]) / 2 * k;
      const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
      data[i] = Math.round((-dx / l * .5 + .5) * 255); data[i + 1] = Math.round((-dy / l * .5 + .5) * 255); data[i + 2] = Math.round((1 / l * .5 + .5) * 255); data[i + 3] = 255;
    }
    pileNormals.set(key, data);
  }
  const t = new T.DataTexture(pileNormals.get(key), size, size, T.RGBAFormat);
  t.wrapS = t.wrapT = T.RepeatWrapping;
  return filtered(t);
}

// The pile laid on by position rather than by uv: sampled straight along each of a piece's own three axes (measured at
// the world's scale, so a scaled sphere gets the same pile as everything else) and blended by which way the surface
// faces. It keeps one size on every piece of any shape, with no stretching or pinch where uvs crowd together (the
// crown of the bob, the tips of a pillow, the poles of a sphere), and stays fixed to the piece as she turns.
export function triplanarPile(material, tilesPerUnit = 1075 / 256) {
  const vary = 'varying vec3 vPilePos;\nvarying vec3 vPileNormal;\nvarying vec3 vPileX;\nvarying vec3 vPileY;\nvarying vec3 vPileZ;';
  material.onBeforeCompile = shader => {
    shader.uniforms.pileTile = { value: tilesPerUnit };
    shader.vertexShader = shader.vertexShader.replace('#include <common>', `#include <common>\n${vary}`).replace('#include <begin_vertex>', `#include <begin_vertex>
      vec3 pileScale = vec3(length(modelMatrix[0].xyz), length(modelMatrix[1].xyz), length(modelMatrix[2].xyz));
      vPilePos = transformed * pileScale; vPileNormal = objectNormal / pileScale;
      vPileX = normalize(mat3(modelViewMatrix) * vec3(1., 0., 0.)); vPileY = normalize(mat3(modelViewMatrix) * vec3(0., 1., 0.)); vPileZ = normalize(mat3(modelViewMatrix) * vec3(0., 0., 1.));`);
    shader.fragmentShader = shader.fragmentShader.replace('#include <common>', `#include <common>\nuniform float pileTile;\n${vary}`).replace('#include <normal_fragment_maps>', `{
      vec3 w = pow(abs(normalize(vPileNormal)), vec3(4.)); w /= w.x + w.y + w.z;
      vec2 px = (texture2D(normalMap, vPilePos.zy * pileTile).xy * 2. - 1.) * normalScale;
      vec2 py = (texture2D(normalMap, vPilePos.xz * pileTile + .37).xy * 2. - 1.) * normalScale;
      vec2 pz = (texture2D(normalMap, vPilePos.xy * pileTile + .71).xy * 2. - 1.) * normalScale;
      normal = normalize(normal + w.x * (px.x * vPileZ + px.y * vPileY) + w.y * (py.x * vPileX + py.y * vPileZ) + w.z * (pz.x * vPileX + pz.y * vPileY));
    }`);
  };
  material.customProgramCacheKey = () => 'triplanar-pile';
  return material;
}

// How strongly her head's pile shows (the normal scale of pileNormalTexture on her head): about a degree of unevenness,
// which reads as soft fabric close up and is gone at phone size. Her face panel draws the same pile (embroidery.js).
export const SKIN_PILE = .04;
// Her plush: matte, with the soft sheen of a short pile at the turning edges, and the combed nap. `repeat` sets how many
// nap tiles run across the surface's uv (fibres a few thousandths of her head long). `pile` draws the pile seen as a
// whole (pileHeight) instead of the nap, laid on by position (triplanarPile), at that normal scale: her head is sewn
// from it.
export function plush(color, { roughness = .9, sheenTint = .3, sheenRoughness = .72, nap = .039, repeat = [12, 6], side = T.FrontSide, pile = 0 } = {}) {
  const normalMap = pile ? pileNormalTexture() : napNormalTexture(), scale = pile || nap; normalMap.repeat.set(...repeat);
  const material = new T.MeshPhysicalMaterial({ color, roughness, sheen: 1, sheenColor: new T.Color(color).lerp(new T.Color('#fff4ea'), sheenTint), sheenRoughness, normalMap, normalScale: new T.Vector2(scale, scale), side });
  return pile ? triplanarPile(material) : material;
}

// Her socks' fine rib knit: ribs running down the sock, each a row of little knit stitches, as a filtered normal map.
let ribs = null;
export function ribKnit(color, { around = 28, down = 10 } = {}) {
  if (!ribs) {
    const size = 128, data = new Uint8Array(size * size * 4), h = new Float32Array(size * size);
    // Eight ribs across the tile, sixteen stitch rows down it.
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const u = x / size * 8, v = y / size * 16, rib = Math.pow(Math.abs(Math.sin(Math.PI * u)), .7), stitch = .25 * Math.pow(Math.abs(Math.sin(Math.PI * (v + .5 * Math.floor(u)))), 1.5);
      h[y * size + x] = rib * (.8 + stitch);
    }
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const dx = (h[y * size + (x + 1) % size] - h[y * size + (x + size - 1) % size]) * 1.6, dy = (h[((y + 1) % size) * size + x] - h[((y + size - 1) % size) * size + x]) * 1.6;
      const l = Math.hypot(dx, dy, 1), i = (y * size + x) * 4;
      data[i] = Math.round((-dx / l * .5 + .5) * 255); data[i + 1] = Math.round((-dy / l * .5 + .5) * 255); data[i + 2] = Math.round((1 / l * .5 + .5) * 255); data[i + 3] = 255;
    }
    ribs = data;
  }
  const t = new T.DataTexture(ribs, 128, 128, T.RGBAFormat); t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(around / 8, down / 16 * 8);
  return new T.MeshPhysicalMaterial({ color, roughness: .92, sheen: .6, sheenColor: new T.Color(color).lerp(new T.Color('#ffffff'), .3), sheenRoughness: .7, normalMap: filtered(t), normalScale: new T.Vector2(.55, .55) });
}
