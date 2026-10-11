// Hair in the wind (the user's choice, 11 October 2026): on a windy day her loose hair (a ponytail, long lengths, the
// locks framing her face, a plait) leans with the wind and flutters. The part of the hair nearest where it is tied or
// grows stays still, and the ends move most. The wind blows across the page from left to right, as the gusts do
// (src/today/sky.js), whichever way she is turned. Only the hair moves; it is set back exactly when the wind drops.
import * as T from 'three';

// The hair that hangs free, and the ties on it (a plait's tie moves with the plait; a ponytail's stays at its root).
const LOOSE = /^(ponytail|v-shaped-lengths|face-framing-lock|braid|hair-tie)/;
export const GUST = .045;

// How much a point of loose hair moves (0 at its root, 1 at its ends) and where to, for a wind blowing along
// `dir` (head space, horizontal) at time t (seconds): a lean with the wind, a flutter along it and a little across.
// Hair is never pushed in towards her (the axis she stands on, x = z = 0): what would push it in is taken away, so a
// wind from behind leaves the hair down her back where it is and a wind from the side sways it.
export function windOffset(s, t, y, dir, strength = 1, out = new T.Vector3(), x = 0, z = 0) {
  const k = Math.max(0, Math.min(1, s)), lean = GUST * strength * k ** 1.6;
  const along = lean * (.65 + .35 * Math.sin(t * 2.3 + y * 3.1)), across = GUST * strength * .25 * k * Math.sin(t * 1.7 + y * 2.2);
  out.set(dir.x * along - dir.z * across, 0, dir.z * along + dir.x * across);
  const r = Math.hypot(x, z);
  if (r > 1e-6) { const inward = (out.x * x + out.z * z) / r; if (inward < 0) { out.x -= inward * x / r; out.z -= inward * z / r; } }
  return out;
}

// The wind on one hairstyle (the group makeHair builds, attached to her head). update(t, dir, strength) moves the
// loose hair; calm() puts it back. To pose the hair again: calm(), pose it, then refresh().
export function createWind(group) {
  let parts = [], top = 0, span = 1, moved = false;
  const v = new T.Vector3(), d = new T.Vector3();
  const refresh = () => {
    parts = []; moved = false;
    group?.updateMatrix();
    let hi = -Infinity, lo = Infinity;
    for (const mesh of group?.children || []) {
      if (!mesh.isMesh || !LOOSE.test(mesh.name)) continue;
      mesh.updateMatrix();
      const rigid = !mesh.matrix.equals(new T.Matrix4()), position = mesh.geometry.attributes.position;
      const rest = rigid ? mesh.position.clone() : Float32Array.from(position.array);
      if (rigid) { hi = Math.max(hi, mesh.position.y); lo = Math.min(lo, mesh.position.y); }
      else for (let i = 1; i < rest.length; i += 3) { hi = Math.max(hi, rest[i]); lo = Math.min(lo, rest[i]); }
      parts.push({ mesh, rigid, rest });
    }
    top = hi; span = Math.max(.2, hi - lo);
  };
  function calm() {
    if (!moved) return;
    for (const { mesh, rigid, rest } of parts) {
      if (rigid) mesh.position.copy(rest);
      else { mesh.geometry.attributes.position.array.set(rest); mesh.geometry.attributes.position.needsUpdate = true; }
    }
    moved = false;
  }
  refresh();
  return {
    get active() { return parts.length > 0; },
    update(t, dir, strength = 1) {
      if (!parts.length) return false;
      for (const { mesh, rigid, rest } of parts) {
        if (rigid) { windOffset((top - rest.y) / span, t, rest.y, dir, strength, d, rest.x, rest.z); mesh.position.copy(rest).add(d); continue; }
        const position = mesh.geometry.attributes.position, a = position.array;
        for (let i = 0; i < a.length; i += 3) {
          v.fromArray(rest, i);
          windOffset((top - v.y) / span, t, v.y, dir, strength, d, v.x, v.z);
          a[i] = v.x + d.x; a[i + 1] = v.y; a[i + 2] = v.z + d.z;
        }
        position.needsUpdate = true;
      }
      moved = true;
      return true;
    },
    calm, refresh,
  };
}
