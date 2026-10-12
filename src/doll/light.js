// The light of her painted world. Each world's paintings (scripts/art/paint-scenery.py) have their sun to the right,
// so the 3D light follows them: a key from the right in the colour of the world's light at this hour (warm at the
// golden hours, white by day, moonlit blue by night), a fill from the left, a rim from the sky behind her, and the
// ground's colour bouncing up under her. A small environment painted from the world's own sky at this hour is what
// leather, metal, hair and skin reflect, so every material answers the same world. The weather is laid over that, as
// it is over the painting: cooler, greyer and dimmer in rain, flat and pale in snow.
import * as T from 'three';
import { DEFAULT_WORLD, lightColours, skyColour, groundColour } from '../today/world.js';

// Each weather: how much of the key, fill and rim light gets through, how strong the sky's light (hemisphere) and
// reflections are, and how far every colour goes towards the weather's own grey. The sky's kinds are those of
// src/today/sky.js.
export const MOODS = {
  sun: { key: 1, fill: 1, rim: 1, hemi: 1, env: 1, grey: 0, tint: '#ffffff' },
  partly: { key: .82, fill: 1.05, rim: .9, hemi: 1.05, env: .95, grey: .12, tint: '#f4ecf2' },
  cloud: { key: .48, fill: 1.15, rim: .6, hemi: 1.25, env: .8, grey: .42, tint: '#e2dbe6' },
  rain: { key: .36, fill: 1.2, rim: .55, hemi: 1.2, env: .66, grey: .55, tint: '#c9c2dc' },
  'heavy-rain': { key: .26, fill: 1.1, rim: .5, hemi: 1.1, env: .52, grey: .62, tint: '#aaa2c4' },
  snow: { key: .6, fill: 1.2, rim: .8, hemi: 1.45, env: .9, grey: .5, tint: '#f1effa' },
  fog: { key: .42, fill: 1.2, rim: .45, hemi: 1.4, env: .75, grey: .6, tint: '#ece6ee' },
};
MOODS.none = MOODS.sun;
export const moodFor = kind => MOODS[kind] || MOODS.none;
const NOON = { golden: 0, day: 1, night: 0, dawn: false };
const BOUNCE = new T.Color('#f4e4d6');
// Full strength of each light: by day, at the golden hours and by night (moonlight is dim and blue).
const STRENGTH = { key: [2.8, 3, .9], fill: [1.1, 1, .7], rim: [1.2, 1.6, .8], hemi: [1.5, 1.4, .75], env: [.55, .55, .32] };

// The world's sky at this hour as a sphere of colour around her, its ground below, and the sun low on the right
// (bright beyond white so it shows as a highlight on glossy things), or the moon by night.
function skyEnvironment(world, weights) {
  const scene = new T.Scene(), geometry = new T.SphereGeometry(50, 48, 32), position = geometry.attributes.position, colours = [];
  for (let i = 0; i < position.count; i++) {
    const y = position.getY(i) / 50;
    // The horizon sits a little below eye level, so most of what she reflects is sky.
    const c = y > -.04 ? skyColour(world, (1 - y) / 1.04, weights) : groundColour(world, (-.04 - y) / .96).map(v => v * (.45 + .55 * (1 - weights.night)));
    colours.push(...new T.Color().setRGB(...c, T.SRGBColorSpace).toArray());
  }
  geometry.setAttribute('color', new T.Float32BufferAttribute(colours, 3));
  scene.add(new T.Mesh(geometry, new T.MeshBasicMaterial({ vertexColors: true, side: T.BackSide, toneMapped: false })));
  const lit = weights.day + weights.golden;
  if (lit > .05) {
    const warm = weights.golden / lit, sun = new T.Mesh(new T.SphereGeometry(3.2, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(7, 4.6 + 1.6 * (1 - warm), 2.6 + 3 * (1 - warm)).multiplyScalar(lit), toneMapped: false }));
    sun.position.set(30, 11 + 22 * (1 - warm), 24); scene.add(sun);
  } else {
    const moon = new T.Mesh(new T.SphereGeometry(2.2, 24, 16), new T.MeshBasicMaterial({ color: new T.Color(2.2, 2.3, 2.8), toneMapped: false }));
    moon.position.set(-24, 22, 26); scene.add(moon);
  }
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

// Light the scene. Returns the key light (the only one casting a shadow), a way to follow the world, the time of day
// and the weather, and disposal.
export function lightScene(scene, renderer) {
  const hemi = new T.HemisphereLight(), key = new T.DirectionalLight(), fill = new T.DirectionalLight(), rim = new T.DirectionalLight();
  // Her shadows are finely resolved and barely lifted off the surfaces that cast them (a small normal bias), so a
  // flower, a fringe or a nose shades what it touches; and a little open, as under a soft key light with a fill,
  // so the plush in shadow keeps its colour instead of going black.
  key.position.set(2.6, 3.4, 2.6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
  Object.assign(key.shadow.camera, { left: -2, right: 2, top: 3, bottom: -1, near: .1, far: 12 }); key.shadow.normalBias = .006; key.shadow.bias = -.0004; key.shadow.intensity = .75;
  fill.position.set(-3.2, 1.6, 2.4); rim.position.set(-1.2, 2.6, -3);
  scene.add(hemi, key, fill, rim);
  // Her shadow on the ground, in the plum of the painting's shadows, and the pool under her feet.
  // (as dark as it always was on the ground: its opacity makes up for the open shadow above).
  const floor = new T.Mesh(new T.PlaneGeometry(20, 20), new T.ShadowMaterial({ opacity: .32 / .75, color: '#3b1a3a' }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.position.y = .003; floor.name = 'floor';
  const pool = contactShadow(); scene.add(floor, pool);
  const pmrem = new T.PMREMGenerator(renderer);
  let environment = null, envKey = null, state = { kind: 'none', world: DEFAULT_WORLD, weights: NOON }, applied = null;
  // The reflections are repainted only when the world or the hour has changed enough to see.
  const reflect = () => {
    const w = state.weights, k = `${state.world}|${Math.round(w.golden * 4)},${Math.round(w.day * 4)},${Math.round(w.night * 4)}`;
    if (k === envKey) return;
    const world = skyEnvironment(state.world, w), next = pmrem.fromScene(world, .035);
    world.traverse(o => { o.geometry?.dispose(); o.material?.dispose(); });
    environment?.dispose(); environment = next; envKey = k; scene.environment = environment.texture;
  };
  const apply = () => {
    const { kind, world, weights: w } = state, k = `${kind}|${world}|${w.golden},${w.day},${w.night}`;
    if (k === applied) return false; applied = k;
    const mood = moodFor(kind), colours = lightColours(world), tint = new T.Color(mood.tint);
    const blend = (strength) => strength[0] * w.day + strength[1] * w.golden + strength[2] * w.night;
    const grey = c => c.lerp(tint, mood.grey);
    // The key: the world's light at this hour; the fill and rim keep the world's own colours, dimmed at night.
    const keyColour = new T.Color(colours.day).multiplyScalar(w.day).add(new T.Color(colours.golden).multiplyScalar(w.golden)).add(new T.Color(colours.night).multiplyScalar(w.night));
    key.color.copy(grey(keyColour)); key.intensity = blend(STRENGTH.key) * mood.key;
    fill.color.copy(grey(new T.Color(colours.fill))); fill.intensity = blend(STRENGTH.fill) * mood.fill;
    rim.color.copy(grey(new T.Color(colours.rim).lerp(new T.Color(colours.night), w.night))); rim.intensity = blend(STRENGTH.rim) * mood.rim;
    hemi.color.copy(grey(new T.Color().setRGB(...skyColour(world, .55, w), T.SRGBColorSpace)));
    // The ground's warmth bounces up under her, softened as a photographer's bounce card would soften it, so the
    // underside of her face and clothes is warm and open rather than muddy.
    hemi.groundColor.copy(grey(new T.Color().setRGB(...groundColour(world, .3), T.SRGBColorSpace).lerp(BOUNCE, .35).multiplyScalar(.5 + .5 * (1 - w.night))));
    hemi.intensity = blend(STRENGTH.hemi) * mood.hemi;
    scene.environmentIntensity = blend(STRENGTH.env) * mood.env;
    reflect();
    return true;
  };
  apply();
  return {
    key,
    // The weather (a kind from src/today/sky.js), the world and its time of day (src/today/world.js). Each call
    // changes only what it names; returns whether anything changed, so the view knows to draw her again.
    setWeather(kind) { state = { ...state, kind: kind || 'none' }; return apply(); },
    setWorld(world, weights) { state = { ...state, world: world || DEFAULT_WORLD, weights: weights || NOON }; return apply(); },
    dispose() { scene.environment = null; environment?.dispose(); pmrem.dispose(); key.shadow.map?.dispose(); floor.geometry.dispose(); floor.material.dispose(); pool.geometry.dispose(); pool.material.map.dispose(); pool.material.dispose(); },
  };
}
