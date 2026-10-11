# Wardrobe item: cream ditsy rose print fitted shirt

Authored 11 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved, without a separate pull request afterwards. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user sent three product photos without a description:
- the front on a model, one hand in her pocket;
- the back on a model;
- the front on a model, over green velvet trousers.

No label or logo shows, so the brand is not recorded. The photos are not stored in the repository.

Features read from the photos:

- A fitted, long-sleeved shirt in a soft, slightly lustrous woven, read as a viscose or silky crepe.
- An off-white ground printed all over with a ditsy floral: small sprays of two to five chartreuse-olive roses, each shaded darker in its petals, with tiny dark teal leaves on fine stems.
- A big pointed 1970s collar on a stand, worn open at the neck.
- White buttons down a plain placket.
- Shaping darts down the front and back, nipping it in at the waist.
- Long fitted sleeves into long buttoned cuffs.
- A curved shirt-tail hem at the high hip.

Measured on the back photo, the sharpest of the three:
- the ground is about RGB 229, 225, 220;
- the roses 178, 163, 95, covering about a fifth of the fabric;
- the leaves 53, 61, 60.

The roses are about 7 mm across.

## Implementation

Its catalog entry and study preset are in their own file, `src/wardrobe/garments/cream-ditsy-rose-fitted-shirt-v1.js`, with one line in `src/wardrobe/garments/index.js` (written by `node scripts/garment-index.mjs`).

**New template: `ditsy-print-shirt`** (`makeDitsyPrintShirt()` in the new `src/doll/ditsy-print-shirt.js`, registered in `src/doll/top-templates.js`). It builds the shared button-down shirt from a catalog `build`, as the check and linen shirts do:
- `print`: the colours (ground, rose, shade, leaf), the number of sprays on a tile, the roses' size and the layout's seed;
- the tiling (`around`, `high`, `sleeveAround`, `collarAround`), the sheen and roughness;
- the shirt's own style fields (stitching, buttons, open neck, collar, rows, tucked rows, shirt tail, sleeves and cuffs);
- optional `darts`: shaping darts stitched down the front or back either side of the centre.

The only change to shared code is that `makeShirt()` in `src/doll/shirts.js` is now exported. That is one word on its own line, and every other shirt is built exactly as before.

**The print** is drawn in code, not copied:
- Sprays are scattered over a seamless 512-pixel tile, kept clear of each other.
- Each spray is two to five round roses on fine stems from its centre, with small pointed leaves along the stems and beside each rose.
- Each rose is shaded darker in a spiral of petals and toward one side.
- The roses are drawn about one and a half times their real size, so they still read as roses at her scale.
- Four tiles go round her body, two round each sleeve.

**Colour.** The print's colours are a little deeper than measured, because the studio lifts them. A back render measures:

| | Ground | Roses | Rose coverage |
| --- | --- | --- | --- |
| Render | (232, 227, 221) | (188, 171, 104) | 17 % |
| Back photo | (229, 225, 220) | (178, 163, 95) | 19 % |

**Shape.**
- Fitted: close through the chest and slightly nipped at the waist, easing over her hips to a curved shirt-tail hem. It is lowest at the centre (1.1) and highest at the sides (1.16), and clears every waistband.
- Over the skirt it is tucked in (`layering.tucksIntoSkirt`), so the skirt's bow shows.
- The collar is the pink yoke shirt's bigger 1970s point collar, worn open at the neck. Her large head hides most of it from the front.
- Six white buttons below the open neck.
- Slim long sleeves into long buttoned cuffs.
- Darts down the front from the bust to the hem, and down the back, about a third of the way out from the centre.
- The stitching is tonal cream.

**Preset:** "Ditsy rose shirt study", over the Levi's Ribcage jeans with the cream 550s.

## Layering

- It covers the waistband, like the other untucked shirts.
- Over the skirt it is tucked in.
- A jacket worn zipped closed hides its sleeves, as for every top.

## Styling facts

- A fitted shirt at high-hip length, with a curved hem.
- Off-white, chartreuse, olive and dark teal.
- A ditsy floral of small rose sprays.
- A big point collar open at the neck, long cuffed sleeves, midriff covered.
- A soft, slightly lustrous woven.
- Warmth 2 of 4, inferred from a light woven shirt with long sleeves: mild days, or under a jacket.

## Checks

- A new `tests/ditsy-rose-shirt.test.js` checks:
  - its parts: the body, sleeves, cuffs with buttons, six buttons, the collar, and two darts front and back;
  - that the print is mostly cream ground, with olive roses and dark leaves;
  - that the darts run down the front and the back;
  - the shirt-tail curve;
  - that over the skirt it is tucked in.
- The shared tests also run on it:
  - sleeves and hands;
  - every waist-covering top over every bottom;
  - tops over the skirt;
  - the styling facts;
  - every jacket over every top;
  - the template registry's order.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter and back;
  - a chest close-up.

  Nothing has been checked on a device.

## Known differences

- The print's sprays are laid out at random, not in the real repeat, and the roses are larger than on the shirt.
- The darts are stitched lines; the waist is only slightly nipped, so it clears every waistband.
- The collar is mostly hidden under her head, as on the other shirts.
