#!/usr/bin/env python3
"""Paint the app's scenery: her worlds, each a painted place in the same style. The first is the original: a sunset
sky and a mountain range in the colours of the Desigual mountain landscape shirt.

An authoring tool, like the garment texture scripts: the app only loads its output. Each world is painted into
`src/art/worlds/<id>/`: `sky-golden.webp` (the evening sky, shown mirrored at dawn), `sky-day.webp`, `sky-night.webp`,
`land.webp` (behind her), `ground.webp` (where she stands) and `front.webp` (grass, flowers or leaves in front of her,
at the edges of the picture). `src/art/worlds/palettes.js` gives the app each world's colours for the light on her, and
`src/art/brush.webp` is brushwork laid over every sky. Everything is drawn here from noise, gradients and shapes; no
photographs are used. Requires Python 3 with numpy and Pillow (with WebP support). Run from the repository root:

    python3 scripts/art/paint-scenery.py                 # every world, the brushwork and the palettes
    python3 scripts/art/paint-scenery.py lilac-hills     # one world (and the palettes)

The same seed always paints the same pictures.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ART = Path('src/art')
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
# sideways strokes, with a low sun glowing over the mountains, a few lilac and pink cloud streaks, and stars. The
# horizon's apricot is reached at `horizon` of the height (the painted mountains hide the rest), so the warm band and
# the sun sit above the ridges on a phone's tall screen as well as on a wide one.
APRICOT_SKY = [(0, '#1a0a36'), (.14, '#2b1352'), (.3, '#46206e'), (.44, '#6e2f82'), (.55, '#9c4482'),
               (.64, '#c95a76'), (.72, '#e8775a'), (.8, '#f59a62'), (.9, '#f8bd84'), (1, '#fbd5a6')]


def paint_sky(w=1800, h=1200, sun=(.6, .36), horizon=.66):
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :] * np.ones((h, 1), np.float32)
    # Broad brushwork: the gradient position wobbles along wide, soft horizontal strokes.
    wob = (stretched(h, w, 260, 40, SEED + 1) - .5) * .06 + (stretched(h, w, 90, 16, SEED + 2) - .5) * .02
    t = (y + wob) / horizon
    sky = ramp(APRICOT_SKY, t)
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
        cy = cy * horizon
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
    stars = np.clip(blur(stars, .8) * 2.4, 0, 1) * np.clip(1.15 - y * 2.1 / horizon, 0, 1)
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
    base = base + (rgb(L.get('rim_col', '#ffd7a0')) - base) * (rim * L.get('rim', .5))[..., None]
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
        sh, sl = L.get('snow_shade', ('#bfaee3', '#a894d1')), L.get('snow_lit', ('#fff3f0', '#f1dcea'))
        snow_col = ramp([(0, sh[0]), (1, sh[1])], depth) * (1 - lit[..., None]) + ramp([(0, sl[0]), (1, sl[1])], depth) * lit[..., None]
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
        base = base * (1 - fl[..., None] * .85) + rgb(L.get('fleck_col', '#f1d2ad')) * fl[..., None] * .85
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
# The meadow she stands on: ochre and rust grass laid on in sideways strokes, hazy and warm towards the mountains,
# darker and coarser near the viewer, flecked with cream and dotted with lilac and cream flowers that grow larger
# towards the viewer, so she reads as small. Its top edge fades out, so it meets the mist at the mountains' feet
# wherever the page puts it. Lit from the right, like the mountains.
def paint_meadow(w=2400, h=800):
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :] * np.ones((h, 1), np.float32)
    base = ramp([(0, '#eaa883'), (.18, '#dd8f55'), (.45, '#c9733c'), (.75, '#9c4d2a'), (1, '#5a2a19')], y)
    # Strokes get longer and broader towards the bottom, as the ground comes closer.
    st = strokes(h, w, 0, 140, 5, SEED + 700) * (1 - y) + strokes(h, w, 0, 320, 14, SEED + 701) * y
    tone = 1 + (st - .5) * (.16 + .2 * y)
    light = 1 + (x - .5) * .12 * (1 - y)
    pool = np.exp(-(((x - .5) * 2.4) ** 2 + ((y - .22) * 3) ** 2)) * .14
    img = base * tone[..., None] * light[..., None] + pool[..., None] * rgb('#ffd9a8')
    # Blades of grass: short slanting strokes, denser and darker near the viewer.
    blades = strokes(h, w, 80, 26, 2, SEED + 702) * .5 + strokes(h, w, 100, 26, 2, SEED + 703) * .5
    blade = np.clip((blades - .6) * 4, 0, 1) * np.clip((y - .25) / .5, 0, 1)
    img = img * (1 - blade[..., None] * .18)
    # Cream flecks, more and larger near the viewer.
    r = np.random.default_rng(SEED + 704)
    fl = np.zeros((h, w), np.float32)
    n = 9000
    ys = (r.random(n) ** .7 * (h - 1)).astype(int)
    xs = (r.random(n) * (w - 1)).astype(int)
    for dx in range(-2, 3):
        fl[ys, np.clip(xs + dx, 0, w - 1)] = np.maximum(fl[ys, np.clip(xs + dx, 0, w - 1)], (r.random(n) * .6 + .4) * (1 - abs(dx) / 3))
    fl = np.clip(blur(fl, .7) * 2, 0, 1) * (.35 + .65 * y)
    img = img * (1 - fl[..., None] * .8) + rgb('#f6dcb6') * fl[..., None] * .8
    # Flowers: lilac and cream discs with a tiny dark centre, in the lower two thirds, bigger near the viewer.
    m = 260
    fx = (r.random(m) * (w - 12)).astype(int) + 6
    fy = np.clip((h * (.3 + r.random(m) ** .8 * .68)).astype(int), 6, h - 7)
    kinds = r.random(m)
    for i in range(m):
        col = rgb('#cdb4ee') if kinds[i] < .55 else rgb('#fff1dc')
        s = 2 + int(fy[i] / h * 3)
        yy, xx = fy[i], fx[i]
        dy, dx = np.mgrid[-s:s + 1, -s:s + 1]
        disc = (dy * dy + dx * dx <= s * s)[..., None]
        patch = img[yy - s:yy + s + 1, xx - s:xx + s + 1]
        img[yy - s:yy + s + 1, xx - s:xx + s + 1] = np.where(disc, patch * .15 + col * .85, patch)
        img[yy, xx] = rgb('#b8612f')
    # Mist where the meadow meets the mountains' feet, and the far edge fades out.
    mist = np.clip(1 - y / .22, 0, 1) ** 1.5
    img = img * (1 - mist[..., None] * .55) + rgb('#f0a9a8') * mist[..., None] * .55
    alpha = np.clip(y / .12, 0, 1) ** .8
    img = img + grain(h, w, SEED + 705, .03)[..., None]
    return np.clip(img, 0, 1), alpha


# ---------------------------------------------------------------------------------------------------------------
# Brushwork on its own, in grey: broad sideways strokes laid over the whole painted sky (CSS blends it softly), so
# every weather looks painted whatever its colour. It tiles both ways without a seam: each axis is blended with a
# copy of itself shifted by half, weighted so that both edges end on the same strokes.
def seamless(a):
    for axis in (1, 0):
        n = a.shape[axis]
        t = np.abs(np.linspace(-1, 1, n, dtype=np.float32))
        t = t[None, :] if axis == 1 else t[:, None]
        a = a * (1 - t) + np.roll(a, n // 2, axis=axis) * t
    return a


def paint_brush(w=1024, h=1024):
    a = (stretched(h, w, 220, 34, SEED + 600) - .5) * .9 + (stretched(h, w, 70, 9, SEED + 601) - .5) * .45
    a = seamless(a) + grain(h, w, SEED + 602, .12)
    return np.clip(.5 + a * .5, 0, 1)


def save(path, rgb_img, alpha=None, quality=82):
    data = (np.clip(rgb_img, 0, 1) * 255 + .5).astype(np.uint8)
    im = Image.fromarray(data, 'RGB')
    if alpha is not None:
        im.putalpha(Image.fromarray((np.clip(alpha, 0, 1) * 255 + .5).astype(np.uint8), 'L'))
    im.save(path, 'WEBP', quality=quality, method=6)
    print(path, f'{path.stat().st_size // 1024} KB')


# ---------------------------------------------------------------------------------------------------------------
# Her worlds (11 October 2026: the user asked for a collection of painted places, a time of day and a foreground).
# Every world shares this style; each leaves a calm area behind her and takes the weather on top (studio.css).

def paint_sky_world(stops, horizon=.66, sun=None, halo_col='#ff8f5a', glow_col='#ffd291', disc_col='#fff3d6', disc=.042,
                    halo_amt=.28, glow_amt=.7, clouds=(), cloud_light='#ffe0c0', stars=0, moon=None, overcast=0.,
                    overcast_cols=('#8e86a3', '#c9c0cf'), drift=(.05, -.02, -.06), seed=SEED, w=1800, h=1200):
    """A sky painted like paint_sky, from its own colour stops: a sun (or only its glow), a crescent moon, cloud
    streaks, an overcast layer of soft cloud masses and stars."""
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :] * np.ones((h, 1), np.float32)
    wob = (stretched(h, w, 260, 40, seed + 1) - .5) * .06 + (stretched(h, w, 90, 16, seed + 2) - .5) * .02
    sky = ramp(stops, (y + wob) / horizon)
    sky = sky + (x - .5)[..., None] * np.array(drift, np.float32) * np.clip(1.4 - y * 1.2, 0, 1)[..., None]
    if overcast:
        mass = blur(stretched(h, w, 420, 110, seed + 3), 6)
        tone = stretched(h, w, 300, 80, seed + 4)
        col = ramp([(0, overcast_cols[0]), (1, overcast_cols[1])], tone)
        mask = np.clip((mass - .36) * 2.4, 0, 1) * overcast * np.clip(1.25 - y / horizon * .9, 0, 1)
        sky = sky * (1 - mask[..., None]) + col * mask[..., None]
    if sun:
        sx, sy = sun
        dist = np.sqrt(((x - sx) * 1.5) ** 2 + (y - sy) ** 2)
        sky = sky + (rgb(halo_col) - sky) * halo_amt * np.exp(-(dist / .45) ** 2)[..., None]
        sky = sky + (rgb(glow_col) - sky) * glow_amt * np.exp(-(dist / .14) ** 2)[..., None]
        if disc:
            d = np.clip((disc - dist) / .005, 0, 1)[..., None]
            sky = sky * (1 - d) + rgb(disc_col) * d
    for i, (cy, cx, length, thick, col, alpha) in enumerate(clouds):
        cy = cy * horizon
        u = (x - cx) / length
        taper = np.clip(1 - u ** 2, 0, 1) ** 1.5
        off = (stretched(h, w, 220, 60, seed + 10 + i) - .5) * .03
        band = np.exp(-((y - cy - off) / (thick * (.4 + taper))) ** 2) * taper
        broken = np.clip((stretched(h, w, 70, 20, seed + 20 + i) - .35) * 2.2, 0, 1)
        mask = blur(band * broken, 1.5)[..., None] * alpha
        lit = np.clip((y - cy) / thick * .5 + .5, 0, 1)[..., None]
        c = rgb(col) * (1 - .25 * lit) + rgb(cloud_light) * .25 * lit
        sky = sky * (1 - mask) + c * mask
    if moon:
        mx, my, mr = moon
        dist = np.sqrt(((x - mx) * 1.5) ** 2 + (y - my) ** 2)
        sky = sky + (rgb('#b9b3ee') - sky) * .2 * np.exp(-(dist / .32) ** 2)[..., None]
        sky = sky + (rgb('#e9e4ff') - sky) * .3 * np.exp(-(dist / .07) ** 2)[..., None]
        whole = np.clip((mr - dist) / .004, 0, 1)
        # A crescent: the disc less a slightly smaller one shifted to the upper left.
        sd = np.sqrt(((x - mx + mr * .42 / 1.5) * 1.5) ** 2 + (y - my + mr * .25) ** 2)
        shadow = np.clip((mr * .95 - sd) / .004, 0, 1)
        lit = (whole * (1 - shadow * .88))[..., None]
        sky = sky * (1 - lit) + rgb('#fff6e2') * lit
    if stars:
        r = np.random.default_rng(seed + 9)
        st = np.zeros((h, w), np.float32)
        ys = (r.random(stars) ** 1.5 * .6 * h).astype(int)
        xs = (r.random(stars) * w).astype(int)
        st[ys, xs] = r.random(stars) ** 2 * .85 + .15
        big = r.random(stars) > .93
        for yy, xx in zip(ys[big], xs[big]):
            st[max(0, yy - 1):yy + 2, max(0, xx - 1):xx + 2] = np.maximum(st[max(0, yy - 1):yy + 2, max(0, xx - 1):xx + 2], .55)
        st = np.clip(blur(st, .8) * 2.4, 0, 1) * np.clip(1.15 - y * 1.6 / horizon, 0, 1)
        sky = sky + st[..., None] * (rgb('#fff6ea') - sky)
    sky = sky + grain(h, w, seed + 31, .03)[..., None]
    return np.clip(sky, 0, 1)


def smooth1d(a, sigma):
    """A Gaussian blur along a line, with its ends extended."""
    if sigma < .5:
        return a
    k = np.arange(-int(sigma * 3), int(sigma * 3) + 1)
    g = np.exp(-(k / sigma) ** 2 / 2)
    g /= g.sum()
    pad = len(k) // 2
    return np.convolve(np.pad(a, pad, mode='edge'), g, mode='valid')


def bump_line(w, bumps, base, shape='hill', soften=0., jag=0., seed=0):
    """A skyline (a fraction of the height, from the top) from bumps: (x, height, half-width). Hills are soft bells
    whose valleys are smoothed; canopies are round; trees are narrow points with ragged edges, like a wood seen from
    afar."""
    x = np.linspace(0, 1, w)
    top = np.zeros(w)
    for cx, ht, hw in bumps:
        d = (x - cx) / hw
        if shape == 'hill':
            cap = ht * np.exp(-d * d * 2.2)
        elif shape == 'round':
            cap = ht * np.sqrt(np.clip(1 - d * d, 0, 1))
        else:
            cap = ht * np.clip(1 - np.abs(d), 0, 1) ** 1.12
        top = np.maximum(top, cap)
    if soften:
        top = smooth1d(top, soften * w)
    if jag:
        top = top + fbm(w, 4, seed, 260) * jag * (top > .002)
    return base - top


def crowns_on(top, crowns):
    """Round crowns of trees standing on a skyline: (x, radius as a fraction of the width, height)."""
    w = len(top)
    x = np.linspace(0, 1, w)
    for cx, rad, rise in crowns:
        b = top[int(np.clip(cx, 0, 1) * (w - 1))]
        d = (x - cx) / rad
        cap = rise * np.sqrt(np.clip(1 - d * d, 0, 1))
        top = np.where(cap > 0, np.minimum(top, b - cap), top)
    return top


def paint_layers(layers, w=3600, h=900, seed=SEED):
    """Paint skylines from far to near, each lit and textured like the mountains (paint_range)."""
    img = np.zeros((h, w, 3), np.float32)
    alpha = np.zeros((h, w), np.float32)
    for top, L in layers:
        paint_range(img, alpha, top, None, L.get('peaks', []), L, L['seed'])
    img = img + grain(h, w, seed + 500, .025)[..., None]
    return np.clip(img, 0, 1), alpha


def scatter(n, seed, lo, hi, wlo, whi, x0=-.05, x1=1.05, keep=None):
    """n random bumps: (x, height, half-width), optionally only where keep(x) is true."""
    r = np.random.default_rng(seed)
    out = []
    while len(out) < n:
        cx = x0 + r.random() * (x1 - x0)
        if keep and not keep(cx):
            continue
        out.append((cx, lo + r.random() * (hi - lo), wlo + r.random() * (whi - wlo)))
    return out


def land_lilac(w=3600, h=900, seed=SEED + 1100):
    """Lilac hills: hazy lilac hills far off, lavender ones lit peach, then sage hills with round trees on them."""
    far = bump_line(w, scatter(11, seed, .1, .2, .07, .15), .6, soften=.006)
    mid = bump_line(w, scatter(9, seed + 1, .09, .17, .09, .18), .76, soften=.008)
    near = bump_line(w, scatter(8, seed + 2, .06, .12, .1, .22), .9, soften=.01)
    # A few small groves of round trees on the near hills, at the sides, so the middle stays calm behind her.
    r = np.random.default_rng(seed + 3)
    groves = []
    for gx in (.08, .22, .8, .93):
        for k in range(3 + int(r.random() * 2)):
            rad = .007 + r.random() * .006
            groves.append((gx + (k - 1.5) * .012 + r.random() * .006, rad, rad * w / h * (.85 + r.random() * .25)))
    near = crowns_on(near, groves)
    front = bump_line(w, scatter(6, seed + 4, .03, .07, .18, .3), 1.0, soften=.01)
    return paint_layers([
        (far, dict(depth=.6, stroke=110, texture=.1, seed=seed + 10, rim=.3, rim_col='#ffe4d2', contrast=3,
                   shade=[(0, '#ad97cf'), (1, '#9d88c2')], light=[(0, '#eac3d6'), (1, '#d8b6d3')], patch='#c3a6d8',
                   haze=.32, haze_col='#f4c8ca', mist=.6, mist_col='#f6d2ca')),
        (mid, dict(depth=.55, stroke=130, texture=.14, seed=seed + 20, rim=.45, rim_col='#ffe0c8', contrast=3.5,
                   shade=[(0, '#9a8db6'), (1, '#80799f')], light=[(0, '#e8c2b6'), (1, '#c9b0b5')], patch='#b3a1c9',
                   haze=.1, haze_col='#f2c6c2', mist=.5, mist_col='#f3cbc2')),
        (near, dict(depth=.45, stroke=150, texture=.2, seed=seed + 30, rim=.4, rim_col='#fbe6c4', contrast=4,
                    shade=[(0, '#7d9083'), (1, '#64796b')], light=[(0, '#d8cfa0'), (1, '#b3ba8b')], patch='#9bb08c',
                    mist=.32, mist_col='#ead1b8')),
        (front, dict(depth=.3, stroke=170, texture=.24, seed=seed + 40, rim=.25, rim_col='#f4ecc8', contrast=4,
                     shade=[(0, '#5f735f'), (1, '#4b5d4c')], light=[(0, '#a8b682'), (1, '#8a9a6c')], patch='#7f9670',
                     flecks=5000, fleck_col='#f5e9cd')),
    ], w, h, seed)


def land_garden(w=3600, h=900, seed=SEED + 1200):
    """Rain garden: a far line of plum trees in the drizzle, a clipped green hedge with round topiary, and plum shrubs
    flecked with pink flowers."""
    far = bump_line(w, scatter(110, seed, .06, .15, .018, .042), .58, shape='round')
    hedge = bump_line(w, [(c, .05, .14) for c in np.linspace(-.05, 1.05, 9)], .8, shape='round')
    hedge = crowns_on(hedge, [(c, .02 + .012 * (i % 3), .06 + .03 * (i % 2)) for i, c in enumerate(np.linspace(.02, .98, 13))])
    shrubs = bump_line(w, scatter(40, seed + 1, .04, .11, .02, .05), .98, shape='round')
    return paint_layers([
        (far, dict(depth=.6, stroke=110, texture=.12, seed=seed + 10, rim=.25, rim_col='#ead2e2', contrast=3,
                   shade=[(0, '#5d4768'), (1, '#4c3a59')], light=[(0, '#9a7a96'), (1, '#7e617e')], patch='#6f5577',
                   haze=.3, haze_col='#b9a2b8', mist=.55, mist_col='#c6b2c4')),
        (hedge, dict(depth=.5, stroke=130, texture=.2, seed=seed + 20, rim=.3, rim_col='#e6ebd3', contrast=4,
                     shade=[(0, '#4f5d4e'), (1, '#3f4b3f')], light=[(0, '#94a181'), (1, '#77876b')], patch='#68775f',
                     mist=.35, mist_col='#aa9cae', flecks=2600, fleck_col='#e2a7c8')),
        (shrubs, dict(depth=.35, stroke=150, texture=.24, seed=seed + 30, rim=.25, rim_col='#efd4e4', contrast=4,
                      shade=[(0, '#4c3651'), (1, '#37273d')], light=[(0, '#8b6686'), (1, '#6e506d')], patch='#5d4462',
                      flecks=1800, fleck_col='#eebcd5')),
    ], w, h, seed)


def land_winter(w=3600, h=900, seed=SEED + 1300):
    """Winter wood: a far blue-grey wood in blush haze, nearer firs with snow on their tops, and a few tall dark firs
    at the sides, so the middle stays open behind her."""
    far_trees = scatter(280, seed, .035, .085, .0035, .0075)
    far = np.minimum(bump_line(w, far_trees, .62, shape='tree', jag=.006, seed=seed),
                     bump_line(w, scatter(6, seed + 5, .02, .05, .15, .3), .62, soften=.01))
    mid_trees = scatter(120, seed + 1, .08, .19, .007, .014)
    mid = bump_line(w, mid_trees, .82, shape='tree', jag=.01, seed=seed + 1)
    near_trees = scatter(16, seed + 2, .3, .5, .014, .026, keep=lambda c: c < .28 or c > .72)
    near = bump_line(w, near_trees, 1.04, shape='tree', jag=.014, seed=seed + 2)
    peaks = lambda trees: [(cx, ht, hw, hw) for cx, ht, hw in trees]
    snow_cols = dict(snow_shade=('#c3cde3', '#b3bed8'), snow_lit=('#ffffff', '#f4f2f8'))
    return paint_layers([
        (far, dict(depth=.6, stroke=110, texture=.08, seed=seed + 10, rim=.3, rim_col='#fff2ee', contrast=3,
                   shade=[(0, '#a0abc4'), (1, '#919ebb')], light=[(0, '#e0d4df'), (1, '#cdc7da')], patch='#b2bad0',
                   haze=.32, haze_col='#ebdbe0', mist=.6, mist_col='#f0e1e3')),
        (mid, dict(depth=.5, stroke=130, texture=.14, seed=seed + 20, rim=.45, rim_col='#fff6f2', contrast=4,
                   shade=[(0, '#6e7b98'), (1, '#5b6785')], light=[(0, '#c4c7da'), (1, '#a8afc8')], patch='#8692ad',
                   mist=.42, mist_col='#e7dfe6', peaks=peaks(mid_trees), snow=dict(above=0, deep=.28), **snow_cols)),
        (near, dict(depth=.3, stroke=150, texture=.18, seed=seed + 30, rim=.35, rim_col='#f6f4ff', contrast=4,
                    shade=[(0, '#46516b'), (1, '#37415b')], light=[(0, '#8e98b3'), (1, '#76809c')], patch='#5d6884',
                    peaks=peaks(near_trees), snow=dict(above=0, deep=.22), **snow_cols)),
    ], w, h, seed)


def paint_meadow_world(stops, fleck='#f6dcb6', flowers=(('#cdb4ee', .55), ('#fff1dc', 1)), n_flowers=260,
                       centre='#b8612f', mist='#f0a9a8', pool='#ffd9a8', n_flecks=9000, seed=SEED + 1400, w=2400, h=800):
    """A meadow like paint_meadow, in a world's own colours and flowers."""
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    x = np.linspace(0, 1, w, dtype=np.float32)[None, :] * np.ones((h, 1), np.float32)
    base = ramp(stops, y)
    st = strokes(h, w, 0, 140, 5, seed) * (1 - y) + strokes(h, w, 0, 320, 14, seed + 1) * y
    img = base * (1 + (st - .5) * (.16 + .2 * y))[..., None] * (1 + (x - .5) * .12 * (1 - y))[..., None]
    img = img + (np.exp(-(((x - .5) * 2.4) ** 2 + ((y - .22) * 3) ** 2)) * .12)[..., None] * rgb(pool)
    blades = strokes(h, w, 80, 26, 2, seed + 2) * .5 + strokes(h, w, 100, 26, 2, seed + 3) * .5
    img = img * (1 - (np.clip((blades - .6) * 4, 0, 1) * np.clip((y - .25) / .5, 0, 1))[..., None] * .18)
    r = np.random.default_rng(seed + 4)
    fl = np.zeros((h, w), np.float32)
    ys = (r.random(n_flecks) ** .7 * (h - 1)).astype(int)
    xs = (r.random(n_flecks) * (w - 1)).astype(int)
    for dx in range(-2, 3):
        fl[ys, np.clip(xs + dx, 0, w - 1)] = np.maximum(fl[ys, np.clip(xs + dx, 0, w - 1)], (r.random(n_flecks) * .6 + .4) * (1 - abs(dx) / 3))
    fl = np.clip(blur(fl, .7) * 2, 0, 1) * (.35 + .65 * y)
    img = img * (1 - fl[..., None] * .8) + rgb(fleck) * fl[..., None] * .8
    fx = (r.random(n_flowers) * (w - 14)).astype(int) + 7
    fy = np.clip((h * (.28 + r.random(n_flowers) ** .8 * .7)).astype(int), 7, h - 8)
    kinds = r.random(n_flowers)
    for i in range(n_flowers):
        col = rgb(next(c for c, upto in flowers if kinds[i] <= upto))
        s = 2 + int(fy[i] / h * 4)
        yy, xx = fy[i], fx[i]
        dy, dx = np.mgrid[-s:s + 1, -s:s + 1]
        disc = (dy * dy + dx * dx <= s * s)[..., None]
        patch = img[yy - s:yy + s + 1, xx - s:xx + s + 1]
        img[yy - s:yy + s + 1, xx - s:xx + s + 1] = np.where(disc, patch * .15 + col * .85, patch)
        img[yy, xx] = rgb(centre)
    m = np.clip(1 - y / .22, 0, 1) ** 1.5
    img = img * (1 - m[..., None] * .55) + rgb(mist) * m[..., None] * .55
    img = img + grain(h, w, seed + 5, .03)[..., None]
    return np.clip(img, 0, 1), np.clip(y / .12, 0, 1) ** .8


def paint_terrace(w=2400, h=800, seed=SEED + 1700):
    """The rain garden's ground: a terrace of wet flagstones going away from her, mossy in the joints, the sky lying in
    the wet stone (most where it is seen at a glance, far off) and in wide shallow puddles."""
    y = np.linspace(0, 1, h, dtype=np.float64)[:, None] * np.ones((1, w))
    x = np.linspace(0, 1, w, dtype=np.float64)[None, :] * np.ones((h, 1))
    z = 1 / (y + .07)
    gx = (x - .5) * z * 1.6
    D, Wd, g = .5, .4, .022
    row = np.floor(z / D)
    fz = z / D - row
    u = gx / Wd + (row % 2) * .5 + (row % 3) * .17
    col = np.floor(u)
    fu = u - col
    joint = np.minimum(np.minimum(fz, 1 - fz) * D, np.minimum(fu, 1 - fu) * Wd)
    grout = (np.clip(1 - joint / g, 0, 1) ** 1.5).astype(np.float32)
    hsh = np.sin(row * 12.9898 + col * 78.233) * 43758.5453
    hsh = (hsh - np.floor(hsh)).astype(np.float32)
    y, x = y.astype(np.float32), x.astype(np.float32)
    stone = ramp([(0, '#786a82'), (.35, '#8b8193'), (.7, '#998b8d'), (1, '#83768e')], hsh)
    tex = (stretched(h, w, 40, 14, seed) - .5) * .14 + (stretched(h, w, 9, 5, seed + 1) - .5) * .07
    img = stone * (1 + tex[..., None])
    moss = ramp([(0, '#46503f'), (1, '#6b7858')], stretched(h, w, 30, 30, seed + 2))
    img = img * (1 - grout[..., None] * .85) + (moss * .55 + rgb('#3a3240') * .45) * grout[..., None] * .85
    sky = ramp([(0, '#dccfdc'), (.5, '#ab9bb5'), (1, '#716584')], y)
    sheen = stretched(h, w, 90, 20, seed + 3)
    wet = (.12 + .42 * (1 - y) ** 2) * (.75 + .5 * sheen)
    pools = np.clip((blur(stretched(h, w, 200, 30, seed + 4), 4) - .68) * 7, 0, 1) * np.clip((y - .1) * 4, 0, 1)
    wet = np.clip(wet + pools * .72, 0, .92)
    img = img * (1 - wet[..., None]) + sky * wet[..., None]
    img = img * (1 - np.clip(blur(pools, 3) - pools, 0, 1)[..., None] * .5)
    img = img * (1 - .25 * y[..., None])
    m = np.clip(1 - y / .18, 0, 1) ** 1.4
    img = img * (1 - m[..., None] * .5) + rgb('#c8bbcb') * m[..., None] * .5
    img = img + grain(h, w, seed + 5, .03)[..., None]
    return np.clip(img, 0, 1), np.clip(y / .12, 0, 1) ** .8


def paint_snowfield(w=2400, h=800, seed=SEED + 1800):
    """The winter wood's ground: snow in soft drifts, blush far off and blue in the near shadows, glinting, with a few
    stalks of dry grass through it."""
    y = np.linspace(0, 1, h, dtype=np.float32)[:, None] * np.ones((1, w), np.float32)
    base = ramp([(0, '#f3e2e0'), (.2, '#ece3ec'), (.5, '#dde1ee'), (.8, '#c9d1e6'), (1, '#b3bedb')], y)
    drift = blur(stretched(h, w, 160, 20, seed), 2)
    slope = np.gradient(drift, axis=1) * w * .05
    light = np.clip(.5 + slope * 6, 0, 1)
    img = base * (.95 + .1 * light[..., None])
    shade = np.clip(.42 - light, 0, 1)[..., None] * (.3 + .7 * y[..., None])
    img = img * (1 - shade * .3) + rgb('#a7b3d8') * shade * .3
    stalks = np.clip((strokes(h, w, 92, 30, 2, seed + 1) - .72) * 5, 0, 1) * np.clip((y - .35) / .4, 0, 1)
    stalks = stalks * np.clip((stretched(h, w, 120, 60, seed + 2) - .55) * 4, 0, 1)
    img = img * (1 - stalks[..., None] * .55) + rgb('#7f8aa3') * stalks[..., None] * .55
    r = np.random.default_rng(seed + 3)
    gl = np.zeros((h, w), np.float32)
    n = 7000
    ys = (r.random(n) ** .8 * (h - 1)).astype(int)
    xs = (r.random(n) * (w - 1)).astype(int)
    gl[ys, xs] = r.random(n) * .8 + .2
    gl = np.clip(blur(gl, .6) * 2.5, 0, 1) * (.3 + .7 * y)
    img = img + gl[..., None] * (1 - img)
    m = np.clip(1 - y / .16, 0, 1) ** 1.5
    img = img * (1 - m[..., None] * .4) + rgb('#f3dcdb') * m[..., None] * .4
    img = img + grain(h, w, seed + 4, .02)[..., None]
    return np.clip(img, 0, 1), np.clip(y / .12, 0, 1) ** .8


def paint_front(blades, flowers=(), leaves=(), snow=False, seed=SEED + 1900, w=2400, h=640):
    """The foreground: tall grass, flowers, leaves or snow at both edges of the picture and only low tufts in the
    middle, below her feet (which stand about 45% down this picture), drawn larger than life and a little out of
    focus, so she reads as tiny."""
    S = 2
    W, H = w * S, h * S
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    r = np.random.default_rng(seed)
    hexa = lambda c, a=255: tuple(int(c[i:i + 2], 16) for i in (1, 3, 5)) + (a,)

    def edge():
        """A place along the width, mostly near the edges, and how near the edge it is (1 at the edge)."""
        t = r.random() ** 1.7 * .36
        xf = t if r.random() < .5 else 1 - t
        return xf, 1 - t / .36

    def blade(bx, by, length, width, lean, col, tip=None):
        left, right = [], []
        for k in range(10):
            t = k / 9
            cx = bx + lean * length * t * t
            cy = by - length * t
            half = width * (1 - t) ** .85 / 2
            left.append((cx - half, cy))
            right.append((cx + half, cy))
        d.polygon(left + right[::-1], fill=hexa(col))
        if tip:
            d.polygon(left[6:] + right[6:][::-1], fill=hexa(tip, 220))

    # Grass: tall at the edges, short tufts across the middle near the bottom.
    for _ in range(900):
        xf, near = edge()
        length = H * (.22 + .72 * near ** 1.3) * (.55 + .45 * r.random())
        col = blades[int(r.random() * len(blades))]
        blade(xf * W, H * (1.02 + .06 * r.random()), length, W * (.004 + .006 * r.random()), (r.random() - .5) * .5,
              col, tip='#ffffff' if snow and r.random() < .6 else None)
    for _ in range(420):
        xf = .3 + r.random() * .4
        blade(xf * W, H * (1.03 + .04 * r.random()), H * (.12 + .2 * r.random()), W * (.0035 + .004 * r.random()),
              (r.random() - .5) * .6, blades[int(r.random() * len(blades))], tip='#ffffff' if snow and r.random() < .5 else None)
    # Leaves: broad and pointed on curved stems, near the edges.
    for _ in range(len(leaves) and 70):
        xf, near = edge()
        cx, cy = xf * W, H * (1 - .55 * near * r.random() - .1)
        ang = (r.random() - .5) * 1.6 - np.pi / 2
        L, B = H * (.12 + .14 * r.random()), H * (.04 + .04 * r.random())
        col = leaves[int(r.random() * len(leaves))]
        pts = []
        for k in range(24):
            a = k / 23 * 2 * np.pi
            px, py = np.cos(a) * L / 2, np.sin(a) * B / 2 * (1 - .35 * np.cos(a))
            pts.append((cx + px * np.cos(ang) - py * np.sin(ang), cy + px * np.sin(ang) + py * np.cos(ang)))
        d.polygon(pts, fill=hexa(col))
        d.line([(cx - L / 2 * np.cos(ang) * .9, cy - L / 2 * np.sin(ang) * .9), (cx + L / 2 * np.cos(ang) * .9, cy + L / 2 * np.sin(ang) * .9)],
               fill=hexa('#ffffff', 60), width=S * 2)
    # Flowers: a thin stem and five round petals around a centre.
    for _ in range(len(flowers) and 120):
        xf, near = edge()
        bx, top = xf * W, H * (1 - (.25 + .6 * near) * (.6 + .4 * r.random()))
        d.line([(bx, H * 1.02), (bx + (r.random() - .5) * W * .01, top)], fill=hexa(blades[0]), width=S * 2)
        col, rad = flowers[int(r.random() * len(flowers))], H * (.012 + .014 * r.random())
        for k in range(5):
            a = k / 5 * 2 * np.pi + r.random()
            px, py = bx + np.cos(a) * rad, top + np.sin(a) * rad
            d.ellipse([px - rad * .8, py - rad * .8, px + rad * .8, py + rad * .8], fill=hexa(col))
        d.ellipse([bx - rad * .45, top - rad * .45, bx + rad * .45, top + rad * .45], fill=hexa('#f3c46a'))
    im = im.resize((w, h), Image.LANCZOS)
    a = np.asarray(im, np.float32) / 255
    rgbf, alpha = a[..., :3], a[..., 3]
    rgbf = rgbf * (1 + (stretched(h, w, 30, 12, seed + 1) - .5)[..., None] * .14)
    # A little out of focus: she is the sharpest thing in the picture.
    rgbf = blur(rgbf * alpha[..., None], 1.1)
    alpha = blur(alpha, 1.1)
    rgbf = rgbf / np.maximum(alpha[..., None], 1e-4)
    return np.clip(rgbf, 0, 1), np.clip(alpha, 0, 1)


# ---------------------------------------------------------------------------------------------------------------
# The worlds. Skies are given by their colour stops (top to horizon) and the sun or moon; `light` is the colour of the
# light on her at the golden hours, by day and by night, with her fill and rim; `ground` the colours she stands on.
# The golden sky is shown in the evening and, mirrored, at dawn. The apricot mountains' golden sky is the original.
NIGHT_CLOUD = '#9a90cc'
WORLDS = {
    'apricot-mountains': dict(
        name='Apricot mountains',
        skies=dict(
            golden=dict(stops=APRICOT_SKY, sun=(.6, .36), original=True),
            day=dict(stops=[(0, '#6f7fcf'), (.25, '#8f97da'), (.5, '#b9addf'), (.7, '#dcbad8'), (.85, '#f0cdc8'), (1, '#f9e2cb')],
                     sun=(.7, .16), halo_col='#ffe1b8', glow_col='#fff4dc', disc_col='#fffaf0', halo_amt=.2, glow_amt=.6, cloud_light='#ffffff',
                     clouds=[(.3, .25, .45, .008, '#f4ecf7', .6), (.42, .6, .5, .009, '#f7e9ee', .55), (.5, .15, .3, .007, '#fbefe6', .5), (.36, .85, .35, .007, '#efe6f6', .5)]),
            night=dict(stops=[(0, '#0a0820'), (.2, '#151239'), (.4, '#241c52'), (.6, '#3a2c6a'), (.8, '#5a4380'), (1, '#7a5684')],
                       moon=(.3, .2, .03), stars=900, cloud_light=NIGHT_CLOUD,
                       clouds=[(.42, .62, .45, .007, '#5d4d86', .45), (.52, .25, .4, .006, '#6a5590', .4)])),
        light=dict(golden='#ffd3a6', day='#fff3e3', night='#b9c2ff', fill='#c7b0e6', rim='#ffb07a'),
        ground=[(0, '#c9784a'), (.5, '#8a4a2a'), (1, '#4a2416')],
        land=lambda: paint_mountains(), floor=lambda: paint_meadow(),
        front=dict(blades=['#8a4528', '#a85a30', '#c27a42', '#6f3a24', '#d39a5c'], flowers=['#cdb4ee', '#fff1dc'], seed=SEED + 1910)),
    'lilac-hills': dict(
        name='Lilac hills',
        skies=dict(
            golden=dict(stops=[(0, '#2e2560'), (.18, '#4e3f86'), (.36, '#7d66ad'), (.52, '#ad8ccb'), (.66, '#d6a5c9'), (.78, '#efb4b6'), (.9, '#f8cdb4'), (1, '#fde3cc')],
                        sun=(.56, .42), halo_col='#ffad94', glow_col='#ffe2c2', disc_col='#fff4e6', stars=220, seed=SEED + 2100,
                        clouds=[(.3, .25, .5, .006, '#b99bd8', .5), (.4, .65, .45, .006, '#dcaed2', .5), (.5, .35, .4, .007, '#f3bcc0', .55), (.58, .8, .3, .006, '#fbd0c0', .5)]),
            day=dict(stops=[(0, '#8b9fdc'), (.3, '#adb6e6'), (.55, '#d2c8ee'), (.75, '#ecd8ea'), (.9, '#f8e6e4'), (1, '#fdf0e6')],
                     sun=(.66, .15), halo_col='#ffe6cc', glow_col='#fff6e6', disc_col='#fffbf2', halo_amt=.2, glow_amt=.6, cloud_light='#ffffff', seed=SEED + 2110,
                     clouds=[(.32, .3, .45, .008, '#f6f0fb', .6), (.45, .7, .4, .008, '#fbeff3', .55), (.55, .12, .3, .007, '#fff3ec', .5)]),
            night=dict(stops=[(0, '#0b0a24'), (.25, '#1a1747'), (.5, '#2f2868'), (.75, '#4f4386'), (1, '#73618f')],
                       moon=(.35, .22, .028), stars=800, cloud_light=NIGHT_CLOUD, seed=SEED + 2120,
                       clouds=[(.45, .7, .4, .006, '#4f4580', .4)])),
        light=dict(golden='#ffd6c4', day='#fff6ec', night='#c3c6ff', fill='#cdb8ea', rim='#ffc1b0'),
        ground=[(0, '#cfd2a6'), (.5, '#8ea076'), (1, '#4c6045')],
        land=lambda: land_lilac(),
        floor=lambda: paint_meadow_world([(0, '#f1d9c4'), (.18, '#d9d2a6'), (.45, '#aebb8a'), (.75, '#7c9468'), (1, '#4c6045')],
                                         fleck='#f7ecd2', flowers=(('#f2b6cc', .4), ('#cdb4ee', .75), ('#fff1dc', 1)), n_flowers=700,
                                         centre='#c98a5a', mist='#f5d0c4', pool='#ffe6c8', seed=SEED + 1410),
        front=dict(blades=['#6f8a64', '#86a074', '#a2b585', '#5b7255', '#bcc79a'], flowers=['#f2b6cc', '#cdb4ee', '#fff1dc'], seed=SEED + 1920)),
    'rain-garden': dict(
        name='Rain garden',
        skies=dict(
            golden=dict(stops=[(0, '#261c38'), (.3, '#433455'), (.55, '#6b5675'), (.75, '#937188'), (.9, '#b98d92'), (1, '#d4a99c')],
                        sun=(.62, .55), disc=0, halo_col='#e7a58f', glow_col='#f3c7ad', halo_amt=.3, glow_amt=.35,
                        overcast=.85, overcast_cols=('#4d3f5c', '#8a7489'), seed=SEED + 2200),
            day=dict(stops=[(0, '#67637f'), (.35, '#8a86a0'), (.65, '#ada7bb'), (.85, '#c9c2cf'), (1, '#ddd6dc')],
                     overcast=.9, overcast_cols=('#77728d', '#c2bccb'), seed=SEED + 2210),
            night=dict(stops=[(0, '#0c0a16'), (.4, '#1a1529'), (.7, '#2a2238'), (1, '#3d3249')], stars=140,
                       overcast=.8, overcast_cols=('#1c1728', '#3a3148'), seed=SEED + 2220)),
        light=dict(golden='#f1c7b8', day='#ebe6f2', night='#a9a7d6', fill='#b9a9cf', rim='#e7c3d6'),
        ground=[(0, '#a79bab'), (.5, '#6f6577'), (1, '#3d3545')],
        land=lambda: land_garden(), floor=lambda: paint_terrace(),
        front=dict(blades=['#4f5d4e', '#5f6f58', '#6d5470'], leaves=['#5a4363', '#6e5276', '#55634f', '#6b7a5f', '#7d5d80'],
                   flowers=['#e2a7c8', '#c98fb7'], seed=SEED + 1930)),
    'winter-wood': dict(
        name='Winter wood',
        skies=dict(
            golden=dict(stops=[(0, '#4d5c8a'), (.25, '#7480aa'), (.5, '#a4a6c8'), (.7, '#cdbccf'), (.85, '#ebcfcf'), (1, '#f8e4dc')],
                        sun=(.6, .44), halo_col='#ffcfb8', glow_col='#fff0de', disc_col='#fffaf2', stars=120, seed=SEED + 2300,
                        clouds=[(.35, .3, .5, .006, '#c9c3dc', .5), (.48, .7, .4, .006, '#e6cdd8', .5)]),
            day=dict(stops=[(0, '#7f9cc9'), (.3, '#a3b8db'), (.6, '#c8d5ea'), (.85, '#e2e9f2'), (1, '#f1f3f5')],
                     sun=(.68, .16), halo_col='#fff1e2', glow_col='#ffffff', disc_col='#ffffff', halo_amt=.18, glow_amt=.55, cloud_light='#ffffff', seed=SEED + 2310,
                     clouds=[(.34, .28, .45, .008, '#f4f6fb', .55), (.46, .72, .4, .008, '#f7f7fb', .5)]),
            night=dict(stops=[(0, '#060a1a'), (.3, '#0e1834'), (.6, '#1b2a50'), (.85, '#2f4069'), (1, '#45567f')],
                       moon=(.32, .2, .03), stars=1000, cloud_light=NIGHT_CLOUD, seed=SEED + 2320)),
        light=dict(golden='#ffe2d2', day='#f4f8ff', night='#bcd0ff', fill='#c4cbe6', rim='#ffe6e0'),
        ground=[(0, '#f1e6ea'), (.5, '#d3d9ea'), (1, '#aeb9d6')],
        land=lambda: land_winter(), floor=lambda: paint_snowfield(),
        front=dict(blades=['#7c88a4', '#929dba', '#6a7591', '#a9b2ca'], snow=True, seed=SEED + 1940)),
}


def write_palettes(path):
    """The colours the app needs for the light on her, in the order the painting uses them."""
    out = {}
    for wid, W in WORLDS.items():
        skies = {}
        for v, sk in W['skies'].items():
            skies[v] = dict(stops=[[float(t), c] for t, c in sk['stops']], sun=list(sk['sun']) if sk.get('sun') else None,
                            moon=list(sk['moon'][:2]) if sk.get('moon') else None, horizon=sk.get('horizon', .66))
        out[wid] = dict(name=W['name'], sky=skies, ground=[[float(t), c] for t, c in W['ground']], light=W['light'])
    path.write_text('// Generated by scripts/art/paint-scenery.py from its WORLDS: each world\'s sky colours (top to horizon) with its sun\n'
                    '// or moon, its ground and the colours of the light on her (src/doll/light.js). Repaint rather than edit.\n'
                    'export const PALETTES = ' + json.dumps(out, indent=1) + ';\n')
    print(path)


if __name__ == '__main__':
    only = set(sys.argv[1:])
    for wid, W in WORLDS.items():
        if only and wid not in only:
            continue
        out = ART / 'worlds' / wid
        out.mkdir(parents=True, exist_ok=True)
        for v, sk in W['skies'].items():
            spec = {k: val for k, val in sk.items() if k != 'original'}
            save(out / f'sky-{v}.webp', paint_sky() if sk.get('original') else paint_sky_world(**spec))
        img, alpha = W['land']()
        save(out / 'land.webp', img, alpha)
        img, alpha = W['floor']()
        save(out / 'ground.webp', img, alpha)
        img, alpha = paint_front(**W['front'])
        save(out / 'front.webp', img, alpha)
    if not only:
        b = paint_brush()
        save(ART / 'brush.webp', np.repeat(b[..., None], 3, -1), quality=70)
    write_palettes(ART / 'worlds' / 'palettes.js')
