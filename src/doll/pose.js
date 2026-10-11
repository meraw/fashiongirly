// A resting pose for the doll: a slight shift of weight (her hips eased to one side, her chest back over them), her
// left foot turned out a little, and her hands a little forward and away from her sides. It is one smooth
// deformation of her and her clothes together, applied after the outfit is fitted (src/doll/view.js): every garment
// is fitted to the still body, so nothing is posed by moving limbs, and whatever lies at a point moves with that
// point, body, clothes and hair alike. The field is gentle and changes slowly, more slowly than any gap between
// her and her clothes, so a sleeve and the arm inside it move together and nothing new shows through.
import * as T from 'three';

const smooth = (a, b, t) => { const x = Math.max(0, Math.min(1, (t - a) / (b - a))); return x * x * (3 - 2 * x); };
export const SWAY = .03, FOOT_TURN = 10 * Math.PI / 180, HANDS = .04;

// The field at a point in her body's space (feet at y = 0, hips near .8, shoulders near 1.4, facing +z). Moves the
// point, and turns the normal with it where the field turns.
export function posePoint(p, n = null) {
  const { x, y, z } = p;
  // Weight shift: the hips ease to her left (the viewer's right), the chest comes back over them.
  const hips = smooth(.3, .85, y) * (1 - smooth(.85, 1.45, y));
  let nx = x + SWAY * hips, nz = z;
  // Her left foot (the viewer's left) turns out, from the knee down, about its own ankle.
  const foot = (1 - smooth(.3, .75, y)) * smooth(0, -.16, x);
  if (foot > 0) {
    const a = FOOT_TURN * foot, c = Math.cos(a), s = Math.sin(a), px = -.17, pz = .02, dx = nx - px, dz = nz - pz;
    nx = px + dx * c - dz * s; nz = pz + dx * s + dz * c;
    if (n) { const vx = n.x, vz = n.z; n.x = vx * c - vz * s; n.z = vx * s + vz * c; }
  }
  // Hands a little forward and out, the sleeves with them.
  const arm = smooth(.12, .42, Math.abs(x)) * smooth(.6, .95, y) * (1 - smooth(1.15, 1.5, y));
  nz += HANDS * arm; nx += Math.sign(x) * .015 * arm;
  p.set(nx, y, nz);
  return p;
}

// Pose everything under `object`. Points are taken in `frame`'s space (the group that holds her and her clothes, in
// her world's units: not the wardrobe's own group, which is scaled to her toy proportions), less `offsetY` (the lift
// her shoes give her, so the field sees her body where it stands). A geometry shared by two objects is cloned for the
// second, so each is posed in its own place.
export function pose(object, frame = object, offsetY = 0) {
  frame.updateMatrixWorld(true);
  const base = new T.Matrix4().copy(frame.matrixWorld).invert(), rel = new T.Matrix4(), back = new T.Matrix4(), normals = new T.Matrix3(), normalsBack = new T.Matrix3();
  const v = new T.Vector3(), n = new T.Vector3(), q = new T.Quaternion(), s = new T.Vector3(), seen = new Set();
  object.traverse(o => {
    const g = o.geometry; if (!g?.attributes?.position) return;
    rel.multiplyMatrices(base, o.matrixWorld); back.copy(rel).invert();
    if (o.isInstancedMesh) {
      const m = new T.Matrix4();
      for (let i = 0; i < o.count; i++) {
        o.getMatrixAt(i, m); m.decompose(v, q, s);
        v.applyMatrix4(rel); v.y -= offsetY; posePoint(v); v.y += offsetY; v.applyMatrix4(back);
        o.setMatrixAt(i, m.compose(v, q, s));
      }
      o.instanceMatrix.needsUpdate = true; return;
    }
    if (seen.has(g)) o.geometry = g.clone();
    seen.add(o.geometry);
    const position = o.geometry.attributes.position, normal = o.geometry.attributes.normal;
    if (normal) { normals.getNormalMatrix(rel); normalsBack.getNormalMatrix(back); }
    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i).applyMatrix4(rel); v.y -= offsetY;
      if (normal) { n.fromBufferAttribute(normal, i).applyMatrix3(normals); posePoint(v, n); n.applyMatrix3(normalsBack).normalize(); normal.setXYZ(i, n.x, n.y, n.z); }
      else posePoint(v);
      v.y += offsetY; v.applyMatrix4(back); position.setXYZ(i, v.x, v.y, v.z);
    }
    position.needsUpdate = true; if (normal) normal.needsUpdate = true;
    o.geometry.computeBoundingSphere(); o.geometry.boundingBox = null;
  });
  return object;
}
