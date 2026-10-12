// Her stance: a resting pose, and an attitude for each of the day's three looks (the user's choice, 11 October 2026).
// Her pick has the resting pose: a slight shift of weight (her hips eased to one side, her chest back over them), her
// left foot turned out a little, her hands a little forward and away from her sides. The bolder look pops her hip,
// sets her feet apart, lifts one shoulder and raises her chin; the easier look rests her weight the other way, her
// feet together and her hands softly forward, her head tilted gently.
//
// The body, hair and clothes are posed by one smooth deformation, applied after the outfit is fitted
// (src/doll/view.js): every garment is fitted to the still body, so nothing is posed by moving limbs, and whatever lies
// at a point moves with that point. The field is gentle and changes slowly, more slowly than any gap between her and
// her clothes, so a sleeve and the arm inside it move together and nothing new shows through. Her head is left out of
// the field (her face and hair stay as made) and is tilted and turned as a whole instead (headPose).
//
// Each geometry keeps its unposed shape (REST, by geometry), so she can be posed again in another attitude without the
// poses adding up. It is kept by geometry rather than in the geometry's userData, which a cloned geometry shares with its
// original: twelve lobes of a plait cloned from one sphere would otherwise all be posed back into the first lobe.
import * as T from 'three';

const smooth = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
// sway: the hips' shift (to the viewer's right); foot: the left foot's turn out, in degrees; hands and out: the hands
// forward and away; spread: the feet apart (or together, below zero); shoulder: the left shoulder lifted; tilt, turn
// and nod: her head, as radians added to its own tilt, a turn to the viewer's right, and a nod down.
export const ATTITUDES = {
  pick: { sway: .03, foot: 10, hands: .04, out: .015, spread: 0, shoulder: 0, tilt: 0, turn: 0, nod: 0 },
  bolder: { sway: .06, foot: 18, hands: .015, out: .035, spread: .03, shoulder: .02, tilt: -.06, turn: -.09, nod: -.055 },
  easier: { sway: -.03, foot: 4, hands: .06, out: .006, spread: -.01, shoulder: 0, tilt: .065, turn: .07, nod: .045 },
};
export const attitudeOf = name => ATTITUDES[name] || ATTITUDES.pick;
// Older names, for the resting pose.
export const SWAY = ATTITUDES.pick.sway, FOOT_TURN = ATTITUDES.pick.foot * Math.PI / 180, HANDS = ATTITUDES.pick.hands;
// Her head's centre and size in her body's space: inside it the field is nothing.
const HEAD = new T.Vector3(0, 1.874, 0);

// The field at a point in her body's space (feet at y = 0, hips near .8, shoulders near 1.4, facing +z). Moves the
// point, and turns the normal with it where the field turns.
export function posePoint(p, n = null, a = ATTITUDES.pick) {
  const { x, y, z } = p;
  const free = smooth(.5, .62, p.distanceTo(HEAD));
  if (!free) return p;
  // Weight shift: the hips ease to one side, the chest comes back over them.
  const hips = smooth(.3, .85, y) * (1 - smooth(.85, 1.45, y));
  let nx = x + a.sway * hips * free, ny = y, nz = z;
  // The feet apart or together, from the hips down, each leg to its own side.
  const legs = 1 - smooth(.55, .95, y);
  nx += a.spread * legs * Math.sign(x) * smooth(0, .08, Math.abs(x)) * free;
  // Her left foot (the viewer's left) turns out, from the knee down, about its own ankle.
  const foot = (1 - smooth(.3, .75, y)) * smooth(0, -.16, x) * free;
  if (foot > 0) {
    const ang = a.foot * Math.PI / 180 * foot, c = Math.cos(ang), s = Math.sin(ang), px = -.17, pz = .02, dx = nx - px, dz = nz - pz;
    nx = px + dx * c - dz * s; nz = pz + dx * s + dz * c;
    if (n) { const vx = n.x, vz = n.z; n.x = vx * c - vz * s; n.z = vx * s + vz * c; }
  }
  // Hands forward and out, the sleeves with them.
  const arm = smooth(.12, .42, Math.abs(x)) * smooth(.6, .95, y) * (1 - smooth(1.15, 1.5, y)) * free;
  nz += a.hands * arm; nx += Math.sign(x) * a.out * arm;
  // Her left shoulder lifted, and the arm under it.
  ny += a.shoulder * smooth(.95, 1.35, y) * (1 - smooth(1.55, 1.75, y)) * smooth(-.05, -.3, x) * free;
  p.set(nx, ny, nz);
  return p;
}

// Her head's turn for an attitude: rotations to set on the doll's head (its own tilt is -.105 about z).
export function headPose(a = ATTITUDES.pick) { return { x: a.nod, y: a.turn, z: -.105 + a.tilt }; }

// Her head's own parts (her face, ears and the original bob) are never posed: the head turns as a whole. Styled hair
// on the head is posed, so a braid in front of her shoulder moves with the sleeve under it.
function ownHead(o) {
  for (let p = o; p; p = p.parent) { if (p.name === 'outfit-hair') return false; if (p.name === 'doll-head') return true; }
  return false;
}

// Pose everything under `object` in an attitude. Points are taken in `frame`'s space (the group that holds her and
// her clothes, in her world's units: not the wardrobe's own group, which is scaled to her toy proportions), less
// `offsetY` (the lift her shoes give her, so the field sees her body where it stands). Each geometry is posed from its
// unposed shape; a geometry shared by two objects is copied for the second, so each is posed in its own place.
const REST = new WeakMap();
export function pose(object, frame = object, offsetY = 0, attitude = ATTITUDES.pick) {
  frame.updateMatrixWorld(true);
  const base = new T.Matrix4().copy(frame.matrixWorld).invert(), rel = new T.Matrix4(), back = new T.Matrix4(), normals = new T.Matrix3(), normalsBack = new T.Matrix3();
  const v = new T.Vector3(), n = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(), m = new T.Matrix4(), seen = new Set();
  object.traverse(o => {
    const g = o.geometry; if (!g?.attributes?.position || ownHead(o)) return;
    rel.multiplyMatrices(base, o.matrixWorld); back.copy(rel).invert();
    if (o.isInstancedMesh) {
      // getMatrixAt fills the matrix it is given and returns nothing.
      const rest = o.userData.restMatrices ??= Array.from({ length: o.count }, (_, i) => { const r = new T.Matrix4(); o.getMatrixAt(i, r); return r; });
      for (let i = 0; i < o.count; i++) {
        m.copy(rest[i]).decompose(v, q, s);
        v.applyMatrix4(rel); v.y -= offsetY; posePoint(v, null, attitude); v.y += offsetY; v.applyMatrix4(back);
        o.setMatrixAt(i, m.compose(v, q, s));
      }
      o.instanceMatrix.needsUpdate = true; return;
    }
    if (seen.has(g)) {
      const copy = g.clone(), was = REST.get(g); copy.userData = {};
      if (was) { copy.attributes.position.array.set(was.p); if (was.n) copy.attributes.normal?.array.set(was.n); }
      o.geometry = copy;
    }
    seen.add(o.geometry);
    const position = o.geometry.attributes.position, normal = o.geometry.attributes.normal;
    let rest = REST.get(o.geometry);
    if (!rest) REST.set(o.geometry, rest = { p: Float32Array.from(position.array), n: normal ? Float32Array.from(normal.array) : null });
    if (normal) { normals.getNormalMatrix(rel); normalsBack.getNormalMatrix(back); }
    for (let i = 0; i < position.count; i++) {
      v.fromArray(rest.p, i * 3).applyMatrix4(rel); v.y -= offsetY;
      if (normal) { n.fromArray(rest.n, i * 3).applyMatrix3(normals); posePoint(v, n, attitude); n.applyMatrix3(normalsBack).normalize(); normal.setXYZ(i, n.x, n.y, n.z); }
      else posePoint(v, null, attitude);
      v.y += offsetY; v.applyMatrix4(back); position.setXYZ(i, v.x, v.y, v.z);
    }
    position.needsUpdate = true; if (normal) normal.needsUpdate = true;
    o.geometry.computeBoundingSphere(); o.geometry.boundingBox = null;
  });
  return object;
}
