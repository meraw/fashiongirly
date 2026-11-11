import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import { createOcclusion, OCCLUSION } from '../src/doll/occlusion.js';
// The occlusion laid over her (src/doll/occlusion.js), checked against a renderer that records what it is asked to
// draw: her picture first, exactly as the screen would have it, then the occlusion and the copy to the screen.
function recorder({ maxSamples = 4 } = {}) {
  let target = null;
  const calls = [];
  return {
    calls, capabilities: { maxSamples }, debug: { onShaderError: null },
    getDrawingBufferSize: v => v.set(300, 200),
    getRenderTarget: () => target,
    setRenderTarget(t) { target = t; },
    render(scene) {
      const u = scene.isMesh ? scene.material.uniforms : null;
      calls.push({ into: target, pass: !u ? 'scene' : u.projScale ? 'occlusion' : u.stride ? 'blur' : u.aoSize ? 'composite' : 'copy' });
    },
  };
}
const camera = () => { const c = new T.PerspectiveCamera(24, 1.5, .1, 40); c.position.set(0, 1, 7.5); c.updateMatrixWorld(); c.updateProjectionMatrix(); return c; };

test('her picture is drawn as the screen would have it, then darkened where light is shut out', () => {
  const r = recorder(), occlusion = createOcclusion(r), scene = new T.Scene();
  occlusion.render(scene, camera());
  assert.deepEqual(r.calls.map(c => c.pass), ['scene', 'occlusion', 'blur', 'blur', 'composite']);
  const main = r.calls[0].into;
  assert.equal(main.isXRRenderTarget, true, 'tone mapped and encoded for the screen as it is drawn');
  assert.equal(main.texture.internalFormat, 'RGBA8', 'and stored as the bytes the screen would hold');
  assert.equal(main.texture.colorSpace, T.SRGBColorSpace);
  assert.equal(main.samples, 4, 'antialiased as the canvas was');
  assert.ok(main.depthTexture?.isDepthTexture, 'its depth is kept');
  assert.deepEqual([main.width, main.height], [300, 200], 'at the size of the screen');
  const soft = r.calls[1].into;
  assert.deepEqual([soft.width, soft.height], [150, 100], 'the occlusion at half size');
  assert.equal(r.calls.at(-1).into, null, 'and the result goes to the screen');
  occlusion.dispose();
});

test('without occlusion her picture is copied unchanged', () => {
  const r = recorder({ maxSamples: 0 }), occlusion = createOcclusion(r, { occlusion: false });
  occlusion.render(new T.Scene(), camera());
  assert.deepEqual(r.calls.map(c => c.pass), ['scene', 'copy']);
  assert.equal(r.calls[0].into.samples, 0, 'a device without antialiased pictures draws one without');
  occlusion.enabled = true; r.calls.length = 0; occlusion.render(new T.Scene(), camera());
  assert.deepEqual(r.calls.map(c => c.pass), ['scene', 'occlusion', 'blur', 'blur', 'composite']);
  occlusion.dispose();
});

test('if the occlusion cannot be built she is still drawn, and other shader errors are passed on', () => {
  const r = recorder(), seen = [];
  r.debug.onShaderError = (...args) => seen.push(args.length);
  const occlusion = createOcclusion(r), gl = source => ({ getShaderSource: () => source, getProgramInfoLog: () => '', getShaderInfoLog: () => '' });
  r.debug.onShaderError(gl('void main() {}'), {}, {}, {});
  assert.equal(occlusion.enabled, true, "another material's error leaves the occlusion on");
  r.debug.onShaderError(gl('// fashiongirly-occlusion\nvoid main() {}'), {}, {}, {});
  assert.equal(occlusion.enabled, false, 'its own error turns it off');
  assert.equal(seen.length, 2, 'both are still reported');
  occlusion.enabled = true; assert.equal(occlusion.enabled, false, 'and it stays off');
  occlusion.render(new T.Scene(), camera());
  assert.deepEqual(r.calls.map(c => c.pass), ['scene', 'copy']);
  occlusion.dispose();
  assert.notEqual(r.debug.onShaderError, undefined); assert.equal(typeof r.debug.onShaderError, 'function', 'the earlier hook is put back');
});

test('the occlusion looks only as far as it should', () => {
  assert.ok(OCCLUSION.floorRadius < OCCLUSION.radius, 'the ground only as far as her soles');
  assert.ok(OCCLUSION.radius > 0 && OCCLUSION.radius < 1, 'within about her head');
});
