# Wardrobe item: black yoke blouse with a buttoned placket

Authored 11 October 2026. Status: approved when its pull request merges (merging is the user's approval, their rule), so it is marked `user-approved` in its own pull request.

## Source and reference reading

The user sent five product photos without a description:

- the back on a model;
- the front on a model;
- a flat lay of the front;
- a close-up of the front;
- full length, with black skinny jeans and patent lace-ups.

The brand is not shown. The photos are not stored in the repository.

Features read from the photos:

- A boxy, collarless blouse in a soft, fluid black fabric with a faint sheen. It drapes like a viscose crepe.
- A round neckline, finished with a narrow bound edge.
- A short placket from the neckline to below the yoke, with seven small, round, dark buttons.
- A yoke across the chest and across the upper back, with the body gathered below its seam, front and back.
- Puffed shoulders: the sleeve heads are gathered into the armholes.
- Full three-quarter sleeves, gathered into narrow bands below the elbow. One photo shows a small button at the back of a band.
- A straight hem at the high hip, worn loose over the jeans.

Measured: the fabric is about RGB 45, 41, 47 in the light, a black with a faint violet cast.

## Implementation

Catalog ID `black-yoke-henley-blouse-v1` (slot `top`). It is in its own garment file, `src/wardrobe/garments/black-yoke-henley-blouse-v1.js`, which holds its catalog entry and its study preset.

**New top template `yoke-blouse`.** It is registered in `src/doll/top-templates.js`, and `makeYokeBlouse()` in the new `src/doll/yoke-blouse.js` builds it from the entry's `build` spec.

The button-down shirt template always builds a point collar, and every shirt chat edits `src/doll/shirts.js`. This blouse therefore has its own module and changes no other garment's code.

- **Body:** the pink yoke shirt's boxy rows, ending at a hem at the high hip (1.14), which clears every waistband.
- **Over the skirt:** it is tucked in, on the yoke shirt's tucked rows.
- **Yoke:** its seam is at 1.765 at the front and 1.75 at the back, measured from the photos down from the neck. The body is gathered all round just below the seam: 48 fine folds, deepest under the seam and fading toward the hem, kept off the placket.
- **Neckline:** round, with a narrow bound edge.
- **Placket:** a narrow band from the neckline to 1.59, stitched down both sides and across its end, with seven small round buttons with a faint gloss.
- **Sleeves:** full and three-quarter length, with the shared rounded shoulder cap. Their heads are puffed (16 fine gathers round the cap), and they are gathered again (18 folds) into a narrow band below her elbow (-0.388 to -0.432). The sleeve runs on inside the band, so her arm never shows between them. Below the band her forearm is bare (`layering.bareArmBelow` -0.43).
- **Fabric:** near-black crepe, with a fine pebbled bump, a soft sheen and matching stitching. Under the studio's warm evening light it reads a soft brown-black, like the jeans beside it.

**Tucking:** by its family the app would treat it as loose, so `layering.tuck` is set to true. She can tuck it into her trousers with the tuck key, as with the shirts.

**Preset:** “Black yoke blouse study”, with the Mango washed black jeans. The photos pair it with black skinny jeans.

## Styling facts

Boxy and gathered below a yoke, to the high hip; plain black; a round, collarless neck with a short buttoned placket; three-quarter sleeves. Warmth 1 of 4, inferred from the light, fluid fabric. Mild days, or under a jacket.

## Checks

- `npm test` passes, including a new `tests/yoke-blouse.test.js`, which checks:
  - the parts, and no collar;
  - the fabric is black;
  - the placket runs from above the yoke to below it, with its buttons on the centre front;
  - the body is gathered just below the yoke, and not above it;
  - the sleeve bands end where her forearm turns bare;
  - over the skirt, it is tucked in.

  The shared tests cover it too:
  - its sleeves cover her arms down to the bands;
  - every top over every bottom and the skirt;
  - the outerwear coverage of every top;
  - its styling and layering notes;
  - the garment-file layout.
- `npm run build` succeeds.
- Rendered in headless Chromium on the Dress her page, from the front, a slight turn and the back. Compared with the photos.

## Known differences

- The small button at the back of each sleeve band is not drawn.
- Her large head hides the neckline and the top of the placket from most angles.
- The brand and fibre are not known; the fabric is read from the drape.
