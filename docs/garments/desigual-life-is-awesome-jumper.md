# Wardrobe item: Desigual “Life is awesome” jumper

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The first knit on the sweatshirt template, and the first with embroidered lettering.

## Source and reference reading

The user sent four photos without a description: two fronts on models (one over cream jeans), the back on a model, and the front on a hanger. The photos are not stored in the repository. The brand is Desigual.

Features read from the photos:

- An oversized, boxy jumper in a chunky rib knit: columns of V stitches.
- The yarn is a marl of off-white and pale grey, flecked with lime-yellow nubs (neps) and dark green specks.
- “LIFE IS AWESOME” embroidered across the chest in hand-drawn capitals, in a thick olive-lime yarn laid in satin stitches, arching gently. On the models the first and last letters run onto the sleeves.
- A ribbed crew neck.
- Dropped shoulders, and full sleeves blousing over long ribbed cuffs.
- A narrow ribbed hem at the hip, with the body blousing over it.

Colours, measured:

- **Chest averages:** (178, 180, 160) on the front photo, (164, 166, 144) on the back.
- **Fleck colours:** lime nubs about (200, 207, 147), dark green flecks about (89, 92, 70), the pale marl about (219, 222, 204).
- **Embroidery:** about (196, 190, 101).

## Implementation

Catalog ID `desigual-life-is-awesome-jumper-v1`, built by `makeSweatshirt()` in `src/doll/sweatshirt.js` (template `logo-sweatshirt`), on the Levi's sweatshirt's fit.

**New sweatshirt template options.** All are optional; the Levi's sweatshirt doesn't use them. A fingerprint of every vertex and texture of every top is identical before and after the change.

- `knit`: a chunky rib knit instead of fleece. `knitPixels()` draws the yarn stitch by stitch:
  - columns of V stitches, with a groove between the columns;
  - a marl of the base and a grey ply in a fine, fuzzy fibre pattern, greyer in soft patches;
  - lime neps (round nubs) and dark green flecks (flatter specks), each in its own stitch, at the shares in the spec.

  Stitch size is set in world units, so the stitches are the same size on the body, sleeves and bands. The sleeve and band tiles hold whole stitches, so they repeat seamlessly. The rib is raised in a bump map (`ribBump()`), and the knit is matte with a soft sheen.
- `embroidery`: lettering on the chest instead of the printed logo. `embroider()` draws hand-drawn capitals as single strokes laid along an arch, filled with satin stitches lying across each stroke and shaded darker at the edges so they read as raised yarn. The text, cap height, arch, stroke weight, spacing and colours come from the spec.
- `tab`: the side tab is now optional, and this jumper has none.

**This jumper:**

- **Fit:** the Levi's sweatshirt's: relaxed, dropped shoulders, full sleeves, the body blousing over a rib hem band at the hip. The band is narrower (0.05), the sleeves a little fuller, the cuffs long.
- **Knit:** stitches 0.026 across and 0.017 down, larger than on the jumper, so the flecks stay visible on a phone. Lime neps in 38% of stitches and dark flecks in 50%.
- **Lettering:** “LIFE IS AWESOME”, 0.056 tall, arching 0.03, centred on her chest at 1.715. It is kept on the front, where she shows it; on the models its ends run onto the sleeves.
- **Colours:** calibrated in studio renders, which lift these colours strongly, so the texture is much deeper than the photos.
  - Rendered chest average: (184, 183, 159), against the photos' (178, 180, 160) front and (164, 166, 144) back.
  - Embroidery: (191, 180, 89), against (196, 190, 101).
- **Preset:** “Life is awesome jumper study”, over the pale stone pleated trousers with the cream New Balance 550s. The photos pair it with cream jeans.

## Layering

As for the Levi's sweatshirt:

- It covers every waistband (the shared waistband test), and blouses out over the skirt.
- It stays inside every jacket from the jacket's hem up; a zipped jacket hides its sleeves.
- It is not offered with the striped shirt or knit layers.

## Styling facts

Oversized and boxy to the hip, in a marled off-white knit flecked with lime and dark green, with “LIFE IS AWESOME” embroidered across the chest. Crew neck, long full cuffed sleeves. Warmth 3 of 4, inferred: a thick chunky knit. Cool days, autumn and winter.

## Checks

- `npm test` passes; see the pull request for the count. The new test (`tests/life-awesome-jumper.test.js`) checks:
  - the parts, with no side tab;
  - the matte rib knit and its flecks;
  - one line of olive lettering across the chest that fits on the front;
  - full sleeves with cuffs at the wrist;
  - that the Levi's sweatshirt keeps its tab.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back, over the pleated trousers. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The knit and its flecks are drawn in code; the real neps vary more in size and are fuzzier.
- The lettering is redrawn as single strokes; the real letters are hand-embroidered and less even.
- Her large head hides the crew neck and the top of the chest from the front.
