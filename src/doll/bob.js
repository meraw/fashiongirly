// Her bob, sewn from plush like a doll's wig, in the shape it always had (the user likes her face and her bob; the
// clarification of 11 October 2026 asked for definition and believable construction, not a new design):
// - one shell over the crown and the back of her head, from a whorl on her crown down to a hem, cut and quilted: down
//   the back the panels are joined by sunken seams, and at the front the shell comes down over her forehead as the
//   swept fringe, seven stuffed locks quilted from the whorl to a scalloped edge;
// - two side pillows, each two panels sewn round the edge and stuffed, hanging beside her face;
// - every edge a rolled hem with thickness, never a cut sheet; and where pieces meet or overlap, or a seam goes in,
//   the plush is shaded (a vertex colour multiplied into the hair) as it is in a photograph of a real doll.
// The shell is one surface, divided into the parts the hair controller has always toggled (hair-crown, bob-back,
// swept-fringe). Head space: x towards her left, y up, z forward; her head is the ellipsoid .5 x .47 x .405.
import * as T from 'three';

const A = .5, B = .47, C = .405, TAU = Math.PI * 2;
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v, smooth = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };
const onHead = (d, out = new T.Vector3()) => { const k = 1 / Math.sqrt((d.x / A) ** 2 + (d.y / B) ** 2 + (d.z / C) ** 2); return out.set(d.x * k, d.y * k, d.z * k); };
const headNormal = (p, out = new T.Vector3()) => out.set(p.x / (A * A), p.y / (B * B), p.z / (C * C)).normalize();
// The point of her head at azimuth theta (0 in front, positive towards her left) and height y.
const atHeight = (theta, y, out = new T.Vector3()) => { const r = Math.sqrt(Math.max(1e-6, 1 - (y / B) ** 2)) / Math.sqrt((Math.sin(theta) / A) ** 2 + (Math.cos(theta) / C) ** 2); return out.set(r * Math.sin(theta), y, r * Math.cos(theta)); };
// Roughly how far a point lies outside her head (negative inside).
export function headDistance(p) { const u = p.x / A, v = p.y / B, w = p.z / C, k = Math.sqrt(u * u + v * v + w * w), g = Math.sqrt((u / A) ** 2 + (v / B) ** 2 + (w / C) ** 2); return k < 1e-6 ? -C : k * (k - 1) / g; }

// ---- The hem -------------------------------------------------------------------------------------------------------
// Across her forehead, the fringe's edge where the notches between its locks fall (x, y): low on her right, where the
// locks sweep across; over each brow a lock hangs down across its outer end, as her fringe always covered it, leaving
// the inner part of the brow to show; it ends under each side pillow. The locks hang below it.
const FRINGE = [[-.42, .02], [-.34, .1], [-.25, .172], [-.19, .212], [-.13, .232], [-.04, .25], [.04, .252], [.13, .232], [.19, .212], [.245, .196], [.3, .225], [.355, .25]];
export const LOCKS = 7, LOCK_DROP = .03;
const thetaOf = (x, y) => Math.atan2(x, C * Math.sqrt(Math.max(1e-4, 1 - (x / A) ** 2 - (y / B) ** 2)));
const FRONT = FRINGE.map(([x, y]) => [thetaOf(x, y), y]);
export const FRINGE_START = FRONT[0][0], FRINGE_END = FRONT.at(-1)[0];
// The whole hem as heights round her head (radians, y): the fringe, then down each side under the pillow to the jaw,
// and round the back at the nape.
const deg = Math.PI / 180;
const HEM = [...FRONT, [72 * deg, .2], [84 * deg, .03], [97 * deg, -.19], [111 * deg, -.32], [128 * deg, -.38], [152 * deg, -.405], [180 * deg, -.415], [208 * deg, -.405], [235 * deg, -.375], [254 * deg, -.33], [268 * deg, -.25], [281 * deg, -.1]];
function periodic(points) {
  // A smooth closed curve through (angle, value) points, angles increasing over one turn from points[0].
  const p = points.map(([a, v]) => [a, v]), n = p.length;
  return a => {
    let t = a; while (t < p[0][0]) t += TAU; while (t >= p[0][0] + TAU) t -= TAU;
    let i = 0; while (i < n - 1 && t >= p[i + 1][0]) i++;
    const at = k => { const q = p[(k + n) % n], wrap = Math.floor(k / n); return [q[0] + wrap * TAU, q[1]]; };
    const [a0, v0] = at(i - 1), [a1, v1] = at(i), [a2, v2] = at(i + 1), [a3, v3] = at(i + 2), h = a2 - a1, u = (t - a1) / h;
    const m1 = (v2 - v0) / (a2 - a0) * h, m2 = (v3 - v1) / (a3 - a1) * h, u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * v1 + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * v2 + (u3 - u2) * m2;
  };
}
const hemHeight = periodic(HEM);
// Where along the fringe an angle lies, in locks (0 at its right end, LOCKS at its left), or null outside it.
export const lockAt = theta => theta >= FRINGE_START && theta <= FRINGE_END ? (theta - FRINGE_START) / (FRINGE_END - FRINGE_START) * LOCKS : null;
// How far a lock hangs below the notch line: a rounded lobe, narrowing into each notch.
const lobe = u => u == null ? 0 : LOCK_DROP * Math.pow(.5 - .5 * Math.cos(TAU * u), .6);
// The visible edge of the hair at an angle: the fringe's scallops, or the hem behind the pillows and at the nape.
export const edgeHeight = theta => hemHeight(theta) - lobe(lockAt(theta));

// ---- The shell -----------------------------------------------------------------------------------------------------
// The shell's columns, as angles round her head: close together across the fringe (its scallops and seams), wider
// round the back.
const ANGLES = (() => {
  const a0 = FRINGE_START - .16, a1 = FRINGE_END + .16, front = 150, rest = 96, out = [];
  for (let i = 0; i < front; i++) out.push(a0 + (a1 - a0) * i / front);
  for (let i = 0; i < rest; i++) out.push(a1 + (TAU - (a1 - a0)) * i / rest);
  return out.map(a => a > Math.PI ? a - TAU : a);
})();
const COLS = ANGLES.length, angleAt = i => ANGLES[((i % COLS) + COLS) % COLS];
// The whorl on her crown, towards the back and a little to her left, where the panels start: from it the back's seams
// fall to the nape, and the fringe's come over her head and sweep down across her forehead to her right.
const WHORL = new T.Vector3(Math.sin(155 * deg) * Math.sin(.42), Math.cos(.42), Math.cos(155 * deg) * Math.sin(.42)).normalize();
const GORES = [112, 146, 180, 214, 248].map(d => d * deg);
// Thickness of the shell over her head (its outer offset) and how far it stands off her head (inner), along a column
// from the whorl (t = 0) to the hem (t = 1); and how deep a seam is there.
function profile(theta, t, base) {
  // Fullest at the back, where the bob rounds out over the nape and stands off her neck; slimmest at the sides, under
  // the pillows, which lie over it.
  const back = ((1 - Math.cos(theta)) / 2) ** 2.5, side = Math.sin(theta) ** 2, u = lockAt(theta);
  let outer = .064 - .008 * side * (1 - back) + .034 * back + .03 * back * smooth(.7, 1, t), seam = 0;
  if (u != null) {
    const f = u - Math.floor(u), near = Math.min(f, 1 - f), fade = smooth(.18, .55, t);
    outer += .009 * Math.sin(Math.PI * f) * fade;// each lock stuffed
    if (u > .02 && u < LOCKS - .02) seam = Math.exp(-((near / .085) ** 2)) * smooth(.1, .4, t);
  }
  for (const g of GORES) { const d = Math.abs(((theta - g + Math.PI) % TAU + TAU) % TAU - Math.PI); seam = Math.max(seam, Math.exp(-((d / (2.2 * deg)) ** 2)) * smooth(.15, .45, t)); }
  outer -= .013 * seam;
  // Over the top of her forehead the fringe is stuffed full where its sweep begins, a little to her right, as her
  // swept locks always stood up there; it settles to its edge over her brow.
  if (base) outer += .085 * smooth(.18, .47, base.y) * smooth(-.2, .2, base.z) * Math.exp(-(((theta + .15) / 1.45) ** 2));
  // At the whorl every column meets, so the thickness there is one value, or the columns would end in a ragged point.
  const meet = smooth(0, .3, t);
  outer = .074 + (outer - .074) * meet;
  const inner = .004 + .075 * back * smooth(.55, 1, t);
  return { outer, inner, seam: seam * meet };
}

// A grid of points (columns round her head, rows down each column) as a mesh, with uvs and shading per vertex; the
// columns wrap round.
function gridGeometry(cols, rows, at) {
  const pos = new Float32Array(cols * rows * 3), uv = new Float32Array(cols * rows * 2), shade = new Float32Array(cols * rows * 3), idx = [];
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const k = i * rows + j, v = at(i, j);
    pos.set([v.p.x, v.p.y, v.p.z], k * 3); uv.set(v.uv, k * 2); shade.set([v.ao, v.ao, v.ao], k * 3);
  }
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows - 1; j++) {
    const a = i * rows + j, b = ((i + 1) % cols) * rows + j;
    idx.push(a, b, a + 1, a + 1, b, b + 1);
  }
  const geo = new T.BufferGeometry();
  geo.setAttribute('position', new T.BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); geo.setAttribute('color', new T.BufferAttribute(shade, 3));
  geo.setIndex(idx); return geo;
}

// The shell: each column runs from the whorl over her head to its hem point, along the outer surface, round the rolled
// hem, and back a little way along the inner surface (hidden inside, so it needs no top).
function shell(pillows) {
  const OUTER = 22, RIM = 8, INNER = 4, rows = OUTER + RIM + INNER;
  const hemPoint = i => { const th = angleAt(i); return atHeight(th, edgeHeight(th) + .013); };
  const d = new T.Vector3(), q = new T.Vector3(), n = new T.Vector3(), tangent = new T.Vector3(), out = new T.Vector3(), hem = new T.Vector3();
  const along = (i, t, target) => { d.copy(WHORL).lerp(q.copy(hemPoint(i)).normalize(), t).normalize(); return onHead(d, target); };
  // The shell's outer and inner offsets at a point of her head (with its normal). Under a side pillow the shell is
  // pressed down as far as the pillow lies into it, easing back just beyond the pillow's rim: a soft crease round the
  // pillow where its stuffing presses into the plush beneath, and none where it hangs clear; never thinner than a
  // little plush; and the inner surface always stays under the outer one.
  const probe = new T.Vector3(), layers = (theta, t, base, normal) => {
    const pr = profile(theta, t, base);
    let outer = pr.outer;
    for (const pillow of pillows) {
      const { rho, depth } = pillow.press(probe.copy(base).addScaledVector(normal, outer), normal);
      if (rho < 1.3) outer = Math.max(.014, outer - depth * (1 - smooth(1, 1.3, rho)));
    }
    return { outer, inner: Math.min(pr.inner, outer - .01), seam: pr.seam };
  };
  const geo = gridGeometry(COLS, rows, (i, j) => {
    const theta = angleAt(i);
    let p = new T.Vector3(), ao = 1, v;
    if (j < OUTER) {
      // The outer surface, rows closer together towards the hem.
      const t = 1 - (1 - j / (OUTER - 1)) ** 1.35, base = along(i, t, new T.Vector3()); headNormal(base, n);
      const L = layers(theta, t, base, n);
      p.copy(base).addScaledVector(n, L.outer); ao = 1 - .34 * L.seam; v = t;
    } else {
      // Round the hem: a half circle from the outer surface to the inner, bulging out beyond the hem point, square to
      // the edge (the edge's own direction comes from the neighbouring columns).
      hem.copy(hemPoint(i)); headNormal(hem, n); const L = layers(theta, 1, hem, n);
      tangent.copy(hemPoint(i + 1)).sub(hemPoint(i - 1)); out.crossVectors(tangent, n).normalize();
      if (out.dot(along(i, 1, new T.Vector3()).sub(along(i, .9, new T.Vector3()))) < 0) out.negate();
      const r = (L.outer - L.inner) / 2, mid = (L.outer + L.inner) / 2;
      if (j < OUTER + RIM) {
        const a = (j - OUTER + 1) / (RIM + 1) * Math.PI;
        p.copy(hem).addScaledVector(n, mid + r * Math.cos(a)).addScaledVector(out, r * Math.sin(a));
        ao = 1 - .3 * smooth(Math.PI * .45, Math.PI, a); v = 1 + a / Math.PI * .05;
      } else {
        // The inner surface, back up towards the whorl, under the hem.
        const t = 1 - (j - OUTER - RIM + 1) / INNER * .4, base = along(i, t, new T.Vector3()); headNormal(base, n);
        p.copy(base).addScaledVector(n, layers(theta, t, base, n).inner); ao = .62; v = 1.05 + (1 - t);
      }
    }
    // Where a side pillow lies over the shell, the plush under and beside it is shaded.
    for (const pillow of pillows) { const dist = pillow.distance(p); if (dist > 0) ao *= 1 - .3 * Math.exp(-dist / .02); }
    return { p, uv: [(theta + Math.PI) / TAU * 14, v * 5.5], ao };
  });
  geo.computeVertexNormals();
  return geo;
}

// ---- The side pillows ----------------------------------------------------------------------------------------------
// Two panels sewn round the edge and stuffed, in the size and place of the old side locks: a slightly flattened round
// pillow, its seam a groove all round its rim, its outer panel quilted down its length into three locks like the
// fringe's. Returns the mesh's geometry and a rough distance to its surface.
function pillow(side) {
  const a = .13, b = .39, c = .245, e = 2.3, centre = new T.Vector3(side * .44, -.02, .072), turn = side * .13;
  // The sphere's seam (where its texture wraps round) is turned to the side against her head, out of sight.
  const geo = new T.SphereGeometry(1, 48, 36, side > 0 ? 0 : Math.PI), p = geo.attributes.position, uv = geo.attributes.uv, shade = new Float32Array(p.count * 3);
  const rot = new T.Matrix4().makeRotationZ(turn), v = new T.Vector3();
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = Math.pow(Math.abs(x) ** e + (y * y + z * z) ** (e / 2), -1 / e);
    let X = a * x * k, Y = b * y * k, Z = c * z * k;
    // The seam: the rim drawn in where the two panels meet.
    const w = Math.exp(-((X / .011) ** 2)), rho = Math.hypot(Y / b, Z / c), pull = 1 - .009 * w / (Math.hypot(Y, Z) || 1);
    Y *= pull; Z *= pull;
    // The quilting on the outer panel: two lines down its length, a third of the way in from each side, fading out
    // before the rim, and each of the three locks stuffed between them.
    const face = smooth(.15, .6, side * X / a) * (1 - smooth(.7, .97, rho)), u = (Z / c + 1) * 1.5, f = u - Math.floor(u);
    const quilt = u > .5 && u < 2.5 ? Math.exp(-(((Math.min(f, 1 - f) * 2 * c / 3) / .024) ** 2)) : 0;
    X += (-.0055 * quilt + .006 * Math.sin(Math.PI * f) * (1 - quilt)) * face;
    v.set(X, Y, Z).applyMatrix4(rot).add(centre); p.setXYZ(i, v.x, v.y, v.z);
    // Shading: in the seam and the quilting, and where the pillow presses against her head.
    const near = headDistance(v), ao = (1 - .34 * w * clamp(rho)) * (1 - .22 * quilt * face) * (1 - .42 * Math.exp(-Math.max(0, near) / .022));
    shade.set([ao, ao, ao], i * 3);
    uv.setXY(i, uv.getX(i) * 6, uv.getY(i) * 3.6);
  }
  geo.setAttribute('color', new T.BufferAttribute(shade, 3)); geo.computeVertexNormals();
  // A rough distance to the pillow (the same shape without its seam), for shading what it lies on.
  const inv = new T.Matrix4().makeRotationZ(-turn), l = new T.Vector3();
  const distance = pt => { l.copy(pt).sub(centre).applyMatrix4(inv); const f = Math.pow(Math.abs(l.x / a) ** e + ((l.y / b) ** 2 + (l.z / c) ** 2) ** (e / 2), 1 / e); return (f - 1) * Math.min(a, b, c) * 1.6; };
  // How far a point would have to move along `n` (towards her head) to lie inside the pillow, below the quilting lines
  // sunk into its outer panel, and how far within the pillow's outline it is (rho: 0 at its middle, 1 at its rim). The
  // shell under it is pressed down by this much.
  const axis = new T.Vector3(side, 0, 0).applyMatrix4(rot);
  const press = (pt, n) => { l.copy(pt).sub(centre).applyMatrix4(inv); const rho = Math.hypot(l.y / b, l.z / c), face = rho < 1 ? a * Math.pow(1 - rho ** e, 1 / e) : 0, over = side * l.x - (face - .004 - .0075 * (1 - smooth(.7, .97, rho))); return { rho, depth: over > 0 ? over / Math.max(.35, n.dot(axis)) : 0 }; };
  return { geo, distance, press };
}

// ---- Dividing the shell into its parts ----------------------------------------------------------------------------
function part(geo, keep) {
  const index = geo.index.array, p = geo.attributes.position, used = new Map(), tris = [];
  for (let t = 0; t < index.length; t += 3) if (keep(index[t], index[t + 1], index[t + 2])) tris.push(index[t], index[t + 1], index[t + 2]);
  const remap = k => { if (!used.has(k)) used.set(k, used.size); return used.get(k); };
  const local = tris.map(remap), out = new T.BufferGeometry();
  for (const name of ['position', 'normal', 'uv', 'color']) {
    const src = geo.attributes[name], size = src.itemSize, data = new Float32Array(used.size * size);
    for (const [k, l] of used) for (let c = 0; c < size; c++) data[l * size + c] = src.array[k * size + c];
    out.setAttribute(name, new T.BufferAttribute(data, size));
  }
  out.setIndex(local);
  return out;
}

// The bob is the same on every doll, so its pieces are made once and copied for each (the tests make many dolls).
let made = null;
function pieces() {
  if (made) return made;
  const pillows = [-1, 1].map(pillow), geo = shell(pillows), rows = geo.attributes.position.count / COLS;
  // The parts: the fringe is the front of the shell below the whorl's reach, the back below the crown behind her ears.
  const col = k => Math.floor(k / rows), row = k => k % rows, theta = k => angleAt(col(k));
  const zone = (a, b, c) => {
    // (a triangle across the column where the angles wrap round, behind her, is at the back)
    const ts = [theta(a), theta(b), theta(c)], wraps = Math.max(...ts) - Math.min(...ts) > Math.PI;
    const th = wraps ? Math.PI : (ts[0] + ts[1] + ts[2]) / 3, r = (row(a) + row(b) + row(c)) / 3;
    if (!wraps && th > FRINGE_START - .12 && th < FRINGE_END + .12 && r > 8) return 'swept-fringe';
    if ((wraps || Math.abs(th) > 1.75) && r > 10) return 'bob-back';
    return 'hair-crown';
  };
  const parts = ['hair-crown', 'bob-back', 'swept-fringe'].map(name => [name, part(geo, (a, b, c) => zone(a, b, c) === name)]);
  geo.dispose();
  return made = { parts, pillows };
}
// Put her bob on her head (a group with her head's ellipsoid at its origin). `material` is her hair plush; it is
// given vertex colours for the shading. Returns what shadeFace needs.
export function makeBob(head, material) {
  material.vertexColors = true; material.normalMap.repeat.set(1, 1);
  const { parts, pillows } = pieces();
  for (const [name, geo] of parts) { const mesh = new T.Mesh(geo.clone(), material); mesh.name = name; mesh.castShadow = mesh.receiveShadow = true; head.add(mesh); }
  for (const [i, side] of [-1, 1].entries()) { const mesh = new T.Mesh(pillows[i].geo.clone(), material); mesh.name = 'side-bob'; mesh.userData.side = side; mesh.castShadow = mesh.receiveShadow = true; head.add(mesh); }
  return { pillows };
}

// The shading the bob casts on her face, as a vertex colour for her head: a soft contact shadow under the fringe's
// scalloped edge and beside the pillows. `position` is her head's (unit sphere) geometry and `scale` its scale.
export function shadeFace(position, scale, bob) {
  const out = new Float32Array(position.count * 3), p = new T.Vector3();
  for (let i = 0; i < position.count; i++) {
    p.set(position.getX(i) * scale.x, position.getY(i) * scale.y, position.getZ(i) * scale.z);
    let ao = 1;
    if (p.z > -.05) {
      // Below the fringe: how far under its edge this point lies, along her face.
      const u = lockAt(Math.atan2(p.x, p.z)), th = Math.atan2(p.x, p.z);
      if (u != null) { const below = edgeHeight(th) - p.y; if (below > -.02) ao *= 1 - .38 * Math.exp(-Math.max(0, below) / .022); }
      for (const pillow of bob.pillows) { const d = pillow.distance(p); if (d > 0) ao *= 1 - .4 * Math.exp(-d / .03); }
    }
    out[i * 3] = out[i * 3 + 1] = out[i * 3 + 2] = ao;
  }
  return out;
}
