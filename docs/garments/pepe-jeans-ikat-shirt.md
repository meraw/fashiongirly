# Wardrobe item: Pepe Jeans ikat print shirt

Authored 9 October 2026. Status: first version, awaiting visual review. Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent two photos, the only ones they could find: a studio flat lay of the shirt and their own flat lay on a wooden floor. Both show the sleeves rolled up. The label inside the collar reads Pepe Jeans. The photos are not stored in the repository.

Features read from the photos:

- A long-sleeved button-down shirt in a light, slightly slubbed woven.
- An ikat print:
  - soft vertical streaks of lavender and periwinkle on white
  - tall, feathered diamonds: navy clusters of four parted by a white cross, single and paired navy diamonds, and coral diamonds, singly and in small groups
- A point collar, with the stand and back neck lined in blue chambray.
- Pale buttons down the front, with the top one open in the flat lay.
- One patch pocket on her left chest.
- Buttoned cuffs.
- A curved shirttail hem, longer at the front and back than at the sides, falling past the hips.

Measured colours (studio photo; the user's own photo has a blue cast): navy about RGB 43, 42, 60; coral 216, 115, 118 where it blurs; periwinkle 149, 151, 183 to 164, 167, 198; white 226, 224, 233.

## Implementation

Catalog ID `pepe-jeans-ikat-shirt-v1` (slot `top`). It is built by the existing button-down shirt template (`makeButtonShirt()` in `src/doll/shirts.js`), from a new style there.

**Template.** The shirt template gained its long-shirt options on `main` from the Mango halftone dot shirt while this shirt was being built. This chat had built the same features its own way. The user chose to use the Mango shirt's options and drop this chat's own, so the shirt uses:

- `rows`: its body. The cropped shirts' rows down to 1.4, then easing out past her hips like the striped cardigan, slimmer at the hem (0.324 across at 0.97). This lets the shirttail's raised sides fit under the jackets' hems.
- `shirttail`: from 1.12 down, a hem lowest at the centre front and back (0.97) and highest at the sides (1.045).
- `tucked`: its shape over the skirt. Here it hangs loose over the skirt's flare (the cardigan's over-skirt rows, a little closer at 1.0 to 1.1), with a level hem.
- `cuff`: the mountain shirt's buttoned cuff, `{ from: -.48, to: -.535, button: true }`.

It adds one option, `pocket`: a patch pocket on her left chest, in the print a little out of step with the body, stitched round with a line across its top hem.

The tie-dye, spray floral, split floral, mountain and Mango shirts render pixel-identical to `main`, from the front and the side, with and without the skirt.

**Print.** Drawn in code, not copied from the photos, in the new file `src/doll/ikat-print.js`:

- Streaks: noise drawn out up the cloth, in bands of lavender, grey-blue and periwinkle over white.
- Motifs: tall diamonds on a half-drop grid of four columns and four rows per tile, in a fixed sequence, including large faint periwinkle diamonds.
- Ikat feathering: each motif's rows of threads slip a little sideways, and its tips fray up and down.
- Colours: the blues are much deeper than measured. The studio's exposure and tone mapping washed the measured pale blues almost to white in the first renders. The shirt has no sheen, for the same reason.
- Repeat: the tile repeats three times round her, and once for every 1.05 of her height.

**Fit.** Straight from the shoulders, then loose past her hips. The front and back hem is at 0.97, and the sides rise to 1.045. It is worn untucked, with the top button open and the cuffs down.

**Preset.** “Ikat shirt study”: the shirt over the Levi's washed black wide legs.

## Layering

It covers the waistband (`layering.coversWaistband`), so the skirt's bow is hidden. Over the skirt it follows the skirt's flare. A jacket hides its sleeves, as for every top.

Fits found by the shared tests:

- **Under jackets.** The shirttail lifts the hem's lower rows at the sides. With the cardigan's full flare at the hem, the raised sides showed through the Woolrich bomber's hem (at 1.04). The lowest rows are slimmer so they stay under it.
- **Over the skirt.** Its rows at 1.0 to 1.1 are about 2% inside the cardigan's, so the windbreakers and the bomber still cover it there. It still clears the skirt.
- **Waist coverage.** The shared test now measures a top's hem all round her, so the bottoms may show at the sides below a shirttail. That change came from the Mango shirt; this chat had made the same change, and dropped its own.

## Styling facts

- A straight button-down, loose past the hips.
- White, periwinkle and lavender, with navy and coral.
- Ikat: feathered vertical streaks with diamonds.
- A point collar with the top button open, long sleeves, midriff covered.
- A light woven voile.
- Warmth 1 of 4, inferred from the light, thin woven: warm or mild days, or a light layer under a jacket.

## Checks

- New `tests/ikat-shirt.test.js` checks:
  - its parts: collar and chambray stand, sleeves, cuffs with buttons and seams, the pocket and its stitching, eight buttons, the hem stitching
  - that the hem is lowest at the centre front and rises toward the sides
  - that the pocket sits on her left chest
  - that the print holds navy, coral, the blues and white
  - that over the skirt no part of the skirt pokes through it. Building it with its usual rows over the skirt failed this check, before the template change.
- The shared tests also run on it: every waist-covering top over every bottom, sleeves and hands, the styling facts, and outerwear over every top.
- `npm test`: 96 passing after merging `main` (which meanwhile added, among others, the Desigual split floral, mountain and Mango shirts); `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back. Also over the skirt. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- Both photos show the sleeves rolled up; it is built with the cuffs down.
- The print's repeat is simplified, and its motifs follow a fixed sequence rather than the real layout.
- The length and fit are read from flat lays only.
