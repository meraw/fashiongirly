# Wardrobe item: Bershka low-rise balloon jeans

Authored 11 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved. A pair on the jeans template, which gains ankle ties for it.

## Source and reference reading

The user sent one phone screenshot of the shop listing (Myntra): “Bershka Low-rise Wide-leg Balloon Jeans”, the front on a model with a pale pink tee and white heeled sandals. The user said they only had the one picture. The screenshot is not stored in the repository; a small denim swatch cut from it is.

Features read from the photo:

- Low rise, sitting on the hips.
- Wide balloon legs, fullest round the knee, curving in below the calf.
- Each ankle gathered on a drawcord channel and tied in a small bow on the outside, the ends hanging over the foot. The ties look like narrow cords in the dark denim.
- Dark rinse indigo denim with a faint vertical slub.
- Cream contrast topstitching; a seam curves forward down each leg.
- A five-pocket front: scoop pockets, a coin pocket, small silver rivets, belt loops, a silver shank button and a zip fly.

Colour, measured on the plain lower leg: indigo about (27, 36, 51).

## Implementation

Catalog ID `bershka-low-rise-balloon-jeans-v1`, in its own file, `src/wardrobe/garments/bershka-low-rise-balloon-jeans-v1.js`, with its study preset and its denim swatch (`src/wardrobe/bershka-balloon-denim.js`). It is built by `makeJeans()` in `src/doll/model.js` from the entry's `build` spec.

**New template option.** `ankleTies` (optional; no other pair uses it) ties a small bow on the outside of each gathered hem:

- a knot, two loops lying against the leg, and two ends hanging down past the hem with knotted tips;
- `colour` (the thread's by default), `above` (the bow's height over the hem), `length` (the ends') and `forward` (how far round toward the front of the leg from the outseam it sits).

A fingerprint of every vertex of every other pair of bottoms, with loafers, boots and sandals, is identical before and after the change.

**This pair:**

- **Rise:** low, on the Topshop barrel jeans' hips and waistband (top at 1.22).
- **Legs:**
  - the barrel jeans' thighs, so every long top (the striped cardigan included) still covers them;
  - swelling to their fullest round the knee (0.18 across and 0.206 deep);
  - curving in below the calf to a gathered ankle at 0.215 (0.115 by 0.14);
  - the seams twist forward down the leg.
- **The ankle:** the `cuff` gathers ripple the fabric above the channel, with a ring of cream stitching on it. The bow sits on the channel, toward the front of the outer ankle.
- **Denim:** a seamless swatch cut from the plain lower leg of the photo (brightness only, coloured to the measured indigo). Even and barely faded: little whiskering or roping.
- **Details:**
  - cream topstitching, doubled on the seams;
  - scoop pockets, a coin pocket and silver rivets;
  - belt loops, a silver button and a zip fly;
  - a back yoke and two patch pockets, assumed as on a standard five-pocket back.
- **Colour:** calibrated in a studio render. The lower leg renders (29, 35, 51) against the photo's (27, 36, 51).
- **Preset:** “Balloon jeans study”, with the cropped painted floral jumper (so the waistband shows, as in the photo) and the Dr. Martens chain sandals.

## Layering

- **Tops:** worn with every top. Tops that cover the waistband hang over it (the shared waistband test); the rugby shirt tucks in.
- **Outerwear:** worn under every jacket and coat; a dress replaces it.
- **Shoes:** gathered at the ankle, the hem sits on the collar of both boots and the sneakers. It goes over the Converse high-tops and ends above the loafers, slides and sandals.

## Styling facts

Low-rise balloon legs in dark rinse indigo with cream stitching, gathered and tied at the ankle. Warmth 2 of 4, inferred: full-length rigid denim, roomy. Mild or cool days.

## Checks

- `npm test`: 195 passing.
- The new `tests/bershka-balloon-jeans.test.js` checks:
  - the parts, and a bow on each ankle (knot, two loops, two ends with tips);
  - the low waistband;
  - balloon legs: far wider at the knee than at the gathered ankle, and fuller at the knee than the thigh;
  - the hem at her ankle;
  - the bows on the outside of each ankle at the channel;
  - cream topstitching.
- The shared bottoms tests also run on it: every waist-covering top over it, the hems over every pair of shoes, and the styling facts.
- `npm run build` succeeds.
- **Rendered** in headless Chromium (software WebGL) from the front, a turn, the side and the back, with a close-up of the ankles. Since the app now frames her in its painted scene, the renders use a small harness that builds her with the app's own model, lighting and pose code at fixed angles. No device check.

## Known differences

- Only the front is shown; the back is assumed.
- The ties are simplified cords with a small bow; the real ties are flat self-fabric strips.
- The swatch comes from a small shop photo, so the denim's grain is soft.
