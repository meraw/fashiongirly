import * as T from 'three';

// A faster stand-in for `new T.Raycaster(origin, direction).intersectObjects(meshes, false)[0]` when the same meshes
// are tested by many level rays (direction.y === 0), as the jeans template and the layering tests do: a level ray can
// only hit triangles that cross its own height, so the meshes' world-space triangles are sorted into thin height bands
// once, and each ray tests only its band. Same nearest hit as three.js (same triangle test and face culling). Any other
// ray, or a mesh this does not handle (several materials, morphs, instances, a draw range), goes through three.js's own
// Raycaster. Like the Raycaster, it uses the meshes' matrixWorld as it is, and the meshes must not change shape while
// it is in use.
//
// Options:
// - axis: [x, z] of a vertical line the rays start from (her centre line, a leg's centre). A ray that starts on it can
//   only hit triangles spanning its own angle around it, so the triangles are also sorted by angle, and such a ray
//   tests only its band and sector. Rays starting anywhere else still work, using the band alone.
// - faces: 'material' (default) culls faces by each mesh's material side, as three.js does; 'both' tests every
//   triangle from both sides, whatever the material (as the coverage tests' own surface measurements do).
// The returned function takes (origin, direction, farthest = false); farthest gives the last hit along the ray instead
// of the first (the outermost surface, seen from her centre line).
export function levelCaster(meshes, { axis = null, faces = 'material', bands = 0, sectors = 128 } = {}) {
  const both = faces === 'both';
  const exact = (origin, direction, farthest) => {
    const hits = new T.Raycaster(origin, direction).intersectObjects(meshes, false);return farthest ? hits.at(-1) : hits[0];};
  const plain = m => m.isMesh && !m.isSkinnedMesh && !m.isInstancedMesh && m.material && !Array.isArray(m.material) &&
    !m.geometry.morphAttributes.position && m.geometry.drawRange.start === 0 && m.geometry.drawRange.count === Infinity;
  if (!both && !meshes.every(plain)) return exact;
  let count = 0;
  for (const m of meshes) count += Math.floor((m.geometry.index ? m.geometry.index.count : m.geometry.attributes.position.count) / 3);
  const xyz = new Float64Array(count * 9), owner = new Int32Array(count), corners = new Int32Array(count * 3), v = new T.Vector3();
  let t = 0;
  meshes.forEach((m, k) => {
    const pos = m.geometry.attributes.position, index = m.geometry.index, n = index ? index.count : pos.count;
    for (let i = 0; i + 2 < n; i += 3, t++) {
      for (let j = 0; j < 3; j++) {
        const vertex = corners[t * 3 + j] = index ? index.getX(i + j) : i + j;
        v.fromBufferAttribute(pos, vertex).applyMatrix4(m.matrixWorld); xyz[t * 9 + j * 3] = v.x; xyz[t * 9 + j * 3 + 1] = v.y; xyz[t * 9 + j * 3 + 2] = v.z;
      }
      owner[t] = k;
    }
  });
  let lo = Infinity, hi = -Infinity, tall = 0;
  for (let i = 1; i < xyz.length; i += 3) { if (xyz[i] < lo) lo = xyz[i]; if (xyz[i] > hi) hi = xyz[i]; }
  for (let o = 0; o < xyz.length; o += 9) tall += Math.max(xyz[o + 1], xyz[o + 4], xyz[o + 7]) - Math.min(xyz[o + 1], xyz[o + 4], xyz[o + 7]);
  // Unless asked for, bands about as tall as the average triangle: thinner ones would only list each triangle many times.
  bands ||= Math.max(16, Math.min(1024, Math.ceil((hi - lo) / (tall / Math.max(1, count) || 1))));
  const step = (hi - lo) / bands || 1, band = y => Math.min(bands - 1, Math.floor((y - lo) / step));
  // Sector of an angle around the axis. Each triangle's bands, and (with an axis) the arc of sectors it can be hit in
  // from the axis: the arc between its corners' angles, or every sector when it surrounds (or touches) the axis.
  const turn = Math.PI * 2, sector = a => ((Math.floor((a + Math.PI) / turn * sectors) % sectors) + sectors) % sectors;
  const lowBand = new Int32Array(count), highBand = new Int32Array(count), firstSector = new Int32Array(count), span = new Int32Array(count);
  for (let t = 0; t < count; t++) {
    const o = t * 9;
    lowBand[t] = band(Math.min(xyz[o + 1], xyz[o + 4], xyz[o + 7])); highBand[t] = band(Math.max(xyz[o + 1], xyz[o + 4], xyz[o + 7]));
    if (!axis) continue;
    const x0 = xyz[o] - axis[0], z0 = xyz[o + 2] - axis[1], x1 = xyz[o + 3] - axis[0], z1 = xyz[o + 5] - axis[1], x2 = xyz[o + 6] - axis[0], z2 = xyz[o + 8] - axis[1];
    let first = 0, arc = turn;
    if (Math.hypot(x0, z0) > 1e-12 && Math.hypot(x1, z1) > 1e-12 && Math.hypot(x2, z2) > 1e-12) {
      let p = Math.atan2(x0, z0), q = Math.atan2(x1, z1), r = Math.atan2(x2, z2), swap;
      if (p > q) { swap = p; p = q; q = swap; } if (q > r) { swap = q; q = r; r = swap; } if (p > q) { swap = p; p = q; q = swap; }
      // The widest gap between the sorted angles (going round) is the part of the circle the triangle does not cover.
      const g0 = q - p, g1 = r - q, g2 = turn - (r - p), widest = Math.max(g0, g1, g2);
      if (turn - widest < Math.PI - 1e-9) { arc = turn - widest; first = widest === g0 ? q : widest === g1 ? r : p; }
    }
    const pad = 1e-6;firstSector[t] = sector(first - pad);
    span[t] = arc >= turn ? sectors - 1 : (sector(first + arc + pad) - firstSector[t] + sectors) % sectors;
  }
  // The triangles of each cell, stored together: cell k holds members[start[k]] up to members[start[k + 1]]. A band's
  // cell is its band; a sector cell is band * sectors + sector.
  const group = (cellCount, sectored) => {
    const start = new Int32Array(cellCount + 1);
    for (let pass = 0, fill, members; pass < 2; pass++) {
      if (pass) { for (let k = 0; k < cellCount; k++) start[k + 1] += start[k]; fill = start.slice(0, cellCount); members = new Int32Array(start[cellCount]); }
      for (let t = 0; t < count; t++) for (let b = lowBand[t]; b <= highBand[t]; b++) for (let k = 0; k <= (sectored ? span[t] : 0); k++) {
        const cell = sectored ? b * sectors + (firstSector[t] + k) % sectors : b;
        if (pass) members[fill[cell]++] = t; else start[cell + 1]++;
      }
      if (pass) return { start, members };
    }
  };
  const byBand = group(bands, false), bySector = axis && group(bands * sectors, true);
  const a = new T.Vector3(), b = new T.Vector3(), c = new T.Vector3(), point = new T.Vector3(), ray = new T.Ray();
  const test = (t, origin, best, farthest) => {
    const m = meshes[owner[t]], o = t * 9, side = both ? T.DoubleSide : m.material.side;
    a.set(xyz[o], xyz[o + 1], xyz[o + 2]); b.set(xyz[o + 3], xyz[o + 4], xyz[o + 5]); c.set(xyz[o + 6], xyz[o + 7], xyz[o + 8]);
    const hit = side === T.BackSide ? ray.intersectTriangle(c, b, a, true, point) : ray.intersectTriangle(a, b, c, side === T.FrontSide, point);
    if (!hit) return best;
    const distance = origin.distanceTo(point);
    return !best || (farthest ? distance > best.distance : distance < best.distance) ? { distance, point: point.clone(), object: m, t } : best;
  };
  // The hit as three.js reports it: its face holds the corners' vertex indices and the normal in the mesh's own space.
  const report = best => {
    if (!best) return undefined;
    const { t: k, ...hit } = best, pos = hit.object.geometry.attributes.position, normal = new T.Vector3();
    T.Triangle.getNormal(a.fromBufferAttribute(pos, corners[k * 3]), b.fromBufferAttribute(pos, corners[k * 3 + 1]), c.fromBufferAttribute(pos, corners[k * 3 + 2]), normal);
    hit.face = { a: corners[k * 3], b: corners[k * 3 + 1], c: corners[k * 3 + 2], normal, materialIndex: 0 };
    return hit;
  };
  return (origin, direction, farthest = false) => {
    if (direction.y !== 0) {
      if (!both) return exact(origin, direction, farthest);
      ray.set(origin, direction);let best;for (let t = 0; t < count; t++) best = test(t, origin, best, farthest);return report(best);
    }
    if (origin.y < lo || origin.y > hi) return undefined;
    ray.set(origin, direction);
    const onAxis = axis && origin.x === axis[0] && origin.z === axis[1];
    const { start, members } = onAxis ? bySector : byBand, k = onAxis ? band(origin.y) * sectors + sector(Math.atan2(direction.x, direction.z)) : band(origin.y);
    let best;
    for (let i = start[k]; i < start[k + 1]; i++) best = test(members[i], origin, best, farthest);
    return report(best);
  };
}
