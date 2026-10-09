#!/usr/bin/env python3
"""Paint the app's scenery: a sunset sky and a mountain range in the colours of the Desigual mountain landscape shirt.

An authoring tool, like the garment texture scripts: the app only loads its output, `src/art/sky.webp`,
`src/art/mountains.webp` and `src/art/brush.webp`. Everything is drawn here from noise, gradients and shapes; no photographs are used.
Requires Python 3 with numpy and Pillow (with WebP support). Run from the repository root:

    python3 scripts/art/paint-scenery.py

The same seed always paints the same pictures.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

OUT = Path(sys.argv[1] if len(sys.argv) > 1 else 'src/art')
SEED = 20261009


def rgb(h):
    h = h.lstrip('#')
    return np.array([int(h[i:i + 2], 16) for i in (0, 2, 4)], np.float32) / 255


def ramp(stops, t):
    """Colour along a list of (position, hex) stops for every value in t."""
    pos = np.array([p for p, _ in stops], np.float32)
    cols = np.stack([rgb(c) for _, c in stops])
    t = np.clip(t, 0, 1)
    return np.stack([np.interp(t, pos, cols[:, k]) for k in range(3)], -1).astype(np.float32)


def _box(a, r, axis):
    """Mean over a window of 2r+1 along one axis, with the edges extended."""
    if r < 1:
        return a
    pad = [(0, 0)] * a.ndim
    pad[axis] = (r + 1, r)
    c = np.cumsum(np.pad(a, pad, mode='edge'), axis=axis, dtype=np.float64)
    hi = np.take(c, np.arange(2 * r + 1, c.shape[axis]), axis=axis)
    lo = np.take(c, np.arange(0, c.shape[axis] - 2 * r - 1), axis=axis)
    return ((hi - lo) / (2 * r + 1)).astype(np.float32)


def blur(a, sigma):
    """Gaussian-like blur of a float image: three box passes each way, the usual close approximation."""
    a = a.astype(np.float32)
    if sigma < 1:
        k = np.array([sigma / 2, 1 - sigma, sigma / 2], np.float32)
        for axis in (0, 1):
            p = np.pad(a, [(1, 1) if ax == axis else (0, 0) for ax in range(a.ndim)], mode='edge')
            a = sum(k[i] * np.take(p, np.arange(i, i + a.shape[axis]), axis=axis) for i in range(3))
        return a
    r = max(1, int((np.sqrt(12 * sigma * sigma / 3 + 1) - 1) / 2))
    for _ in range(3):
        a = _box(_box(a, r, 0), r, 1)
    return a


def stretched(h, w, sx, sy, seed):
    """Value noise stretched sx by sy: long thin streaks, like a loaded brush dragged sideways."""
    r = np.random.default_rng(seed)
    small = r.random((max(2, h // sy), max(2, w // sx))).astype(np.float32)
    return np.asarray(Image.fromarray(small, 'F').resize((w, h), Image.BICUBIC), np.float32)


def strokes(h, w, angle, length, width, seed):
    """Brush strokes at an angle (degrees): stretched noise, rotated, cropped back to h by w."""
    d = int(np.hypot(h, w)) + 4
    base = stretched(d, d, length, width, seed)
    im = Image.fromarray(base, 'F').rotate(angle, resample=Image.BICUBIC)
    a = np.asarray(im, np.float32)
    y0, x0 = (d - h) // 2, (d - w) // 2
    return a[y0:y0 + h, x0:x0 + w]


def fbm(n, octaves, seed, base):
    """Fractal value noise along a line, from -0.5 to 0.5-ish."""
    r = np.random.default_rng(seed)
    x = np.linspace(0, 1, n)
    out, amp, freq = np.zeros(n), 1.0, base
    for _ in range(octaves):
        pts = r.random(freq + 2) - .5
        out += amp * np.interp(x * freq, np.arange(freq + 2), pts)
        amp *= .5
        freq *= 2
    return out


def grain(h, w, seed, amount):
    r = np.random.default_rng(seed)
    return (r.random((h, w)).astype(np.float32) - .5) * amount


# ---------------------------------------------------------------------------------------------------------------
# The sky: deep purple at the top through plum and rose to orange and apricot at the horizon, laid on in broad
# sideways strokes, with a low sun glowing over the mountains, a few lilac and pink cloud streaks, and stars.
def paint_sky(w=1800, h=1200, sun=(.6, .62)):
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :] * np.ones((h, 1), np.float32)
    # Broad brushwork: the gradient position wobbles along wide, soft horizontal strokes.
    wob = (stretched(h, w, 260, 40, SEED + 1) - .5) * .06 + (stretched(h, w, 90, 16, SEED + 2) - .5) * .02
    t = y + wob
    sky = ramp([(0, '#1a0a36'), (.14, '#2b1352'), (.3, '#46206e'), (.44, '#6e2f82'), (.55, '#9c4482'),
                (.64, '#c95a76'), (.72, '#e8775a'), (.8, '#f59a62'), (.9, '#f8bd84'), (1, '#fbd5a6')], t)
    # Colour drifts across the width too: a little more violet to the left, warmer under the sun.
    drift = (x - .5)[..., None]
    sky = sky + drift * np.array([.05, -.02, -.06], np.float32) * np.clip(1.4 - y * 1.2, 0, 1)[..., None]
    sx, sy = sun
    dist = np.sqrt(((x - sx) * 1.5) ** 2 + (y - sy) ** 2)
    halo = np.exp(-(dist / .45) ** 2)[..., None]
    sky = sky + (rgb('#ff8f5a') - sky) * .28 * halo
    glow = np.exp(-(dist / .14) ** 2)[..., None]
    sky = sky + (rgb('#ffd291') - sky) * .7 * glow
    disc = np.clip((.042 - dist) / .005, 0, 1)[..., None]
    sky = sky * (1 - disc) + rgb('#fff3d6') * disc
    # Cloud streaks: long and thin with tapering ends, catching the light from below.
    r = np.random.default_rng(SEED + 9)
    clouds = [(.33, .2, .5, .006, '#a57fcd', .55), (.37, .55, .4, .005, '#c58fc8', .5), (.42, .15, .35, .007, '#d99abf', .5),
              (.47, .7, .45, .006, '#eba3a8', .5), (.52, .35, .5, .008, '#f2ad98', .55), (.56, .85, .3, .005, '#f8bf92', .5),
              (.27, .8, .3, .004, '#8d6cc2', .45), (.6, .1, .3, .005, '#fbc993', .45)]
    for i, (cy, cx, length, thick, col, alpha) in enumerate(clouds):
        u = (x - cx) / length
        taper = np.clip(1 - u ** 2, 0, 1) ** 1.5
        off = (stretched(h, w, 220, 60, SEED + 10 + i) - .5) * .03
        band = np.exp(-((y - cy - off) / (thick * (.4 + taper))) ** 2) * taper
        broken = np.clip((stretched(h, w, 70, 20, SEED + 20 + i) - .35) * 2.2, 0, 1)
        mask = blur(band * broken, 1.5)[..., None] * alpha
        lit = np.clip((y - cy) / thick * .5 + .5, 0, 1)[..., None]
        c = rgb(col) * (1 - .25 * lit) + rgb('#ffe0c0') * .25 * lit
        sky = sky * (1 - mask) + c * mask
    # Stars in the darker part of the sky, a few of them larger.
    stars = np.zeros((h, w), np.float32)
    n = 520
    ys = (r.random(n) ** 1.7 * .45 * h).astype(int)
    xs = (r.random(n) * w).astype(int)
    stars[ys, xs] = r.random(n) ** 2 * .85 + .15
    for yy, xx in zip(ys[r.random(n) > .94], xs[r.random(n) > .94]):
        stars[max(0, yy - 1):yy + 2, max(0, xx - 1):xx + 2] = np.maximum(stars[max(0, yy - 1):yy + 2, max(0, xx - 1):xx + 2], .55)
    stars = np.clip(blur(stars, .8) * 2.4, 0, 1) * np.clip(1.15 - y * 2.1, 0, 1)
    sky = sky + stars[..., None] * (rgb('#fff6ea') - sky)
    sky = sky + grain(h, w, SEED + 31, .03)[..., None]
    return np.clip(sky, 0, 1)


# ---------------------------------------------------------------------------------------------------------------
# The mountains: four ranges, from hazy lilac far away to a dark brown foreground flecked with cream, with ochre and
# rust in between and lilac snow on the high peaks. The low sun is to the right: faces turned right are lit, and a
# thin rim of light runs along the lit ridges.
def peaks_line(w, peaks, base, crag, seed):
    """The ridge line (fraction of height from the top) from asymmetric peaks joined by soft saddles, with crags."""
    x = np.linspace(0, 1, w)
    bumps = []
    for px, ph, wl, wr, e, *_ in peaks:
        d = np.where(x < px, (px - x) / wl, (x - px) / wr)
        bumps.append(ph * np.clip(1 - d, 0, 1) ** e)
    bumps = np.stack(bumps)
    k = 60.0
    soft = np.log(np.exp(bumps * k).sum(0)) / k
    which = bumps.argmax(0)
    ridged = np.zeros(w)
    r = np.random.default_rng(seed)
    amp, freq = 1.0, 9
    for _ in range(6):
        pts = r.random(freq + 2)
        v = np.interp(x * freq, np.arange(freq + 2), pts)
        ridged += amp * (1 - np.abs(v * 2 - 1))
        amp *= .5
        freq *= 2
    ridged = ridged / 2 - .5
    top = base - soft - ridged * crag * (.4 + soft / max(1e-6, soft.max()))
    return top, which


def paint_range(img, alpha, top, which, peaks, L, seed):
    h, w = alpha.shape
    yy = np.arange(h, dtype=np.float32)[:, None]
    xx = np.linspace(0, 1, w, dtype=np.float32)[None, :]
    below = yy - top[None, :] * h
    a = np.clip(below * 1.2 + .5, 0, 1)
    depth = np.clip(below / (h * L['depth']), 0, 1)
    # Light and shade from the ridge's own slope: where the ridge falls to the right the face turns towards the low
    # sun and is lit. Near the top every crag has a lit and a shaded side; further down the slope is smoothed over a
    # wider stretch, so the small faces merge into a few broad ones, as on a real range.
    levels = 12
    slopes = []
    for d in np.linspace(0, 1, levels):
        radius = 1.5 + d * L.get('smooth', .035) * w
        ts = blur(np.tile(top.astype(np.float32), (5, 1)), radius)[2]
        slopes.append(np.gradient(ts) * w)
    slopes = np.stack(slopes)
    li = depth * (levels - 1)
    i0 = np.clip(np.floor(li).astype(int), 0, levels - 2)
    t = li - i0
    cols = np.broadcast_to(np.arange(w)[None, :], (h, w))
    slope = slopes[i0, cols] * (1 - t) + slopes[i0 + 1, cols] * t
    lit = (1 / (1 + np.exp(-slope * L.get('contrast', 4)))).astype(np.float32)
    # Broad diagonal bands of slightly lighter and darker paint across each face.
    bands = strokes(h, w, -40, 300, 90, seed + 2)
    tone = 1 + (bands[..., None] - .5) * .16
    light = ramp(L['light'], depth)
    shade = ramp(L['shade'], depth)
    base = (shade * (1 - lit[..., None]) + light * lit[..., None]) * tone
    # Painted colour drifting through: another colour of the range in soft, wide washes.
    if 'patch' in L:
        blot = blur(np.clip((stretched(h, w, 260, 120, seed + 3) - .45) * 1.6, 0, 1), 8)[..., None] * .32
        base = base * (1 - blot) + rgb(L['patch']) * blot * (.6 + .4 * lit[..., None])
    # Brush strokes running down each face, broad then fine.
    s_lit = strokes(h, w, -52, L['stroke'], 9, seed + 4)
    s_sh = strokes(h, w, 52, L['stroke'], 9, seed + 5)
    st = s_lit * lit + s_sh * (1 - lit)
    fine = strokes(h, w, -20, 140, 4, seed + 6) * lit + strokes(h, w, 20, 140, 4, seed + 7) * (1 - lit)
    base = base * (1 + (st[..., None] - .5) * L['texture'] + (fine[..., None] - .5) * L['texture'] * .45)
    # Rim light along lit ridges.
    rim = np.clip(1 - below / 5, 0, 1) * (below > -1) * lit
    base = base + (rgb('#ffd7a0') - base) * (rim * L.get('rim', .5))[..., None]
    # Snow on the high peaks: a ragged snowline, deeper on the lit side, with streaks down the gullies.
    if L.get('snow'):
        snow_reach = np.zeros(w)
        for p in peaks:
            pxx, ph, wl, wr = p[:4]
            if ph < L['snow']['above']:
                continue
            d = np.where(np.linspace(0, 1, w) < pxx, (pxx - np.linspace(0, 1, w)) / wl, (np.linspace(0, 1, w) - pxx) / wr)
            snow_reach = np.maximum(snow_reach, np.clip(1 - d * 1.6, 0, 1) * (ph - L['snow']['above'] * .7) * L['snow']['deep'] * h)
        ragged = fbm(w, 6, seed + 8, 40) + .5
        jitter = (stretched(h, w, 5, 5, seed + 12) - .5) * 7
        line = snow_reach[None, :] * (.45 + .75 * ragged[None, :]) * (.7 + .55 * lit) + jitter
        snow = np.clip((line - below) / 3, 0, 1) * (below > -1)
        # Short streaks of snow lying in the gullies just below the snowline, slanting with the face.
        streak = strokes(h, w, -60, 34, 3, seed + 9) * lit + strokes(h, w, 60, 34, 3, seed + 13) * (1 - lit)
        gully = np.clip((streak - .62) * 5, 0, 1) * np.clip(1 - (below - line) / (h * .035), 0, 1) * (below > line)
        snow = np.clip(snow + gully * .7, 0, 1)
        snow_col = ramp([(0, '#bfaee3'), (1, '#a894d1')], depth) * (1 - lit[..., None]) + ramp([(0, '#fff3f0'), (1, '#f1dcea')], depth) * lit[..., None]
        snow_col = snow_col * (1 + (st[..., None] - .5) * .12)
        base = base * (1 - snow[..., None]) + snow_col * snow[..., None]
    if L.get('flecks'):
        r = np.random.default_rng(seed + 10)
        n = L['flecks']
        fl = np.zeros((h, w), np.float32)
        xs = (r.random(n) * (w - 1)).astype(int)
        ys = (np.clip(top[xs] + .03 + r.random(n) * (1 - top[xs]), 0, .999) * h).astype(int)
        for dx in range(-2, 3):
            fl[ys, np.clip(xs + dx, 0, w - 1)] = np.maximum(fl[ys, np.clip(xs + dx, 0, w - 1)], (r.random(n) * .7 + .3) * (1 - abs(dx) / 3))
        fl = np.clip(blur(fl, .7) * 2.2, 0, 1) * np.clip(depth * 2.5, 0, 1)
        base = base * (1 - fl[..., None] * .85) + rgb('#f1d2ad') * fl[..., None] * .85
    # Haze from the sunset sky over distant ranges, and mist lying in the valleys at their feet.
    if L.get('haze'):
        hz = L['haze'] * (1 - depth[..., None] * .5)
        base = base * (1 - hz) + rgb(L['haze_col']) * hz
    if L.get('mist'):
        mist = np.clip((depth - .55) / .45, 0, 1) ** 1.5 * L['mist'] * (.7 + .6 * stretched(h, w, 200, 30, seed + 11))
        base = base * (1 - mist[..., None]) + rgb(L['mist_col']) * mist[..., None]
    m = a[..., None]
    img[:] = img * (1 - m) + base * m
    alpha[:] = np.maximum(alpha, a)


def paint_mountains(w=3600, h=900):
    img = np.zeros((h, w, 3), np.float32)
    alpha = np.zeros((h, w), np.float32)
    # Each peak: (x, height, left width, right width, sharpness, lean of the light/shade spine).
    layers = [
        dict(base=.44, crag=.035, depth=.6, stroke=110, texture=.14, seed=SEED + 100, rim=.35,
             peaks=[(.03, .16, .08, .09, 1.2), (.11, .27, .1, .07, 1.45, .3), (.2, .19, .06, .1, 1.2), (.31, .33, .12, .09, 1.5, .45),
                    (.41, .21, .07, .09, 1.25), (.5, .4, .1, .12, 1.6, .35), (.6, .24, .08, .07, 1.3), (.68, .3, .06, .1, 1.4, .2),
                    (.79, .2, .1, .08, 1.2), (.87, .35, .09, .11, 1.5, .4), (.97, .22, .08, .08, 1.3)],
             shade=[(0, '#8566b0'), (1, '#6f5498')], light=[(0, '#d9b1d6'), (1, '#a888c6')], patch='#9a7cc4',
             snow=dict(above=.22, deep=.8), haze=.3, haze_col='#ec9fa6', mist=.6, mist_col='#f0a9a8'),
        dict(base=.62, crag=.05, depth=.55, stroke=130, texture=.22, seed=SEED + 200, rim=.6,
             peaks=[(.06, .22, .08, .07, 1.3, .3), (.16, .3, .07, .1, 1.45), (.27, .18, .09, .08, 1.2), (.37, .26, .07, .1, 1.35, .45),
                    (.47, .44, .1, .09, 1.6, .35), (.58, .2, .07, .09, 1.2), (.66, .3, .08, .07, 1.4, .3), (.76, .17, .09, .09, 1.15),
                    (.85, .33, .08, .1, 1.45, .4), (.95, .24, .07, .08, 1.3)],
             shade=[(0, '#a8573d'), (1, '#7f3c2e')], light=[(0, '#f6ab6a'), (.5, '#e98447'), (1, '#c96238')], patch='#d9733d', contrast=5,
             snow=dict(above=.25, deep=.75), haze=.08, haze_col='#f3a982', mist=.5, mist_col='#f2a58a'),
        dict(base=.81, crag=.05, depth=.45, stroke=150, texture=.3, seed=SEED + 300, rim=.45,
             peaks=[(.04, .17, .07, .08, 1.2), (.14, .12, .08, .07, 1.1), (.24, .21, .07, .09, 1.25, .4), (.35, .13, .09, .08, 1.1),
                    (.45, .18, .08, .07, 1.2, .3), (.56, .11, .08, .09, 1.1), (.66, .2, .07, .08, 1.25), (.77, .14, .08, .08, 1.1),
                    (.88, .19, .07, .09, 1.2, .35), (.98, .13, .08, .07, 1.1)],
             shade=[(0, '#682a1e'), (1, '#481c14')], light=[(0, '#b5582f'), (.6, '#93432a'), (1, '#6f2f21')], patch='#9a4a2b', contrast=5,
             mist=.2, mist_col='#7d4250'),
        dict(base=.97, crag=.025, depth=.3, stroke=170, texture=.32, seed=SEED + 400, rim=.25,
             peaks=[(.06, .11, .1, .12, 1.8), (.24, .08, .12, .11, 1.9), (.42, .12, .12, .13, 1.8), (.6, .07, .11, .12, 1.9),
                    (.78, .11, .12, .12, 1.8), (.95, .09, .1, .1, 1.8)],
             shade=[(0, '#45200f'), (1, '#2c120c')], light=[(0, '#713322'), (1, '#3f1c13')], patch='#5b2a1c', flecks=10000, contrast=5),
    ]
    for L in layers:
        top, which = peaks_line(w, L['peaks'], L['base'], L['crag'], L['seed'])
        paint_range(img, alpha, top, which, L['peaks'], L, L['seed'])
    img = img + grain(h, w, SEED + 500, .025)[..., None]
    return np.clip(img, 0, 1), alpha


# ---------------------------------------------------------------------------------------------------------------
# Brushwork on its own, in grey: broad sideways strokes laid over the doll's weather skies (CSS blends it softly),
# so every sky looks painted whatever its colour. It tiles side to side.
def paint_brush(w=1024, h=1024):
    a = (stretched(h, w * 2, 220, 34, SEED + 600) - .5) * .9 + (stretched(h, w * 2, 70, 9, SEED + 601) - .5) * .45
    a = a[:, :w] * np.linspace(1, 0, w)[None, :] + a[:, w:] * np.linspace(0, 1, w)[None, :]
    a = a + grain(h, w, SEED + 602, .12)
    return np.clip(.5 + a * .5, 0, 1)


def save(path, rgb_img, alpha=None, quality=82):
    data = (np.clip(rgb_img, 0, 1) * 255 + .5).astype(np.uint8)
    im = Image.fromarray(data, 'RGB')
    if alpha is not None:
        im.putalpha(Image.fromarray((np.clip(alpha, 0, 1) * 255 + .5).astype(np.uint8), 'L'))
    im.save(path, 'WEBP', quality=quality, method=6)
    print(path, f'{path.stat().st_size // 1024} KB')


if __name__ == '__main__':
    OUT.mkdir(parents=True, exist_ok=True)
    save(OUT / 'sky.webp', paint_sky())
    img, alpha = paint_mountains()
    save(OUT / 'mountains.webp', img, alpha)
    b = paint_brush()
    save(OUT / 'brush.webp', np.repeat(b[..., None], 3, -1), quality=70)
