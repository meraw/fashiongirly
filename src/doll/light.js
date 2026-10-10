// The light of her painted world. The scenery (scripts/art/paint-scenery.py) has its low sun to the right, a purple
// sky above, apricot at the horizon and an orange ground, so the 3D light follows it: a warm key from the right, a
// lilac fill from the left, a rim from the sky behind her, and the ground's warmth bouncing up under her. A small
// environment in the same colours is what leather, metal, hair and skin reflect, so every material answers the same
// world. The lights follow the weather, as the painted mountains do: cooler and dimmer in rain, flat and pale in snow.
import * as T from 'three';

// Each weather: [sky colour, ground colour, intensity] for the hemisphere, [colour, intensity] for the key, fill and
// rim, and how strongly the environment lights her. The sky's kinds are those of src/today/sky.js.
export const MOODS = {
  sun: { hemi: ['#f3c4b0', '#b86a3f', 1.5], key: ['#ffd3a6', 3], fill: ['#c7b0e6', 1], rim: ['#ffb07a', 1.5], env: .55 },
  partly: { hemi: ['#e9bfc0', '#b06a44', 1.6], key: ['#ffdcb8', 2.5], fill: ['#c9b6e6', 1.1], rim: ['#ffc08e', 1.3], env: .5 },
  cloud: { hemi: ['#d8ccdf', '#8d6756', 2], key: ['#f3e8e4', 1.5], fill: ['#cfc3e2', 1.3], rim: ['#e9d6dc', .9], env: .42 },
  rain: { hemi: ['#b8acd0', '#6a4f58', 1.9], key: ['#e4ddf0', 1.1], fill: ['#b9aad6', 1.4], rim: ['#d8ccec', .8], env: .35 },
  'heavy-rain': { hemi: ['#8e82aa', '#4e3a48', 1.8], key: ['#d4cce6', .8], fill: ['#9f90c2', 1.3], rim: ['#c3b6dc', .7], env: .28 },
  snow: { hemi: ['#ece6f6', '#cfc4e6', 2.4], key: ['#fff8ff', 1.7], fill: ['#dcd3ee', 1.3], rim: ['#ffffff', 1.1], env: .5 },
  fog: { hemi: ['#e4dbe6', '#b8a9b4', 2.2], key: ['#f6eef2', 1.2], fill: ['#d9cfe0', 1.3], rim: ['#ece2ea', .6], env: .4 },
};
MOODS.none = MOODS.sun;
export const moodFor = kind => MOODS[kind] || MOODS.none;

// The painted sky as a sphere of colour around her, from the night at the top through plum and rose to apricot at
// the horizon, the orange ground below, and the sun low on the right: the same stops as the painting.
const SKY = [[0, '#1a0a36'], [.14, '#2b1352'], [.3, '#46206e'], [.44, '#6e2f82'], [.55, '#9c4482'], [.64, '#c95a76'], [.72, '#e8775a'], [.8, '#f59a62'], [.9, '#f8bd84'], [1, '#fbd5a6']];
const GROUND = [[0, '#c9784a'], [.5, '#8a4a2a'], [1, '#4a2416']];
function ramp(stops, t) {
  t = Math.max(0, Math.min(1, t));
  let i = 1; while (i < stops.length - 1 && stops[i][0] < t) i++;
  const [t0, a] = stops[i - 1], [t1, b] = stops[i];
  return new T.Color(a).lerp(new T.Color(b), (t - t0) / (t1 - t0));
}
function skyEnvironment() {
  const scene = new T.Scene(), geometry = new T.SphereGeometry(50, 48, 32), position = geometry.attributes.position, colours = [];
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i) / 50;
    // The horizon sits a little below eye level, so most of what she reflects is sky.
    const c = y > -.04 ? ramp(SKY, (1 - y) / 1.04) : ramp(GROUND, (-.04 - y) / .96);
    colours.push(c.r, c.g, c.b);
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colours, 3));
  scene.add(new T.Mesh(geometry, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, toneMapped: false })));
  // The sun: small, low and to the right, bright beyond white so it shows as a highlight on glossy things.
  const sun = new T.Mesh(new T.SphereGeometry(3.2, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(7, 4.6, 2.6), toneMapped: false }));
  sun.position.set(30, 11, 24); scene.add(sun);
  const glow = new T.Mesh(new T.SphereGeometry(7, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(1.6, .9, .55), transparent: true, opacity: .5, toneMapped: false }));
  glow.position.copy(sun.position); scene.add(glow);
  return scene;
}

// A soft, dark pool under her feet: the shadow of a doll standing on painted ground, which the shadow map alone
// cannot give (its edges are hard and it lifts off where her soles curve).
function contactShadow() {
  const n = 64, data = new Uint8Array(n * n * 4);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (x + .5) / n * 2 - 1, dy = (y + .5) / n * 2 - 1, a = Math.max(0, 1 - Math.hypot(dx, dy)), i = (y * n + x) * 4;
    data[i] = 52; data[i + 1] = 24; data[i + 2] = 48; data[i + 3] = Math.round(255 * a * a);
  }
  const texture = new T.DataTexture(data, n, n, T.RGBAFormat); texture.needsUpdate = true; texture.colorSpace = T.SRGBColorSpace;
  const pool = new T.Mesh(new T.PlaneGeometry(1.6, 1.15), new T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, opacity: .55 }));
  pool.rotation.x = -Math.PI / 2; pool.position.set(0, .006, .03); pool.renderOrder = -1; pool.name = 'contact-shadow';
  return pool;
}

// Light the scene. Returns the key light (the only one casting a shadow), a way to follow the weather, and disposal.
export function lightScene(scene, renderer) {
  const hemi = new T.HemisphereLight(), key = new T.DirectionalLight(), fill = new T.DirectionalLight(), rim = new T.DirectionalLight();
  key.position.set(2.6, 3.4, 2.6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: .1, far: 12 }); key.shadow.normalBias = .022; key.shadow.bias = -.0002;
  fill.position.set(-3.2, 1.6, 2.4); rim.position.set(-1.2, 2.6, -3);
  scene.add(hemi, key, fill, rim);
  // Her shadow on the ground, in the plum of the painting's shadows, and the pool under her feet.
  const floor = new T.Mesh(new T.PlaneGeometry(20, 20), new T.ShadowMaterial({ opacity: .32, color: '#3b1a3a' }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = .003; floor.name = 'floor';
  const pool = contactShadow(); scene.add(floor, pool);
  const pmrem = new T.PMREMGenerator(renderer), world = skyEnvironment(), environment = pmrem.fromScene(world, .035);
  world.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); }); pmrem.dispose();
  scene.environment = environment.texture;
  let kind = null;
  const setWeather = next => {
    const mood = moodFor(next); if (mood === moodFor(kind) && kind !== null) return false; kind = next;
    hemi.color.set(mood.hemi[0]); hemi.groundColor.set(mood.hemi[1]); hemi.intensity = mood.hemi[2];
    for (const [light, [colour, intensity]] of [[key, mood.key], [fill, mood.fill], [rim, mood.rim]]) { light.color.set(colour); light.intensity = intensity; }
    scene.environmentIntensity = mood.env;
    return true;
  };
  setWeather('none');
  return {
    key, setWeather,
    dispose() { scene.environment = null; environment.dispose(); key.shadow.map?.dispose(); floor.geometry.dispose(); floor.material.dispose(); pool.geometry.dispose(); pool.material.map.dispose(); pool.material.dispose(); },
  };
}
