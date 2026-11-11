// Where things meet, light is shut out: under her head, between her arms and her body, in a cuff, under a collar, in
// the folds of her trousers, round her soles on the ground. A photograph of a real miniature doll shows it everywhere;
// a renderer lit only by lights and a sky shows none of it, which is the strongest thing that makes her look drawn by a
// computer (the user asked for a substantial improvement of her and her clothes, 31 October 2026). This draws it, from
// the depth of what is on screen, for her, her hair and every garment at once, so no garment builder changes.
//
// She is drawn exactly as before, only into a picture of her own first: the target is marked as three.js marks the
// pictures it draws for a headset, so every material is tone mapped and encoded for the screen as it is drawn and
// blended in the same space, and the picture holds the very bytes the screen would have held (`internalFormat` keeps
// three.js from storing it as sRGB, which would encode it twice). Its depth gives each point's neighbourhood; the
// occlusion is worked out at a reduced size, smoothed without crossing edges, and laid over her as the picture is
// copied to the screen. Where nothing is shut out, the copy is exact, so the colours of every approved garment are
// unchanged; where light is shut out, the picture is darkened. On the ground near her feet the painted meadow is
// darkened through the canvas's transparency, as a real shadow darkens it.
import * as T from 'three';

// Samples per pixel, laid out in a spiral that turns this many times; each pixel turns it by its own angle.
const SAMPLES = 16, TURNS = 7;
// How far it looks (in her world's units: her head is one wide; the ground only as far as her soles' contact), how
// strongly what it finds darkens, how the samples spread over that reach (squared: most look close, at creases and
// contact, a few far, so her big head shades her shoulders softly), the slope a neighbour must rise above a surface
// before it counts (so the facets of a curved surface do not shade each other), how far from her feet the ground can
// be darkened (the ground is the floor plane of light.js, at this height), and how much light a pale surface gets
// back from round it (see the copy to the screen, below).
export const OCCLUSION = { radius: .36, floorRadius: .2, intensity: 8, spread: 2, bias: .05, floorY: .003, reach: 1.15, bounce: 1 };

const VERTEX = 'varying vec2 vUv;\nvoid main() { vUv = uv; gl_Position = vec4(position.xy, 0., 1.); }';
// Every pass carries this mark (so a shader that fails to build is known as one of these) and keeps a point's distance
// as a share of the camera's range in two bytes beside the occlusion, so smoothing and enlarging can keep to edges.
const MARK = '// fashiongirly-occlusion';
const COMMON = `${MARK}
#include <packing>
uniform float cameraNear;
uniform float cameraFar;
float viewDepth(float z) { return clamp((-z - cameraNear) / (cameraFar - cameraNear), 0., 1.); }
float unpackDepth(vec4 t) { return t.g + t.b / 255.; }`;

// For each point, the surfaces round it that rise above it (Alchemy, or scalable, ambient obscurance: McGuire and
// others, 2011-2012): a neighbour counts by how steeply it rises above the plane the point lies in, less the further
// it is. A curved surface never rises above its own plane, so the rims of her head and of her clothes stay clean,
// which an occlusion that takes what lies behind a surface for solid does not manage.
const AO = `${COMMON}
uniform sampler2D tDepth;
uniform vec2 depthSize;
uniform mat4 projectionInverse;
uniform mat4 cameraWorld;
uniform mat4 cameraView;
uniform float projScale;
uniform float radius;
uniform float floorRadius;
uniform float intensity;
uniform float spread;
uniform float bias;
uniform float floorY;
uniform float reach;
varying vec2 vUv;
// A depth as a point in front of the camera; the camera's own inverse projection keeps the frame's offset (view.js draws
// a part of a larger frustum), so every point is where the camera put it.
vec3 viewAt(vec2 uv, float d) { vec4 p = projectionInverse * vec4(vec3(uv, d) * 2. - 1., 1.); return p.xyz / p.w; }
// Each depth is that of its pixel's centre, so a point is put back at the centre of the pixel its depth was read from:
// on ground seen this low, half a pixel off would lift it off the ground enough to shade the ground with itself.
vec2 centre(vec2 uv) { return (floor(uv * depthSize) + .5) / depthSize; }
vec3 pointAt(vec2 uv) { return viewAt(uv, texture2D(tDepth, uv).x); }
vec4 result(float ao, float z) { float d = viewDepth(z), hi = floor(d * 255.) / 255.; return vec4(ao, hi, (d - hi) * 255., 1.); }
void main() {
  vec2 uv = centre(vUv);
  float d = texture2D(tDepth, uv).x;
  if (d >= 1.) { gl_FragColor = vec4(1.); return; }
  vec3 P = viewAt(uv, d), W = (cameraWorld * vec4(P, 1.)).xyz, N;
  float near = 1., R = radius;
  if (abs(W.y - floorY) < .004) {
    // The ground: its way up is known, which is steadier than reading it from depth at so low an angle; and only near
    // her feet, so the meadow far off is left alone. Seen so low, a wide reach would smear into a band across the
    // meadow, so the ground looks only as far as her soles' contact.
    near = 1. - smoothstep(reach * .45, reach, length(W.xz)); R = floorRadius;
    if (near <= 0.) { gl_FragColor = result(1., P.z); return; }
    N = normalize((cameraView * vec4(0., 1., 0., 0.)).xyz);
  } else {
    // The surface's way out, from the neighbours on whichever side lies on the same surface, so edges stay clean.
    vec2 texel = 1. / depthSize;
    vec3 l = pointAt(uv - vec2(texel.x, 0.)), r = pointAt(uv + vec2(texel.x, 0.));
    vec3 b = pointAt(uv - vec2(0., texel.y)), t = pointAt(uv + vec2(0., texel.y));
    vec3 dx = abs(r.z - P.z) < abs(P.z - l.z) ? r - P : P - l, dy = abs(t.z - P.z) < abs(P.z - b.z) ? t - P : P - b;
    N = normalize(cross(dx, dy));
    if (dot(N, P) > 0.) N = -N;
  }
  float reachPixels = R * projScale / -P.z;
  if (reachPixels < 1.) { gl_FragColor = result(1., P.z); return; }
  float spin = 6.2831853 * fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(.06711056, .00583715)))), r2 = R * R, sum = 0.;
  for (int i = 0; i < ${SAMPLES}; i++) {
    float t = (float(i) + .5) / float(${SAMPLES}), angle = t * ${TURNS}. * 6.2831853 + spin;
    vec2 s = centre(uv + vec2(cos(angle), sin(angle)) * pow(t, spread) * reachPixels / depthSize);
    if (s.x < 0. || s.y < 0. || s.x > 1. || s.y > 1.) continue;
    float sd = texture2D(tDepth, s).x;
    if (sd >= 1.) continue;
    vec3 v = viewAt(s, sd) - P;
    float vv = dot(v, v), f = max(0., 1. - vv / r2);
    sum += f * f * max(0., dot(v, N) * inversesqrt(vv + 1e-8) - bias);
  }
  gl_FragColor = result(clamp(1. - near * intensity * sum / float(${SAMPLES}), 0., 1.), P.z);
}`;

// Smoothed along one direction at a time, never across a jump in depth (her arm in front of her body stays apart).
const BLUR = `${COMMON}
uniform sampler2D tAO;
uniform vec2 stride;
uniform float sigma;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tAO, vUv);
  float z = unpackDepth(c);
  if (z >= 1.) { gl_FragColor = c; return; }
  float sum = c.r * .2, total = .2, range = cameraFar - cameraNear;
  for (int i = 1; i <= 4; i++) {
    float g = exp(-float(i * i) / 8.) * .2;
    for (int k = -1; k <= 1; k += 2) {
      vec4 t = texture2D(tAO, vUv + stride * float(i * k));
      float dz = (unpackDepth(t) - z) * range, w = g * exp(-dz * dz / (2. * sigma * sigma));
      sum += t.r * w; total += w;
    }
  }
  gl_FragColor = vec4(sum / total, c.gba);
}`;

// The copy to the screen: her picture as drawn, darkened where light is shut out. The occlusion is enlarged from its
// reduced size by the four nearest values, each counted as far as it lies at the same depth as this pixel, so it keeps
// to the edges of what it belongs to. Light shut out of a pale surface is partly given back by the surfaces round it,
// in their colour (Jimenez and others' fit for light bouncing in a crease, 2016, colour by colour, with the pixel's own
// colour for the surfaces round it): pale plush and cream fleece darken less than dark hair or denim, and a crease in
// her skin stays warm instead of turning grey, so her face keeps its light. The picture is premultiplied, as the canvas
// is: darkening what lies under a partly covered pixel (the ground) raises its coverage, so the meadow behind shows
// through darker.
const COMPOSITE = `${COMMON}
uniform sampler2D tColor;
uniform sampler2D tDepth;
uniform sampler2D tAO;
uniform vec2 aoSize;
uniform float sigma;
uniform float show;
uniform float bounce;
varying vec2 vUv;
void main() {
  vec4 c = texture2D(tColor, vUv);
  float d = texture2D(tDepth, vUv).x;
  if (d >= 1.) { gl_FragColor = show > .5 ? vec4(0.) : c; return; }
  float z = viewDepth(perspectiveDepthToViewZ(d, cameraNear, cameraFar)), range = cameraFar - cameraNear;
  vec2 p = vUv * aoSize - .5, f = fract(p), base = floor(p);
  float sum = 0., total = 0.;
  for (int j = 0; j < 2; j++) for (int i = 0; i < 2; i++) {
    vec4 t = texture2D(tAO, (base + vec2(float(i), float(j)) + .5) / aoSize);
    float b = (i == 0 ? 1. - f.x : f.x) * (j == 0 ? 1. - f.y : f.y), dz = (unpackDepth(t) - z) * range;
    float w = b * (exp(-dz * dz / (2. * sigma * sigma)) + 1e-4);
    sum += t.r * w; total += w;
  }
  // The occlusion is a share of the light; the picture is encoded for the screen, where that share is its 2.2th root.
  float ao = clamp(sum / max(total, 1e-6), 0., 1.);
  vec3 pale = pow(c.rgb / max(c.a, 1e-4), vec3(2.2)), ma = 2.0404 * pale - .3324, mb = -4.7951 * pale + .6417, mc = 2.7552 * pale + .6903;
  vec3 k = pow(clamp(mix(vec3(ao), max(vec3(ao), ((ao * ma + mb) * ao + mc) * ao), bounce), 0., 1.), vec3(1. / 2.2));
  gl_FragColor = show > .5 ? vec4(vec3(ao), 1.) : vec4(c.rgb * k, 1. - (1. - c.a) * dot(k, vec3(.299, .587, .114)));
}`;
const COPY = `${MARK}\nuniform sampler2D tColor;\nvarying vec2 vUv;\nvoid main() { gl_FragColor = texture2D(tColor, vUv); }`;

const pass = (fragmentShader, uniforms) => new T.ShaderMaterial({ vertexShader: VERTEX, fragmentShader, uniforms, depthTest: false, depthWrite: false, blending: T.NoBlending });
const target = (w, h) => new T.WebGLRenderTarget(w, h, { type: T.UnsignedByteType, minFilter: T.NearestFilter, magFilter: T.NearestFilter, generateMipmaps: false, depthBuffer: false });

// `renderer` draws her; `samples` is the antialiasing her picture is drawn with (the canvas's own is then not needed);
// `occlusion: false` copies her picture unchanged, and `show: true` shows the occlusion alone, in greys, to judge it.
// `render(scene, camera)` draws her to the screen.
export function createOcclusion(renderer, { samples = 4, occlusion = true, show = false, maxPixels = 1.5e6 } = {}) {
  const size = new T.Vector2(), aoSize = new T.Vector2(), settings = { ...OCCLUSION, show };
  const depth = new T.DepthTexture(1, 1, T.UnsignedIntType);
  const main = new T.WebGLRenderTarget(1, 1, { samples: Math.min(samples, renderer.capabilities.maxSamples || 0), type: T.UnsignedByteType, colorSpace: T.SRGBColorSpace, minFilter: T.NearestFilter, magFilter: T.NearestFilter, generateMipmaps: false, depthTexture: depth });
  // Drawn as three.js draws for the screen (see above): the flag decides tone mapping and encoding, nothing else.
  main.isXRRenderTarget = true; main.texture.internalFormat = 'RGBA8';
  const a = target(1, 1), b = target(1, 1);
  const camera = { cameraNear: { value: .1 }, cameraFar: { value: 40 } };
  const ao = pass(AO, { ...camera, tDepth: { value: depth }, depthSize: { value: new T.Vector2() }, projectionInverse: { value: new T.Matrix4() }, cameraWorld: { value: new T.Matrix4() }, cameraView: { value: new T.Matrix4() }, projScale: { value: 0 }, radius: { value: 0 }, floorRadius: { value: 0 }, intensity: { value: 0 }, spread: { value: 1 }, bias: { value: 0 }, floorY: { value: 0 }, reach: { value: 0 } });
  const blur = pass(BLUR, { ...camera, tAO: { value: null }, stride: { value: new T.Vector2() }, sigma: { value: .05 } });
  const composite = pass(COMPOSITE, { ...camera, tColor: { value: main.texture }, tDepth: { value: depth }, tAO: { value: a.texture }, aoSize: { value: aoSize }, sigma: { value: .05 }, show: { value: 0 }, bounce: { value: 0 } });
  const copy = pass(COPY, { tColor: { value: main.texture } });
  const quad = new T.Mesh(new T.BufferGeometry(), copy), screen = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  quad.geometry.setAttribute('position', new T.Float32BufferAttribute([-1, -1, 0, 3, -1, 0, -1, 3, 0], 3));
  quad.geometry.setAttribute('uv', new T.Float32BufferAttribute([0, 0, 2, 0, 0, 2], 2)); quad.frustumCulled = false;
  // A device whose graphics cannot build the occlusion still draws her, without it. three.js reports a shader that does
  // not build to this hook instead of the console once it is set, so it is reported here as three.js would.
  let enabled = occlusion, failed = false;
  const debug = renderer.debug, previousError = debug.onShaderError;
  debug.onShaderError = (gl, program, vertex, fragment) => {
    if (gl.getShaderSource(fragment)?.includes(MARK)) { failed = true; enabled = false; }
    if (previousError) previousError(gl, program, vertex, fragment);
    else console.error('THREE.WebGLProgram: Shader Error', gl.getProgramInfoLog(program), gl.getShaderInfoLog(vertex), gl.getShaderInfoLog(fragment));
  };
  const draw = (material, into) => { quad.material = material; renderer.setRenderTarget(into); renderer.render(quad, screen); };
  const fit = () => {
    renderer.getDrawingBufferSize(size); const w = Math.max(1, size.x), h = Math.max(1, size.y);
    if (main.width !== w || main.height !== h) main.setSize(w, h);
    // The occlusion is soft: half the screen's pixels in each direction, fewer on a very large screen.
    const k = Math.min(.5, Math.sqrt(maxPixels / (w * h))), aw = Math.max(1, Math.round(w * k)), ah = Math.max(1, Math.round(h * k));
    if (a.width !== aw || a.height !== ah) { a.setSize(aw, ah); b.setSize(aw, ah); }
    aoSize.set(aw, ah);
  };
  return {
    settings,
    get enabled() { return enabled; },
    set enabled(on) { enabled = !!on && !failed; },
    render(scene, view) {
      fit();
      const before = renderer.getRenderTarget();
      renderer.setRenderTarget(main); renderer.render(scene, view);
      if (enabled) {
        camera.cameraNear.value = view.near; camera.cameraFar.value = view.far;
        const u = ao.uniforms;
        u.depthSize.value.set(main.width, main.height); u.projectionInverse.value.copy(view.projectionMatrixInverse); u.projScale.value = view.projectionMatrix.elements[5] * main.height / 2;
        u.cameraWorld.value.copy(view.matrixWorld); u.cameraView.value.copy(view.matrixWorldInverse);
        u.radius.value = settings.radius; u.floorRadius.value = settings.floorRadius; u.intensity.value = settings.intensity; u.spread.value = settings.spread; u.bias.value = settings.bias; u.floorY.value = settings.floorY; u.reach.value = settings.reach;
        draw(ao, a);
        blur.uniforms.tAO.value = a.texture; blur.uniforms.stride.value.set(1 / a.width, 0); draw(blur, b);
        blur.uniforms.tAO.value = b.texture; blur.uniforms.stride.value.set(0, 1 / a.height); draw(blur, a);
        composite.uniforms.show.value = settings.show ? 1 : 0; composite.uniforms.bounce.value = settings.bounce;
        draw(composite, before);
      }
      // Without occlusion, or if it has just failed to build, her picture is copied as drawn.
      if (!enabled) draw(copy, before);
    },
    dispose() {
      debug.onShaderError = previousError;
      [main, a, b].forEach(t => t.dispose()); depth.dispose();
      [ao, blur, composite, copy].forEach(m => m.dispose()); quad.geometry.dispose();
    },
  };
}
