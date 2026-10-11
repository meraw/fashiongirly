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

// Her plush: matte, with the soft sheen of a short pile at the turning edges, and the combed nap. `repeat` sets how many
// nap tiles run across the surface's uv (fibres a few thousandths of her head long).
export function plush(color, { roughness = .9, sheenTint = .3, sheenRoughness = .72, nap = .039, repeat = [12, 6], side = T.FrontSide } = {}) {
  const normalMap = napNormalTexture(); normalMap.repeat.set(...repeat);
  return new T.MeshPhysicalMaterial({ color, roughness, sheen: 1, sheenColor: new T.Color(color).lerp(new T.Color('#fff4ea'), sheenTint), sheenRoughness, normalMap, normalScale: new T.Vector2(nap, nap), side });
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
