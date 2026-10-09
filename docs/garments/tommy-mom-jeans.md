# Wardrobe item: Tommy Jeans ultra high rise mom jeans

Authored 8 October 2026. Status: first interpretation awaiting the user's visual review. Fifth piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The user sent four phone screenshots of an ASOS listing (“Tommy Jeans ultra high rise mom jean in mid wash”): front and back on a model, a back pocket close-up and a front waist close-up. ASOS blocks automated access, so the screenshots were the source. Photos are not stored in the repository.

Features read from the screenshots:

- Ultra high rise, at the natural waist.
- Mom fit: roomy through the hips and thighs, tapering to a narrow, ankle-length hem.
- Even mid-indigo wash, slightly paler down the thighs.
- Tan-orange topstitching, scoop front pockets with copper rivets at the corners, a silver button.
- A coin pocket with a tiny flag badge.
- Back: yoke, patch pockets each crossed by a double stitched bar, a small flag badge on the wearer's right pocket, and a red, white and navy flag patch on the waistband.

The denim vest, bag and sandals are styling.

## Implementation

Catalog ID `tommy-ultra-high-mom-v1` (slot `bottom`), built by `makeJeans()` from its `build` spec with the sewn crotch construction.

- Template options added for this pair: `rivets`, `coinPocket.badge`, `backPocket.bars`, `backPocket.badge` and `labelPatch.blocks`. The badges and the patch are colour blocks; they carry no lettering.
- Fit: waistband 1.31 to 1.36, the highest of any pair; legs taper from about 0.15 at the thigh to 0.125 at the hem (y 0.24), above the loafers. The lower legs were widened by about 1 mm after a test found her socks touching the inside of the hem.
- Denim: a swatch from the front close-up (the left thigh), at the crop's own proportions (384 × 576) so it is not stretched. A first version divided the photo's lighting out with a wide blur, which left the close-up's diagonal folds in the swatch; they repeated as streaks down the legs. A narrow blur keeps only the fine grain. Because the close-up is zoomed in, the denim repeats about six times around the leg.
- Colour: photos measured RGB 41, 66, 102 (front on model), 44, 61, 87 (back) and 28, 48, 81 (close-up). Target about 40, 60, 95; the front render measures 42, 59, 95.

## Fixes this pair found

- **Tops over a high waistband.** The layering test only checked up to 1.30; with this waistband reaching 1.36, the bronze and lilac tops showed the jeans through their sides. The test now checks up to 1.40, the Tommy waistband was slimmed to just clear her body, and both tops ease out slightly at the waist (1.25 to 1.49). The windowpane jumper already cleared it.
- **Build speed.** Building the jeans took 0.4 to 10 seconds (the Davinia pair was slowest), and the app rebuilds the outfit on every change. Surface measurements for the small details are now cached and small patches are subdivided less; every pair builds in under 0.75 seconds. The test suite went from 105 to about 20 seconds, partly by measuring each top once for all bottoms and indexing its triangles by height.
- **Denim at the crotch.** A checkerboard test texture showed the denim shearing and squashing in a band above the hip-to-leg join. The hips' texture columns now follow the original rounded outline (no sideways sliding), and their vertical texture runs by distance along the fabric from the legs' value at the join. This applies to all four pairs.

## Checks

- `npm test`: 23 passing. A new test checks the rivets, pocket bars, badges and patch, the waistband height, the taper, the ankle length above the shoes, and that her legs and socks never show through. The layering test checks every waist-covering top over every bottom up to 1.40; it fails if the bronze top's waist easing is removed.
- `npm run build` succeeds.
- Rendered in headless Chromium from four angles, without a top, under every top and the skirt, and with a checkerboard texture to check the denim layout; compared side by side with the front and back photos. The user has not yet seen it.

## Known differences

- Badges and the flag patch are plain colour blocks.
- Fixed 9 October 2026 for every pair: the line where the hips met the legs is gone (see [the pleated linen trousers](pleated-linen-wide-trousers.md#the-line-where-the-hips-meet-the-legs)).
- The taper is limited by her round legs and socks; the mom-fit shape is gentler than on the model.
