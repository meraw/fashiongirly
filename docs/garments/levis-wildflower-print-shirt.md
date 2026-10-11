# Wardrobe item: Levi's wildflower print shirt

Authored 11 October 2026. Status: first version. Its file marks it `user-approved`, because merging its pull request is the user's approval (their rule). It adds the `wildflower-shirt` template (`src/doll/wildflower-shirt.js`).

## Source and reference reading

The user sent three product photos without a description:

- the front on a model, tucked into light jeans
- the back on a model
- the front on a model, closer

No link was fetched, and the photos are not stored in the repository.

Features read from the photos:

- A soft, fluid crepe, printed all over with a watercolour meadow on a peach-cream ground:
  - large lilac leaves and lily heads, washed in loosely
  - fine green stems and sprigs
  - clusters of orange flowers, red five-petal flowers and salmon blossoms
  - small speckles between them
- A long, pointed 1970s collar.
- Small cream buttons down a plain placket.
- Long sleeves into long buttoned cuffs.
- A back yoke.
- A regular fit, hip length, with a curved shirt-tail hem.

Colours measured on the back photo:

- the ground about RGB 238, 218, 204
- red about 213, 91, 70
- orange about 231, 160, 116
- the lilac and the sage green in smaller amounts

## How the user wears it

Buttoned to the top, as the user wears her shirts (on the model the top button is open). The model tucks it into high-rise jeans; on the doll it hangs over the waistband and is tucked into the skirt.

## For styling later

Recorded in the garment file's `styling` block:

- **Observed:**
  - Palette: peach cream with orange, red, lilac and sage green.
  - Pattern: an all-over watercolour wildflower print.
  - Shape: regular and hip length, with a curved hem.
  - Coverage: a long point collar buttoned to the top, long cuffed sleeves, and her midriff covered.
  - Material: soft crepe.
- **Inferred:** warmth 1; for mild days, or as a layer under a jacket.
- **Unknown:** the fibre composition.

## Implementation

Garment file `src/wardrobe/garments/levis-wildflower-print-shirt-v1.js` (slot `top`), built by `makeWildflowerShirt()` in a new file, `src/doll/wildflower-shirt.js` (template `wildflower-shirt`). The template is registered in `src/doll/top-templates.js` and edits no shared list.

- **Shirt.** The button-down shirt template (`makeShirt()` in `src/doll/shirts.js`), styled from the garment's `build`:
  - the gingham shirt's proven relaxed rows, which clear every bottom, jacket and the skirt
  - a curved shirt-tail hem
  - the pink yoke shirt's big 1970s point collar
  - cream buttons all the way to the top
  - long buttoned cuffs and a back yoke
  - a matte crepe with a soft sheen
- **Print.** Drawn in code, not copied: a watercolour meadow in translucent washes that dry a little darker at their edges. In order:
  1. a softly uneven peach-cream ground
  2. large lilac leaves and lily heads behind
  3. green stems with small leaves in sprays
  4. clusters of orange dabs in two oranges
  5. red five-petal flowers with darker hearts, and small red buds
  6. salmon blossoms
  7. speckles of yellow-orange

  One 512-pixel tile repeats twice round her. The inks are set a little deeper than measured, since the scene's light lifts them.
- **Over the skirt.** It is tucked in, so the bow shows (`layering.tucksIntoSkirt`).
- **Preset.** "Wildflower shirt study": buttoned to the top over the Tommy mom jeans.

### Shared changes (additive)

- **`src/doll/shirts.js`:** `makeShirt`, `crepeData`, `RELAXED_ROWS` and `TUCKED_ROWS` are now exported, so a shirt template in its own file can reuse them. Nothing else changes: every one of the 39 existing tops fingerprints identical to `main`, alone and over the skirt.
- **`src/doll/top-templates.js`:** one import line and one entry line, in alphabetical order.

## Checks

- `npm test`: 195 passing, including the new `tests/wildflower-shirt.test.js`. It checks:
  - the registered template
  - the parts
  - every button done up, to the top
  - the print: mostly ground, with orange and red flowers, lilac leaves and green sprigs
  - the shirt-tail hem
  - tucked into the skirt
  - the study
- The shared tests run it under every jacket, over every bottom and the skirt, check her hands stay inside the cuffs, and check its styling record and the stylist.
- `npm run build` succeeds.
- Rendered in headless Chromium in the app, from the front, a turn and the back.

## Known differences

- The print is a drawn meadow, with its flowers simplified and placed at random, not the shirt's own artwork.
- The seams down the front seen on the model are not drawn.
- Her large head hides most of the collar from the front.
