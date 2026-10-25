# Wardrobe item: Oversized black satin shirt

Authored 25 October 2026. Status: first version. Its file marks it `user-approved`, because merging its pull request is the user's approval (their rule). It adds the `satin-shirt` template (`src/doll/satin-shirt.js`).

## Source

The user asked for "an oversized black satin button-up with an ample neckline". There were no photos and no further description, so it is built as a classic oversized satin shirt. Nothing here is read from the user's own shirt.

## How the user wears it

Open in a deep V, for the ample neckline they asked for. Their other shirts are worn buttoned to the top; this one is the exception, because of the neckline.

## For styling later

Recorded in the garment file's `styling` block:

- **From the description:**
  - Palette: black.
  - Pattern: plain, with a satin lustre.
  - Shape: oversized and boxy.
  - Coverage: a deep V neckline.
  - Material: satin.
- **Inferred:**
  - Shape: to the top of her thigh with a curved hem.
  - Coverage: long cuffed sleeves, and her midriff covered.
  - Warmth 1: for mild days, or evenings under a jacket.
  - Rain: `rain: 'avoid'`, since satin spots in the rain.
- **Unknown:**
  - the fibre composition
  - the real shirt's neckline depth and buttons

## Implementation

Garment file `src/wardrobe/garments/black-satin-oversized-shirt-v1.js` (slot `top`), built by `makeSatinShirt()` in a new file, `src/doll/satin-shirt.js` (template `satin-shirt`). The template is registered in `src/doll/top-templates.js`.

- **Satin.** Drawn in code (`satinData()`): a plain soft black with fine warp floats running down her, faint in the colour and in the bump.
  - It is smoother than the crepe and linen shirts (roughness 0.5) and has a cool sheen, so it catches soft highlights on the sleeves and shoulders.
  - A first version at roughness 0.42 read as leather, and its linen creases as crinkles. It was softened and the creases were dropped, to keep her clothes soft (the design direction).
  - The colour is set a little lighter than black, so its folds still read in her lilac world light.
- **Shirt.** The button-down shirt template (`makeShirt()` in `src/doll/shirts.js`), styled from the garment's `build`:
  - **Fit:** boxy rows from the chest down to the top of her thigh, with a curved shirt-tail hem. These are the pink yoke shirt's oversized shape without the yoke.
  - **Sleeves:** full straight sleeves into buttoned cuffs. A first version with the yoke shirt's gathered sleeves looked puffed, not oversized.
  - **Neckline and collar:** the deep V (`open: { bottom: 1.625, half: .095 }`) under a wide point collar. A first V, open to 1.69, looked like a shirt with two buttons undone, not an ample neckline.
  - **Buttons:** five small black buttons from just under the V to the hem.
  - **Back and stitching:** a back yoke and tonal stitching.
- **The V.** Her body under clothes is cream felt, so the shoulder skin piece that the open cardigan and the V-neck tees use fills it (`bare-shoulder-skin`).
- **Over the skirt.** It is tucked in, so the bow shows (`layering.tucksIntoSkirt`).
- **Fabric swatch.** `src/wardrobe/fabric-swatches/black-satin-oversized-shirt.webp`, sampled lit from the body (the generator's `shaded` mode, as for the black yoke blouse), so the lustre shows.
  - Its line is added at the end of `FABRIC_SWATCHES` and of the generator's `SAMPLES`.
  - Only this sample was rendered; every other swatch is unchanged.
- **Preset.** "Black satin shirt study": over the Topshop acid-wash barrel jeans.

### Shared changes

- **`src/doll/top-templates.js`:** one import line and one entry line, in alphabetical order.
- **`src/style/stylist.js`:** a fix to how she picks shoes when no pair suits the day in every way. It was found because this shirt's arrival made `tests/today.test.js` fail.
  - **The day:** a warm day of showers (24°). The boots are too warm for it, and every other closed pair is marked as not for rain.
  - **The old fallback:** with no pair passing every rule, she fell back to every pair, open slides included. The test passed on `main` only because, by chance, no look then picked open shoes. Adding any garment changes which looks win.
  - **The fix:** she now lets go of the rules in order, first the boots' warmth and then rain-shy shoes. The rule that keeps open shoes out of the rain and the cold always stays.
  - **What it changes:** only the days where no pair passes every rule. Every other day she chooses exactly as before.
  - **Rules version:** `RULES_VERSION` is unchanged, so looks already chosen for today are not re-chosen.
  - **Test:** `tests/satin-shirt.test.js` checks it, and fails without the fix.

## Checks

- `npm test` passes, including the new `tests/satin-shirt.test.js`. It checks:
  - the registered template and the parts
  - the satin: black, smoother than the linen shirt, with a sheen
  - the deep V, with no button in it and skin to its point
  - oversized: as long and as wide as the relaxed gingham shirt or more
  - tucked into the skirt
  - the study
  - closed shoes on a warm day of showers
- The shared tests run it under every jacket, over every bottom and the skirt, check that her hands stay inside the cuffs, and check its styling record, the stylist and its fabric swatch.
- `npm run build` succeeds.
- Rendered in headless Chromium in the app, from the front, a turn and the back, and over the skirt.

## Known differences

- Without photos, the cut, the collar, the depth of the V, the buttons and the shade are chosen for the description.
- Her large head hides most of the collar from the front.
