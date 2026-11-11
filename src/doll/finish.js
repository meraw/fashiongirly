// The finish on everything she is made of and wears, laid on after it is built and before it is posed (pose.js keeps
// the first shape it sees as the rest shape), so no garment builder changes. Two things gave her and her clothes away
// as drawn by a computer (31 October 2026):
//   - Seams in the shading. A surface built as rings round her (shell() and its kind) closes on itself down her front,
//     and a sphere at its seam and its poles: there the same point is two or more vertices, each given the surface's
//     direction from the faces on its own side only, so a faint line or star shows in the light. Where the vertices of
//     one point face nearly the same way they are given one direction, the surface's own; an edge meant to be sharp
//     (a cuff's rim, a sole's edge, the side of a button) turns further than that and is left as it is.
//   - Textures read pixel by pixel. three.js draws a texture made from data with its nearest pixel and without
//     smaller copies unless told otherwise, and most garments' weave, knit and print textures are made from data: up
//     close their pixels show as steps (a bump map's steps catch the light as hard little ledges), and at phone size
//     they sparkle as she turns. They are filtered as photographs are: smooth between pixels, averaged as they
//     shrink, and kept sharp where a surface turns away from us. A texture an alpha test cuts holes with (a mesh, a
//     crochet) is left as it is: averaged, its holes could close or its fabric vanish.
import * as T from 'three';

// Vertices of one point are given one direction when their directions are within this angle of each other.
export const CREASE = 30;
const finished = new WeakSet(), tuned = new WeakSet();
const MAPS = ['map', 'alphaMap', 'bumpMap', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'sheenColorMap', 'sheenRoughnessMap', 'clearcoatMap', 'clearcoatNormalMap', 'clearcoatRoughnessMap', 'specularIntensityMap', 'specularColorMap', 'displacementMap'];

// One direction for the vertices that share a point and nearly a direction. Returns how many vertices changed.
export function weldSeams(geometry, crease = CREASE) {
  const p = geometry.attributes.position, n = geometry.attributes.normal;
  // Only plain lists of directions, three floats to a vertex (every geometry she is made of has them).
  if (!p || !n || p.count < 2 || n.isInterleavedBufferAttribute || n.itemSize !== 3 || !(n.array instanceof Float32Array)) return 0;
  const limit = Math.cos(crease * Math.PI / 180), q = 1e5, groups = new Map(), keys = new Int32Array(p.count * 3);
  for (let i = 0; i < p.count; i++) {
    const x = Math.round(p.getX(i) * q), y = Math.round(p.getY(i) * q), z = Math.round(p.getZ(i) * q);
    keys[i * 3] = x; keys[i * 3 + 1] = y; keys[i * 3 + 2] = z;
    const h = (x * 73856093 ^ y * 19349663 ^ z * 83492791) | 0, list = groups.get(h);
    if (list) list.push(i); else groups.set(h, [i]);
  }
  const out = Float32Array.from(n.array), same = (i, j) => keys[i * 3] === keys[j * 3] && keys[i * 3 + 1] === keys[j * 3 + 1] && keys[i * 3 + 2] === keys[j * 3 + 2];
  let changed = 0;
  for (const list of groups.values()) {
    if (list.length < 2) continue;
    for (const i of list) {
      let x = 0, y = 0, z = 0, count = 0;
      const ix = n.getX(i), iy = n.getY(i), iz = n.getZ(i);
      for (const j of list) {
        if (!same(i, j)) continue;
        const jx = n.getX(j), jy = n.getY(j), jz = n.getZ(j);
        if (ix * jx + iy * jy + iz * jz >= limit) { x += jx; y += jy; z += jz; count++; }
      }
      if (count < 2) continue;
      const l = Math.hypot(x, y, z);
      if (!l) continue;
      out[i * 3] = x / l; out[i * 3 + 1] = y / l; out[i * 3 + 2] = z / l; changed++;
    }
  }
  if (changed) { n.array.set(out); n.needsUpdate = true; }
  return changed;
}

// Smooth filtering for a texture read pixel by pixel, and sharpness at a slant for every texture (see above).
export function tuneTexture(texture, { anisotropy = 8 } = {}) {
  if (!texture?.isTexture || tuned.has(texture)) return false;
  tuned.add(texture);
  let changed = false;
  if (texture.minFilter === T.NearestFilter && texture.magFilter === T.NearestFilter) {
    texture.minFilter = T.LinearMipmapLinearFilter; texture.magFilter = T.LinearFilter; texture.generateMipmaps = true; changed = true;
  }
  if (texture.anisotropy < anisotropy) { texture.anisotropy = anisotropy; changed = true; }
  if (changed) texture.needsUpdate = true;
  return changed;
}

// Finish everything under `root` that is not finished yet. `anisotropy` is the renderer's (see view.js).
export function finish(root, { anisotropy = 8 } = {}) {
  const meshes = [], materials = new Set();
  root.traverse(o => { if (o.isMesh) { meshes.push(o); for (const m of Array.isArray(o.material) ? o.material : [o.material]) if (m) materials.add(m); } });
  // A texture that cuts holes anywhere is left as it is everywhere.
  for (const m of materials) if (m.alphaTest > 0) for (const key of ['map', 'alphaMap']) if (m[key]?.isTexture) tuned.add(m[key]);
  for (const m of materials) for (const key of MAPS) tuneTexture(m[key], { anisotropy });
  for (const o of meshes) if (o.geometry && !finished.has(o.geometry)) { finished.add(o.geometry); weldSeams(o.geometry); }
  return root;
}
