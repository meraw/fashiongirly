import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { makeDoll, makeOutfit, disposeObject } from '../src/doll/model.js';
import { weldSeams, tuneTexture, finish } from '../src/doll/finish.js';
import { GARMENTS } from '../src/wardrobe/catalog.js';
// The finish laid on everything she is made of and wears (src/doll/finish.js): one shading across seams, filtered
// textures, and nothing moved.
const normalsAt = (geometry, x, y, z) => {
  const p = geometry.attributes.position, n = geometry.attributes.normal, out = [];
  for (let i = 0; i < p.count; i++) if (Math.hypot(p.getX(i) - x, p.getY(i) - y, p.getZ(i) - z) < 1e-6) out.push(new T.Vector3().fromBufferAttribute(n, i));
  return out;
};
// A ring of points closed on itself as shell() closes a garment: the first and last vertex of every row are the same
// point, each with the direction of its own side's faces only.
function closedRing(segments = 24) {
  const positions = [], index = [];
  for (const y of [1, 0]) for (let i = 0; i <= segments; i++) { const a = i / segments * Math.PI * 2; positions.push(Math.sin(a), y, Math.cos(a)); }
  for (let i = 0; i < segments; i++) { const a = i, b = i + segments + 1; index.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(positions, 3)); g.setIndex(index); g.computeVertexNormals();
  return g;
}

test('a surface closed on itself is shaded as one across its seam', () => {
  const g = closedRing(), [a, b] = normalsAt(g, 0, 0, 1);
  assert.ok(a.angleTo(b) > .1, 'the seam starts with two directions');
  assert.ok(weldSeams(g) >= 4);
  const [c, d] = normalsAt(g, 0, 0, 1);
  assert.ok(c.angleTo(d) < 1e-6, 'one direction after');
  assert.ok(c.angleTo(new T.Vector3(0, 0, 1)) < 1e-3, "and it is the surface's own");
  const once = Float32Array.from(g.attributes.normal.array); weldSeams(g);
  assert.deepEqual(g.attributes.normal.array, once, 'welding again changes nothing');
});

test('edges meant to be sharp are left as they are', () => {
  const g = new T.BoxGeometry(1, 1, 1), before = Float32Array.from(g.attributes.normal.array);
  assert.equal(weldSeams(g), 0);
  assert.deepEqual(Array.from(g.attributes.normal.array), Array.from(before));
});

test('her head is shaded as one across its seam, and her body keeps its shape', () => {
  const doll = makeDoll(), head = doll.getObjectByName('felt-head'), positions = new Map();
  doll.traverse(o => { if (o.isMesh) positions.set(o, Float32Array.from(o.geometry.attributes.position.array)); });
  finish(doll);
  doll.traverse(o => { if (o.isMesh) assert.deepEqual(o.geometry.attributes.position.array, positions.get(o), `${o.name} is not moved`); });
  // Every point of her head that is two vertices now has one direction (a vertex no face uses has none, and is not drawn).
  const p = head.geometry.attributes.position, n = head.geometry.attributes.normal, seen = new Map();
  for (let i = 0; i < p.count; i++) {
    if (Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) === 0) continue;
    const key = [p.getX(i), p.getY(i), p.getZ(i)].map(v => v.toFixed(5)).join();
    if (!seen.has(key)) { seen.set(key, i); continue; }
    const j = seen.get(key), a = new T.Vector3().fromBufferAttribute(n, i), b = new T.Vector3().fromBufferAttribute(n, j);
    assert.ok(a.angleTo(b) < 1e-3, `head seam at ${key}`);
  }
  disposeObject(doll);
});

// One garment of each template: what is checked does not depend on the garment, only on how its builder makes it.
const oneOfEach = () => { const seen = new Set(); return Object.entries(GARMENTS).filter(([id, g]) => { const k = `${g.slot}:${g.build?.template || id}`; if (seen.has(k)) return false; seen.add(k); return true; }); };
test('garments keep their shape and unit directions once finished', () => {
  for (const [id, g] of oneOfEach()) {
    const recipe = { knit: false, shirt: false, [{ top: 'topId', bottom: 'bottomId', shoes: 'shoesId', outerwear: 'outerwearId', dress: 'dressId' }[g.slot]]: id };
    const outfit = makeOutfit(recipe), positions = [];
    outfit.traverse(o => { if (o.isMesh) positions.push([o, Float32Array.from(o.geometry.attributes.position.array)]); });
    finish(outfit);
    for (const [o, before] of positions) {
      assert.deepEqual(o.geometry.attributes.position.array, before, `${id}: ${o.name} is not moved`);
      const n = o.geometry.attributes.normal;
      if (n) for (let i = 0; i < n.count; i++) { const l = Math.hypot(n.getX(i), n.getY(i), n.getZ(i)); assert.ok(Math.abs(l - 1) < 1e-3 || l === 0, `${id}: ${o.name} normal ${i} has length ${l}`); }
    }
    disposeObject(outfit);
  }
});

test('textures read pixel by pixel are filtered; textures that cut holes are left alone', () => {
  const data = new Uint8Array(16 * 16 * 4).fill(200), pixel = new T.DataTexture(data, 16, 16), holes = new T.DataTexture(data.slice(), 16, 16), photo = new T.Texture();
  assert.equal(pixel.minFilter, T.NearestFilter, 'three.js reads data textures pixel by pixel');
  const cloth = new T.MeshStandardMaterial({ bumpMap: pixel, map: photo }), mesh = new T.MeshStandardMaterial({ map: holes, alphaTest: .5 });
  const group = new T.Group(); group.add(new T.Mesh(new T.PlaneGeometry(), cloth), new T.Mesh(new T.PlaneGeometry(), mesh));
  finish(group, { anisotropy: 4 });
  assert.equal(pixel.minFilter, T.LinearMipmapLinearFilter); assert.equal(pixel.magFilter, T.LinearFilter); assert.equal(pixel.generateMipmaps, true); assert.equal(pixel.anisotropy, 4);
  assert.equal(photo.minFilter, T.LinearMipmapLinearFilter, 'a photograph keeps its filtering'); assert.equal(photo.anisotropy, 4, 'and is kept sharp at a slant');
  assert.equal(holes.minFilter, T.NearestFilter); assert.equal(holes.anisotropy, 1, 'a texture that cuts holes is not averaged');
  assert.equal(tuneTexture(pixel), false, 'a texture is tuned once');
});
