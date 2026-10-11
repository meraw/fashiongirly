// Her embroidered face, stitched into the fabric of her head rather than laid on top of it. Each feature keeps the place,
// size and colour it had as separate pieces (makeHead's eyes, stars, lids, lashes, brows, smile and blush), and is drawn
// here in code, at about the density of the garments' own embroidery, as three maps over the front of her head:
// - colour: the fabric, an airbrushed blush with a soft but defined edge, and the threads;
// - normals: padded satin stitch that rises from the fabric with a rounded edge, rows of threads across each fill,
//   twisted floss along the lines, the fabric drawn down a little round every stitch, and the fabric's fine nap;
// - ambient occlusion and roughness: a fine contact shadow where thread meets fabric (or an upper layer meets a lower
//   one), and thread a little glossier than the matte pile.
// Satin fills run in different directions (the whites up and down, the irises out from the centre, the pupils across,
// the stars along their points), so each layer catches the light differently, as real embroidery does.
import * as T from 'three';
import { SMILES, EXPRESSIONS } from './face.js';
import { napHeight, filtered } from './plush.js';

// The front of her head, x across and y up in head space, projected straight along z (as the features always were).
export const FACE = { x0: -.42, x1: .42, y0: -.36, y1: .3, w: 1024, h: 805 };
const PX = (FACE.x1 - FACE.x0) / FACE.w, PY = (FACE.y1 - FACE.y0) / FACE.h;
export const SKIN = '#e2b698';
const lin = hex => { const c = new T.Color(hex); return [c.r, c.g, c.b]; };// three's Color keeps linear values
// Linear to sRGB bytes, through a table (the face has close to a million pixels to encode).
const SRGB = new Uint8Array(4097).map((_, i) => { const v = i / 4096; return Math.round(255 * (v <= .0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - .055)); });
const enc = v => SRGB[v <= 0 ? 0 : v >= 1 ? 4096 : Math.round(v * 4096)];
const clamp = v => v < 0 ? 0 : v > 1 ? 1 : v;
const smooth = (a, b, t) => { const x = clamp((t - a) / (b - a)); return x * x * (3 - 2 * x); };

// ---- Shapes, as signed distances (negative inside) in head units ---------------------------------------------------
function ellipse(cx, cy, a, b) {
  const m = Math.min(a, b), sdf = (x, y) => { const u = (x - cx) / a, v = (y - cy) / b, k = Math.sqrt(u * u + v * v), p = u / a, q = v / b; return k < 1e-6 ? -m : k * (k - 1) / Math.sqrt(p * p + q * q); };
  return { sdf, box: [cx - a, cy - b, cx + a, cy + b], centre: [cx, cy] };
}
function polygon(points) {
  const n = points.length, xs = points.map(p => p[0]), ys = points.map(p => p[1]);
  const sdf = (x, y) => {
    let d = Infinity, inside = false;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [ax, ay] = points[j], [bx, by] = points[i], ex = bx - ax, ey = by - ay, wx = x - ax, wy = y - ay;
      const t = clamp((wx * ex + wy * ey) / (ex * ex + ey * ey)), qx = wx - ex * t, qy = wy - ey * t;
      d = Math.min(d, qx * qx + qy * qy);
      if ((ay > y) !== (by > y) && x < ax + (y - ay) / (by - ay) * ex) inside = !inside;
    }
    return inside ? -Math.sqrt(d) : Math.sqrt(d);
  };
  return { sdf, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] };
}
// makeHead's stars: five points, the top one up, inner corners at .44 of the radius.
function star(cx, cy, r) {
  const pts = []; for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5 + Math.PI / 2, rr = i % 2 ? r * .44 : r; pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return { ...polygon(pts), centre: [cx, cy] };
}
// A line of floss along a smooth curve through the points (the curve the old tubes followed), `r` its half width.
function cord(points, r) {
  const curve = new T.CatmullRomCurve3(points.map(([x, y]) => new T.Vector3(x, y, 0))), pts = curve.getPoints(Math.max(12, points.length * 6)).map(p => [p.x, p.y]);
  const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const total = len.at(-1), xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
  return { pts, len, r, total, box: [Math.min(...xs) - r, Math.min(...ys) - r, Math.max(...xs) + r, Math.max(...ys) + r] };
}

// ---- The face, as features in stitching order ---------------------------------------------------------------------
const browPoints = (side, lift) => [[side * .11, lift ? .19 : .172], [side * .19, lift ? .2 : .192], [side * .267, .17]];
const CREAM = lin('#fff2d7'), IRIS = lin('#51372d'), PUPIL = lin('#392625'), DARK = lin('#392625'), SMILE = lin('#8b5150');
// What every expression shares: the eyes with their stars, lids and lashes, and the seat of her nose.
function staticFeatures() {
  // Where her little stuffed nose is sewn on, the fabric round it is shaded, a little more below it.
  const list = [{ kind: 'seat', shape: ellipse(.01, -.087, .0367, .0278) }];
  for (const side of [-1, 1]) {
    const cx = side * .183;
    // Satin fills: their colour, how high the padding stands, the threads' direction (an angle, or radiating from a
    // point, the whites' from a point far below so they fan a little) and their spacing.
    list.push({ kind: 'satin', shape: ellipse(cx, .005, .126, .095), colour: CREAM, pad: .0018, radial: [cx, -.45, .455], pitch: .0042 });
    list.push({ kind: 'satin', shape: ellipse(cx + .017, .005, .077, .085), colour: IRIS, pad: .0027, radial: [cx + .017, .005, .066], pitch: .0036 });
    list.push({ kind: 'satin', shape: ellipse(cx + .021, .006, .048, .064), colour: PUPIL, pad: .0033, dir: .3, pitch: .0034 });
    list.push({ kind: 'satin', shape: star(cx + .003, .035, .027), colour: CREAM, pad: .0039, radial: [cx + .003, .035, .016], pitch: .0026 });
    list.push({ kind: 'satin', shape: star(cx + .047, -.014, .013), colour: CREAM, pad: .0037, radial: [cx + .047, -.014, .008], pitch: .0022 });
  }
  // Twisted floss: the lids over the eyes and three lashes at each outer corner.
  for (const side of [-1, 1]) {
    const cx = side * .183;
    list.push({ kind: 'floss', shape: cord([[cx - .12, .025], [cx - .06, .09], [cx + .04, .104], [cx + .119, .045]], .008), colour: DARK });
    for (let i = 0; i < 3; i++) { const lx = side * (.263 + i * .014); list.push({ kind: 'floss', shape: cord([[lx, .068 - i * .016], [lx + side * .035, .09 - i * .012]], .0052), colour: DARK }); }
  }
  return list;
}
// What changes with her expression (src/doll/face.js): the blush, the brows and the smile. None of these touches the
// shared features, so each expression is the shared face with these stitched over it.
function expressionFeatures(expression) {
  const x = EXPRESSIONS[expression] || EXPRESSIONS.smile, [opacity, colour, size] = x.blush, list = [];
  for (const side of [-1, 1]) list.push({ kind: 'blush', shape: ellipse(side * .265, -.155 + (size - 1) * .02, .092 * size, .047 * size), colour: lin(colour), opacity });
  for (const side of [-1, 1]) list.push({ kind: 'floss', shape: cord(browPoints(side, x.lift), .0095), colour: DARK });
  list.push({ kind: 'floss', shape: cord(SMILES[x.smile], .0072), colour: SMILE });
  return list;
}

// ---- Drawing -------------------------------------------------------------------------------------------------------
const { w: W, h: H } = FACE, N = W * H;
const toX = i => FACE.x0 + (i + .5) * PX, toY = j => FACE.y0 + (j + .5) * PY;
const range = (box, m) => [Math.max(0, Math.floor((box[0] - m - FACE.x0) / PX)), Math.max(0, Math.floor((box[1] - m - FACE.y0) / PY)), Math.min(W - 1, Math.ceil((box[2] + m - FACE.x0) / PX)), Math.min(H - 1, Math.ceil((box[3] + m - FACE.y0) / PY))];
// The fabric's nap at the same size as on the rest of her head (see plush.js: about 1075 nap pixels per unit there).
const NAP_SCALE = 1075 * PX, NAP_HEIGHT = .085 / 1075;
const RISE = .0032, SEAT = .0036, DIP = .0006, REACH = 6 * SEAT;

// The working layers: linear colour, height (head units), occlusion and roughness.
function fabric() {
  const col = new Float32Array(N * 3), hgt = new Float32Array(N), ao = new Float32Array(N).fill(1), rough = new Float32Array(N).fill(.92);
  const skin = lin(SKIN), nap = napHeight(), M = 255;
  for (let j = 0; j < H; j++) {
    const v = j * NAP_SCALE, v0 = v | 0, fv = v - v0, r0 = (v0 & M) * 256, r1 = ((v0 + 1) & M) * 256;
    for (let i = 0; i < W; i++) {
      const k = j * W + i, u = i * NAP_SCALE, u0 = u | 0, fu = u - u0, c0 = u0 & M, c1 = (u0 + 1) & M;
      const a = nap[r0 + c0], b = nap[r0 + c1], c = nap[r1 + c0], d = nap[r1 + c1];
      hgt[k] = (a + (b - a) * fu + (c - a) * fv + (a - b - c + d) * fu * fv) * NAP_HEIGHT;
      col[k * 3] = skin[0]; col[k * 3 + 1] = skin[1]; col[k * 3 + 2] = skin[2];
    }
  }
  return { col, hgt, ao, rough };
}
// Stitching, one kind of stitch per function so that each pixel loop reads only plain local values.
// A covering thread: its colour (shaded), the height of its top, and it is not in shadow; beside a thread, the fabric
// (or the layer below) is drawn down a little and shaded where the thread goes in.
function lay(L, k, r, g, b, shade, top, cover) {
  const col = L.col, i = k * 3;
  col[i] += (r * shade - col[i]) * cover; col[i + 1] += (g * shade - col[i + 1]) * cover; col[i + 2] += (b * shade - col[i + 2]) * cover;
  L.hgt[k] += (top - L.hgt[k]) * cover; L.ao[k] += (1 - L.ao[k]) * cover; L.rough[k] += (.55 - L.rough[k]) * cover;
}
function seat(L, k, d) { const e = Math.exp(-d / SEAT); L.hgt[k] -= DIP * e; L.ao[k] *= 1 - .38 * e; }
// Airbrushed into the pile: full strength over most of the cheek, then a soft, even fall to nothing. Dye in the pile
// reads paler than the old blush patch laid on top, so it is laid a little stronger.
function blush(L, f) {
  const box = f.shape.box, [cx, cy] = f.shape.centre, a = box[2] - cx, b = box[3] - cy, [i0, j0, i1, j1] = range(box, .05);
  const [r, g, bl] = f.colour, opacity = f.opacity, col = L.col;
  for (let j = j0; j <= j1; j++) { const v = (toY(j) - cy) / b; for (let i = i0; i <= i1; i++) {
    const u = (toX(i) - cx) / a, t = Math.min(.9, opacity * 1.45) * (1 - smooth(.72, 1.22, Math.sqrt(u * u + v * v)));
    if (t <= 0) continue; const k = (j * W + i) * 3;
    col[k] += (r - col[k]) * t; col[k + 1] += (g - col[k + 1]) * t; col[k + 2] += (bl - col[k + 2]) * t;
  } }
}
function nose(L, f) {
  const sdf = f.shape.sdf, cy = f.shape.centre[1], [i0, j0, i1, j1] = range(f.shape.box, .02), ao = L.ao;
  for (let j = j0; j <= j1; j++) { const y = toY(j), below = 1 + .5 * smooth(0, -.03, y - cy); for (let i = i0; i <= i1; i++) {
    const d = sdf(toX(i), y); if (d > 0) ao[j * W + i] *= 1 - .5 * Math.exp(-d / .0055) * below;
  } }
}
function satin(L, f) {
  const sdf = f.shape.sdf, [i0, j0, i1, j1] = range(f.shape.box, REACH), [r, g, b] = f.colour, pad = f.pad, pitch = f.pitch;
  const radial = !!f.radial, [rx, ry, rr] = f.radial || [0, 0, 0], sa = Math.sin(f.dir || 0), ca = Math.cos(f.dir || 0);
  // Radiating threads come round in a whole number, so there is no seam where the angle turns over.
  const count = radial ? Math.round(2 * Math.PI * rr / pitch) / (2 * Math.PI) : 0;
  for (let j = j0; j <= j1; j++) { const y = toY(j); for (let i = i0; i <= i1; i++) {
    const x = toX(i), k = j * W + i;
    let d = sdf(x, y);
    if (d > REACH) continue;
    if (d > PX) { seat(L, k, d); continue; }
    // Threads side by side: across them the surface ripples, and each catches the light a little differently.
    const ph = radial ? Math.atan2(y - ry, x - rx) * count : (-x * sa + y * ca) / pitch;
    // The thread ends make the edge of a fill very slightly uneven.
    const n = Math.floor(ph); d += ((((n * 7919) % 13) + 13) % 13 / 13 - .5) * .0006;
    if (d > 0) seat(L, k, d);
    const cover = clamp(.5 - d / PX); if (cover <= 0) continue;
    const inside = -d, wave = Math.sqrt(Math.abs(Math.sin(Math.PI * ph)));
    const shade = (1 + .06 * Math.sin(2 * Math.PI * ph)) * (.86 + .14 * smooth(0, RISE * .9, inside));
    lay(L, k, r, g, b, shade, pad * smooth(0, RISE, inside) + .00035 * (wave - .6), cover);
  } }
}
// A cord: each segment of its centre line marks the pixels near it with their distance, how far along the cord they
// lie and on which side; then each marked pixel is stitched once.
function floss(L, f) {
  const s = f.shape, [i0, j0, i1, j1] = range(s.box, REACH), bw = i1 - i0 + 1, bh = j1 - j0 + 1, [r, g, b] = f.colour, R = s.r, total = s.total;
  const dist = new Float32Array(bw * bh).fill(Infinity), along = new Float32Array(bw * bh), side = new Int8Array(bw * bh);
  const pts = s.pts, len = s.len, pad = R + REACH;
  for (let q = 1; q < pts.length; q++) {
    const ax = pts[q - 1][0], ay = pts[q - 1][1], ex = pts[q][0] - ax, ey = pts[q][1] - ay, l2 = ex * ex + ey * ey, l0 = len[q - 1], dl = len[q] - l0;
    const seg = range([Math.min(ax, ax + ex), Math.min(ay, ay + ey), Math.max(ax, ax + ex), Math.max(ay, ay + ey)], pad);
    const sj0 = Math.max(seg[1], j0), sj1 = Math.min(seg[3], j1), si0 = Math.max(seg[0], i0), si1 = Math.min(seg[2], i1);
    for (let j = sj0; j <= sj1; j++) { const wy = toY(j) - ay; for (let i = si0; i <= si1; i++) {
      const wx = toX(i) - ax, t = clamp((wx * ex + wy * ey) / l2), qx = wx - ex * t, qy = wy - ey * t, dd = Math.sqrt(qx * qx + qy * qy), c = (j - j0) * bw + (i - i0);
      if (dd < dist[c]) { dist[c] = dd; along[c] = l0 + t * dl; side[c] = ex * wy - ey * wx >= 0 ? 1 : -1; }
    } }
  }
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    const c = (j - j0) * bw + (i - i0), dc = dist[c]; if (dc === Infinity) continue;
    const k = j * W + i, rad = R * (.82 + .18 * Math.sqrt(Math.sin(Math.PI * clamp(along[c] / total)))), d = dc - rad;
    if (d > REACH) continue;
    if (d > 0) seat(L, k, d);
    const cover = clamp(.5 - d / PX); if (cover <= 0) continue;
    // A round cord half sunk in the fabric, its stitches slanting across it as stem stitch does.
    const across = clamp(dc / rad), round = Math.sqrt(1 - across * across), ph = (along[c] + side[c] * dc * 1.1) / (rad * 1.25), wave = Math.abs(Math.sin(Math.PI * ph));
    const shade = (1 + .08 * Math.sin(2 * Math.PI * ph)) * (.82 + .18 * round);
    lay(L, k, r, g, b, shade, rad * .55 * round + rad * .12 * (Math.pow(wave, .7) - .5) * round * round, cover);
  }
}
const STITCH = { blush, seat: nose, satin, floss };
function stitch(L, list) { for (const f of list) STITCH[f.kind](L, f); }
// Pack the layers into the three maps, over a box of pixels: colour (sRGB), normals from the heights (green along +y),
// and occlusion (red) with roughness (green).
function pack(L, out, [i0, j0, i1, j1] = [0, 0, W - 1, H - 1]) {
  const { col, hgt, ao, rough } = L, { colour, normal, orm } = out, sx = 1 / (2 * PX), sy = 1 / (2 * PY);
  for (let j = Math.max(0, j0); j <= Math.min(H - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(W - 1, i1); i++) {
    const k = j * W + i, o = k * 4;
    colour[o] = enc(col[k * 3]); colour[o + 1] = enc(col[k * 3 + 1]); colour[o + 2] = enc(col[k * 3 + 2]); colour[o + 3] = 255;
    const dx = (hgt[j * W + (i < W - 1 ? i + 1 : i)] - hgt[j * W + (i > 0 ? i - 1 : i)]) * sx, dy = (hgt[(j < H - 1 ? j + 1 : j) * W + i] - hgt[(j > 0 ? j - 1 : j) * W + i]) * sy;
    const l = 1 / Math.sqrt(dx * dx + dy * dy + 1);
    normal[o] = (-dx * l * 127.5 + 128) | 0; normal[o + 1] = (-dy * l * 127.5 + 128) | 0; normal[o + 2] = (l * 127.5 + 128) | 0; normal[o + 3] = 255;
    orm[o] = (255 * clamp(ao[k]) + .5) | 0; orm[o + 1] = (255 * clamp(rough[k]) + .5) | 0; orm[o + 2] = 0; orm[o + 3] = 255;
  }
}
// The shared face: its layers and its maps, drawn once.
let shared = null;
function sharedFace() {
  if (!shared) {
    const L = fabric(); stitch(L, staticFeatures());
    const out = { colour: new Uint8Array(N * 4), normal: new Uint8Array(N * 4), orm: new Uint8Array(N * 4) }; pack(L, out);
    shared = { L, out };
  }
  return shared;
}
// An expression: a copy of the shared layers with its features stitched in, and a copy of the shared maps repacked over
// the rows those features touch (one span of rows covers them all). The usual face is kept, as every doll starts with it.
let usual = null;
function drawFace(expression) {
  const { L, out } = sharedFace(), list = expressionFeatures(expression);
  const box = list.map(f => range(f.shape.box, f.kind === 'blush' ? .05 : REACH)).reduce((a, b) => [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[2], b[2]), Math.max(a[3], b[3])]);
  const rows = [box[1] - 1, box[3] + 1].map(v => Math.max(0, Math.min(H - 1, v)));
  const E = { col: L.col.slice(), hgt: L.hgt.slice(), ao: L.ao.slice(), rough: L.rough.slice() };
  stitch(E, list);
  const maps = { colour: out.colour.slice(), normal: out.normal.slice(), orm: out.orm.slice() };
  pack(E, maps, [0, rows[0], W - 1, rows[1]]);
  return maps;
}
const pixels = expression => {
  const e = EXPRESSIONS[expression] ? expression : 'smile';
  return e === 'smile' ? (usual ??= drawFace('smile')) : drawFace(e);
};
const dataTexture = (data, srgb) => { const t = new T.DataTexture(data, W, H, T.RGBAFormat); t.wrapS = t.wrapT = T.ClampToEdgeWrapping; if (srgb) t.colorSpace = T.SRGBColorSpace; t.channel = 1; return filtered(t); };
// The face's maps for an expression. They read the head's second uv set (uv1), the projection along z.
export function faceMaps(expression = 'smile') {
  const p = pixels(expression);
  return { map: dataTexture(p.colour, true), normalMap: dataTexture(p.normal, false), orm: dataTexture(p.orm, false) };
}
// Restitch the face for another expression, in place.
export function restitch(maps, expression) {
  const p = pixels(expression);
  for (const [key, data] of [['map', p.colour], ['normalMap', p.normal], ['orm', p.orm]]) { maps[key].image.data = data; maps[key].needsUpdate = true; }
}
// Where a point of her head lands on the face's maps.
export const faceUv = (x, y) => [(x - FACE.x0) / (FACE.x1 - FACE.x0), (y - FACE.y0) / (FACE.y1 - FACE.y0)];
