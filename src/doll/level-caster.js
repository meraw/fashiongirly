import * as T from 'three';

// A faster stand-in for `new T.Raycaster(origin, direction).intersectObjects(meshes, false)[0]` when the same meshes
// are tested by many level rays (direction.y === 0), as the jeans template and the layering tests do: a level ray can
// only hit triangles that cross its own height, so the meshes' world-space triangles are sorted into thin height bands
// once, and each ray tests only its band. Same nearest hit as three.js (same triangle test and face culling). Any other
// ray, or a mesh this does not handle (several materials, morphs, instances, a draw range), goes through three.js's own
// Raycaster. Like the Raycaster, it uses the meshes' matrixWorld as it is, and the meshes must not change shape while
// it is in use.
export function levelCaster(meshes, bands = 1024) {
  const exact = (origin, direction) => new T.Raycaster(origin, direction).intersectObjects(meshes, false)[0];
  const plain = m => m.isMesh && !m.isSkinnedMesh && !m.isInstancedMesh && m.material && !Array.isArray(m.material) &&
    !m.geometry.morphAttributes.position && m.geometry.drawRange.start === 0 && m.geometry.drawRange.count === Infinity;
  if (!meshes.every(plain)) return exact;
  const xyz = [], owner = [], v = new T.Vector3();
  meshes.forEach((m, k) => {
    const pos = m.geometry.attributes.position, index = m.geometry.index, n = index ? index.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3) {
      for (let j = 0; j < 3; j++) { v.fromBufferAttribute(pos, index ? index.getX(i + j) : i + j).applyMatrix4(m.matrixWorld); xyz.push(v.x, v.y, v.z); }
      owner.push(k);
    }
  });
  let lo = Infinity, hi = -Infinity;
  for (let i = 1; i < xyz.length; i += 3) { lo = Math.min(lo, xyz[i]); hi = Math.max(hi, xyz[i]); }
  const step = (hi - lo) / bands || 1, band = y => Math.min(bands - 1, Math.floor((y - lo) / step)), lists = Array.from({ length: bands }, () => []);
  for (let t = 0; t < owner.length; t++) {
    const y = [xyz[t * 9 + 1], xyz[t * 9 + 4], xyz[t * 9 + 7]];
    for (let b = band(Math.min(...y)); b <= band(Math.max(...y)); b++) lists[b].push(t);
  }
  const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), point = new T.Vector3(), ray = new T.Ray();
  return (origin, direction) => {
    if (direction.y !== 0) return exact(origin, direction);
    if (origin.y < lo || origin.y > hi) return undefined;
    ray.set(origin, direction);
    let best;
    for (const t of lists[band(origin.y)]) {
      const m = meshes[owner[t]], o = t * 9, side = m.material.side;
      a.set(xyz[o], xyz[o + 1], xyz[o + 2]); b.set(xyz[o + 3], xyz[o + 4], xyz[o + 5]); c.set(xyz[o + 6], xyz[o + 7], xyz[o + 8]);
      const hit = side === T.BackSide ? ray.intersectTriangle(c, b, a, true, point) : ray.intersectTriangle(a, b, c, side === T.FrontSide, point);
      if (!hit) continue;
      const distance = origin.distanceTo(point);
      if (!best || distance < best.distance) best = { distance, point: point.clone(), object: m };
    }
    return best;
  };
}
