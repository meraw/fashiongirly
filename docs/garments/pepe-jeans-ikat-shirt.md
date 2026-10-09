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

**Template changes (additive).** New style options, each unused by the two cropped shirts:

- `body`: a longer body. It keeps the cropped shirts' rows down to 1.4, then follows its own:
  - `rows`: the striped cardigan's rows, which clear every bottom
  - `skirtRows`: the cardigan's rows over the skirt's flare, a little closer at 1.0 to 1.1, used when she wears the skirt
  - `hem`: the hem height
  - `tail`: how far the hem rises toward the sides, for a shirttail. Each column of the body is cut shorter along its own surface, so the raised sides keep the body's shape at that height.
  The placket stitching and buttons run down to this hem, and the hem stitching follows its curve.
- `pocket`: a patch pocket on her left chest, in the print a little out of step with the body, stitched round with a line across its top hem.
- `cuff`: a buttoned cuff band at the end of each sleeve, in the print, stitched along its top, with a pale button.

`makeButtonShirt()` takes the skirt setting, and `makeOutfit()` passes it (its dispatch line for shirts). The two cropped shirts ignore it.

The tie-dye and spray floral shirts render pixel-identical to `main`, from the front and the side, with and without the skirt.

**Print.** Drawn in code, not copied from the photos, in the new file `src/doll/ikat-print.js`:

- Streaks: noise drawn out up the cloth, in bands of lavender, grey-blue and periwinkle over white.
- Motifs: tall diamonds on a half-drop grid of four columns and four rows per tile, in a fixed sequence, including large faint periwinkle diamonds.
- Ikat feathering: each motif's rows of threads slip a little sideways, and its tips fray up and down.
- Colours: the blues are much deeper than measured. The studio's exposure and tone mapping washed the measured pale blues almost to white in the first renders. The shirt has no sheen, for the same reason.
- Repeat: the tile repeats three times round her, and once for every 1.05 of her height.

**Fit.** Straight from the shoulders, then loose past her hips like the cardigan. The front and back hem is at 0.97, and the sides rise by 0.075. It is worn untucked, with the top button open and the cuffs down.

**Preset.** “Ikat shirt study”: the shirt over the Levi's washed black wide legs.

## Layering

It covers the waistband (`layering.coversWaistband`), so the skirt's bow is hidden. Over the skirt it follows the skirt's flare. A jacket hides its sleeves, as for every top.

Two fits came from the shared tests:

- **The windbreaker over the skirt.** Lifting the hem first carried the hem's flare up to the windbreaker's hem, where it showed through. Cutting the shirttail along the body fixed that over jeans. Over the skirt, the rows at 1.0 to 1.1 were brought in by about 1% so the windbreaker still covers the shirt there; it still clears the skirt.
- **Waist coverage (shared test changed).** `tests/bottoms.test.js` (“every waist-covering top hides every bottom between its hem and the waist”) measured each top's hem as its lowest point. With a shirttail, the bottoms rightly show at the sides below the raised hem, so the test now takes the hem's height all round her: the lowest point of the top in each 2-degree slice, taking the higher of the neighbouring slices, with empty slices filled from the nearest. For tops with a level hem nothing changes. Narrowing this shirt at the hips still fails the test.

## Styling facts

- A straight button-down, loose past the hips.
- White, periwinkle and lavender, with navy and coral.
- Ikat: feathered vertical streaks with diamonds.
- A point collar with the top button open, long sleeves, midriff covered.
- A light woven voile.
- Warmth 1 of 4, inferred from the light, thin woven: warm or mild days, or a light layer under a jacket.

## Checks

- New `tests/ikat-shirt.test.js` checks:
  - its parts: collar and chambray stand, sleeves, cuffs with buttons and stitching, the pocket and its stitching, eight buttons, the hem stitching
  - that the hem is lowest at the centre front and rises toward the sides
  - that the pocket sits on her left chest
  - that the print holds navy, coral, the blues and white
  - that over the skirt no part of the skirt pokes through it. Building it with its usual rows over the skirt fails this check.
- The shared tests also run on it, with the change to the waist coverage test above: every waist-covering top over every bottom, sleeves and hands, the styling facts, and outerwear over every top.
- `npm test`: 87 passing after merging `main` (which added the Pull & Bear chenille jumper); `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back. Also over the skirt. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- Both photos show the sleeves rolled up; it is built with the cuffs down.
- The print's repeat is simplified, and its motifs follow a fixed sequence rather than the real layout.
- The length and fit are read from flat lays only.
