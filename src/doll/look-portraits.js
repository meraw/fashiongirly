// Local portraits of already revealed looks. One small renderer, serial jobs, no outfit generation or live-view changes.
import * as T from 'three';
import { makeDoll, makeOutfit, fitDoll, disposeObject, setExpression } from './model.js';
import { createHairController } from '../hair/model.js';
import { textureModule } from './view.js';
import { lightScene } from './light.js';
import { createOcclusion } from './occlusion.js';
import { finish } from './finish.js';
import { pose, attitudeOf, headPose } from './pose.js';
import { expressionFor } from './face.js';

export function createLookPortraits(doc) {
  let renderer = null, scene, light, occlusion, closed = false, queue = Promise.resolve();
  function init() {
    if (renderer) return;
    // Drawn as the live view draws her (occlusion.js): antialiased in its own picture, then copied with the occlusion.
    renderer = new T.WebGLRenderer({ antialias: false, alpha: true, depth: false, preserveDrawingBuffer: true });
    renderer.setSize(240, 280); renderer.setPixelRatio(1); renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = T.SRGBColorSpace; renderer.toneMapping = T.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap;
    scene = new T.Scene(); light = lightScene(scene, renderer); occlusion = createOcclusion(renderer);
    // Enough detail for a small photograph without another full-size shadow map on a phone.
    light.key.shadow.mapSize.set(512, 512);
  }
  async function photograph(recipe, key) {
    if (closed) return null;
    const atlas = {}, loaded = [];
    let model = null, hair = null;
    try {
      const ids = [...new Set([recipe.topId, recipe.underTopId, recipe.bottomId, recipe.dressId, recipe.shoesId, recipe.outerwearId])];
      for (const id of ids) {
        const mod = textureModule(id); if (!mod) continue;
        // Modules have the same relative location as view.js. A failed print must not produce a misleading portrait.
        const data = (await import(mod[0]))[mod[1]], texture = await new T.TextureLoader().loadAsync(data);
        texture.colorSpace = T.SRGBColorSpace; loaded.push(texture); atlas[id] = texture;
      }
      if (closed) return null;
      init();
      const root = doc.documentElement, weights = root.dataset.weights?.split(',').map(Number);
      if (root.dataset.world && weights?.length === 3) light.setWorld(root.dataset.world, { golden: weights[0], day: weights[1], night: weights[2], dawn: root.dataset.dawn === 'true' });
      const sky = doc.getElementById('sky'); light.setWeather(sky?.dataset.kind);
      model = new T.Group(); const doll = makeDoll(); model.add(doll);
      hair = createHairController(doll); hair.update(recipe.hairId);
      const outfit = makeOutfit(recipe, atlas); model.add(outfit); fitDoll(doll, outfit);
      finish(model, { anisotropy: Math.min(8, renderer.capabilities.getMaxAnisotropy()) });
      setExpression(doll, expressionFor({ kind: sky?.dataset.kind, feels: Number(sky?.dataset.feels) }));
      const attitude = attitudeOf(key), head = doll.getObjectByName('doll-head'), turn = headPose(attitude);
      head.rotation.set(turn.x, turn.y, turn.z); pose(doll, model, doll.position.y, attitude); pose(outfit, model, doll.position.y, attitude);
      // Cached fabric textures can also belong to the live doll. Give this renderer its own copies before disposal.
      const materials = new Map(), textures = new Map();
      const copy = original => {
        if (materials.has(original)) return materials.get(original);
        const material = original.clone(); material.onBeforeCompile = original.onBeforeCompile; material.customProgramCacheKey = original.customProgramCacheKey;
        for (const [name, value] of Object.entries(material)) if (value?.isTexture) {
          if (!textures.has(value)) textures.set(value, value.clone());
          material[name] = textures.get(value);
        }
        materials.set(original, material); return material;
      };
      model.traverse(o => { if (o.material) o.material = Array.isArray(o.material) ? o.material.map(copy) : copy(o.material); });
      model.rotation.y = -.22; scene.add(model);
      const camera = new T.PerspectiveCamera(24, 240 / 280, .1, 40);
      camera.position.set(0, 1.18, 7.3); camera.lookAt(0, 1.22, 0);
      occlusion.render(scene, camera);
      return renderer.domElement.toDataURL('image/webp', .86);
    } finally {
      // Hair controller disposal would touch the live doll's shared texture originals; cloned meshes own their maps.
      if (model) { scene?.remove(model); disposeObject(model); }
      loaded.forEach(texture => texture.dispose());
    }
  }
  return {
    render(recipe, key) { const result = queue.then(() => photograph(recipe, key)); queue = result.catch(() => null); return result; },
    dispose() { closed = true; queue.finally(() => { light?.dispose(); occlusion?.dispose(); renderer?.dispose(); renderer?.forceContextLoss(); renderer = null; }); },
  };
}
