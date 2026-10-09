# Wardrobe item: Mango “Claudia” slim crop jeans

Authored 9 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved, without a separate pull request afterwards. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user could only find one image: a phone screenshot of the Mango Outlet Italia listing, “Jeans Claudia slim crop - Donna”. It shows a front flat lay, with two small thumbnails below it: a front waist and the back. The screenshot is not stored in the repository.

This is a different pair from the Mango washed black jeans already in the wardrobe (`mango-washed-black-v1`). That pair is old, relaxed and straight, with light grey double topstitching and copper rivets; this one is slim and cropped, with tonal stitching and no visible rivets.

Features read from the photo:

- High rise.
- Slim legs tapering to a cropped hem at the ankle.
- Washed black denim, a little lighter on the thighs and darkest at the hem.
- A five-pocket front: scoop pockets, a coin pocket on her right, no rivets showing, a silver shank button and belt loops.
- Tonal grey topstitching, a little paler than the denim.
- From the small back thumbnail: a back yoke and patch pockets. No leather patch shows.
- A clean stitched hem.

Plain denim measures about RGB 34, 33, 38 on the thighs, 23, 22, 27 on the shins and 30, 29, 34 overall: a cool, slightly blue-violet black.

## Implementation

Its catalog entry and study preset are in their own file, `src/wardrobe/garments/mango-claudia-slim-crop-jeans-v1.js`, with one line in `src/wardrobe/garments/index.js` (written by `node scripts/garment-index.mjs`). It is built by `makeJeans()` from its `build` spec, with no template changes.

- **Denim:** `src/wardrobe/mango-claudia-denim.js`, which the garment file names as its `atlas`. It is a 256 × 256 seamless swatch from a plain patch of the lower leg in the photo:
  - its lighting is divided out with a broad blur;
  - it keeps only the photo's brightness variation (at 90% contrast), coloured to the measured black;
  - it is made seamless with a half-offset blend, across and then down.
  
  One repeat covers about 10 cm of the photo, so about five go round her leg. The photo is small, so the grain is coarser than real denim.
- **Colour:** the first swatch rendered warm (41, 37, 39 on the thigh), so it was cooled. The thigh now renders at about 35, 34, 39 against the photo's 34, 33, 38, darkening to about 29, 29, 34 on the shin.
- **Shape:**
  - The Mango washed black jeans' high rise: waistband at 1.285, the same hips, fly and pockets.
  - Slim legs tapering from the thigh to a hem at 0.27, just above her ankle. On her short legs the hem is about 0.4 of the waist's width, as in the photo.
  - Over boots, the hem sits on the boot collar.
- **Details:**
  - tonal grey topstitching (`#3d3d43`; a first, paler grey rendered almost white);
  - double seams and a stitched hem;
  - a silver button and belt loops;
  - scoop pockets and a coin pocket, with no rivets;
  - a back yoke over square patch pockets, and no leather patch.
- **Study preset:** “Claudia jeans study”, with the cropped red Tommy Jeans varsity jumper and the cream 550s.

**Styling notes** (`styling`):
- slim tapered legs, cropped at the ankle, high rise;
- washed black and charcoal, plain denim faded slightly at the thighs;
- warmth 2 of 4, inferred from denim cropped at the ankle;
- mild to cool days.

## Checks

- A new `tests/mango-claudia-jeans.test.js` checks:
  - the button, back yoke, coin pocket and stitched hem;
  - that it has no rivets, leather patch or frayed hem;
  - the hem height, at her ankle;
  - the taper: each leg's cross-section at the hem is under three quarters of the thigh's;
  - the dark, neutral tonal stitching;
  - its study.

  The shared shoe, layering and outerwear tests also run on it.
- Rendered in headless Chromium (software WebGL):
  - front with its study, three-quarter, side and back;
  - over the Buffalo boots;
  - a waist close-up.

  Nothing has been checked on a device.

## Known differences

- The back is read from a small thumbnail; the yoke and pockets are standard shapes.
- The swatch comes from a small shop photo, so the denim's grain is coarse and the wash repeats.
- Folds are procedural.
