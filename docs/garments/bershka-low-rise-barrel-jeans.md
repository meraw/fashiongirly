# Wardrobe items: Bershka low-rise barrel jeans, washed black and vintage blue

Authored 5 November 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks both pairs approved, without a separate pull request afterwards. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

The user has the same jeans in two colours, and this record covers both:
- `bershka-low-rise-barrel-jeans-black-v1`, the shop's “nero”;
- `bershka-low-rise-barrel-jeans-blue-v1`, the shop's “azzurro”.

## Source and reference reading

The user gave the Bershka product link (“Jeans barrel fit a vita bassa”). The shop's site refuses automated access, so the page could not be read. The user then sent twelve of its photos, six in each colour. The photos are not stored in the repository.
- **Black:** the front on a model (full length and closer), the back on a model, a front waist close-up, and front and back flat lays.
- **Blue:** front and back flat lays, back and front waist close-ups on a model, and the front on a model (full length and closer).

Features read from the photos, the same in both colours:

- Low rise, sitting on the hips.
- Wide barrel legs, curving out from the hip and in again toward the hem, full length and pooling on the shoes.
- A seam twisting forward down each leg, from the hip round to the inside of the hem. A short seam across the outside of each knee meets it. The back seams curve the same way.
- A five-pocket front: scoop pockets, a coin pocket on her right, small silver rivets at the pocket corners, a silver shank button, belt loops and a zip fly.
- A back yoke, with patch pockets under pointed flaps, each flap with a silver button.
- A leather patch on the back waistband, on her right.

How the colours differ:

| | Black (“nero”) | Blue (“azzurro”) |
| --- | --- | --- |
| Wash | washed black, faded to charcoal on the thighs and knees | mid-blue vintage wash: faded pale on the thighs and knees, darker and bluer toward the hem, with whiskers |
| Measured on the front flat lay | about (43, 43, 43) on the thighs, (29, 29, 31) low on the leg | about (86, 108, 121) on the thighs, (119, 137, 141) at the knees, (44, 65, 83) low on the leg |
| Stitching | grey, tonal | copper |
| Patch | black | tan, embossed BERSHKA |

## Implementation

Each pair has its own garment file in `src/wardrobe/garments/`, with its study preset and its denim swatch, and its own line in `src/wardrobe/garments/index.js` (written by `node scripts/garment-index.mjs`). Both are built by `makeJeans()` with no template changes.

**Cut.** Both use the Topshop barrel jeans' cut, which is the same construction:
- the low rise (waistband at 1.195);
- the wide barrel legs resting on the shoes;
- the side seams twisting forward toward the hem (`twist`);
- a short seam across each knee (`kneeSeams`);
- the back yoke and the flap back pockets with a button.

The front has Bershka's scoop pockets and coin pocket, with silver rivets at the pocket corners. The template mirrors rivets to both sides, so the coin pocket's rivets are left out rather than appear on the other hip. The patch sits on her right at the back. The Topshop pair's welt slit is left out.

**Denim swatches.** Each is a 256 × 256 seamless swatch. Like the other jeans' swatches, it keeps only the photo's brightness variation, coloured to the measured denim, and the template draws the fading:
- **Black:** `bershka-barrel-black-denim.js`, from a plain patch of the lower leg in the front flat lay. One repeat covers about 12 cm, so about five go round her leg.
- **Blue:** `bershka-barrel-blue-denim.js`. The flat lay is too small for its twill, so the swatch comes from a plain patch of the leg in the front waist close-up, at half contrast, because the close-up exaggerates the weave. One repeat covers about 8 cm, so about seven go round her leg.

**Fabric samples.** Each pair also has a small fabric sample for the wardrobe and picker, rendered from its own material by `scripts/render-fabric-swatches.mjs`:
- `src/wardrobe/fabric-swatches/bershka-barrel-black-denim.webp`;
- `src/wardrobe/fabric-swatches/bershka-barrel-blue-denim.webp`.

Each has an entry in `fabric-swatches.js` and in the script's list. Only these two were rendered, so the other garments' samples are untouched.

**Fading** (`gradient`, `thighFade`, `whiskers`):
- the black pair is a little paler on the thighs and darkest at the hem;
- the blue pair fades much more, pale on the thighs and knees and much darker toward the hem, with stronger whiskers.

**Colour.** Calibrated by measuring front renders against the flat lays. The first blue swatch rendered far too pale and grey, (131, 152, 167) on the thighs, so it was darkened and its fade strengthened. The black first rendered slightly warm, so it was cooled.

| | Thighs, render | Thighs, photo | Low on the leg, render | Low on the leg, photo |
| --- | --- | --- | --- | --- |
| Black | (38, 37, 38) | (43, 43, 43) | (33, 32, 34) | (29, 29, 31) |
| Blue | (81, 103, 120) | (86, 108, 121) | (59, 75, 90) | (44, 65, 83) |

**Study presets:**
- “Black barrel jeans study”, with the cropped red Tommy Jeans varsity jumper and the cream 550s;
- “Blue barrel jeans study”, with the Desigual painterly patchwork tee and the grey Campus 00s.

**Styling notes** (each file's `styling`):
- low-rise wide barrel legs with twisted seams, full length;
- warmth 2 of 4, inferred from full-length rigid denim;
- mild to cool days.

## Checks

- A new `tests/bershka-barrel-jeans.test.js` checks both pairs:
  - the parts: the shank button, back yoke, patch, coin pocket and knee seams;
  - two pocket flaps, each with a button;
  - four rivets;
  - the full length;
  - the colour differences: a black patch and grey stitching against a tan patch and copper stitching.
- The shared tests also run on both:
  - every shoe;
  - every waist-covering top;
  - the skirt;
  - jackets;
  - the styling facts with their layering notes.
- Rendered in headless Chromium (software WebGL): front, three-quarter and back, each with its study's top and shoes, set beside the flat lays.

  Nothing has been checked on a device.

## Known differences

- The twisted seams follow the template's twist, curving forward down the side of each leg. On the jeans they sweep further across the front.
- The blue pair's hem is less blue than in the photos: the template darkens the wash toward the hem but does not shift its hue.
- The patches carry no lettering.
- Folds are procedural.
