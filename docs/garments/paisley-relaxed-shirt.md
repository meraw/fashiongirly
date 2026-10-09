# Wardrobe item: paisley print relaxed shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review.

## Source and reference reading

The user sent four product photos without a description: the front on a model (half length), full length, the back on a model, and a front close-up. The brand is not shown. The photos are not stored in the repository; a processed print atlas made from them is (see below).

Features read from the photos:

- A relaxed, straight long-sleeved button-down in a soft, fluid fabric with a slight sheen (it drapes like a viscose crepe).
- A white ground packed edge to edge with a fine-line paisley: large and small paisleys drawn in thin dark lines and rows of dots, filled with smaller paisleys, petals and feathers in ochre-yellow (the commonest colour), peach, cornflower blue, lilac-pink and sage.
- Feathery leaf sprays in blue and sage, and curling yellow fronds and tendrils between the paisleys.
- A point collar on a stand, worn with the top button open; white buttons down the front.
- Fuller sleeves gathered into buttoned cuffs.
- A back yoke with a centre pleat below it, and a curved shirttail hem.
- Worn with the front tucked into high-rise jeans in both front photos; the back hangs loose.

Measured: the ground about RGB 236, 237, 239 in the evenly lit back view. Ochre-yellow is the commonest ink, then peach, blue, pink, a little violet and sage; the outlines are near (54, 46, 39). The close-up is in shade and reads greyer.

## Implementation

Catalog ID `paisley-print-relaxed-shirt-v1` (slot `top`), built by `makeButtonShirt()` in `src/doll/shirts.js` with its own style. `makeOutfit` already passes each shirt its atlas; `view.js` loads this one's.

**Template options.** The shirt template has optional settings, used only by the shirts that set them. This shirt uses:

- `atlas`: the print from a texture atlas made from the product photos (see below), toned for the studio's lights, with a flat cream if it fails to load;
- `rows`: its own body rows, fuller than the fitted shirts below the chest, down to a hem at her high hip (1.19), as wide there as the Tommy sweater, which clears every jacket, bottom and the skirt;
- `sleeve`: fuller sleeve rows, gathering toward her wrist;
- `cuff`: buttoned cuffs, a band over the sleeve's end, seamed at its top, with a button on its outer side;
- `backYoke`: a seam across her upper back only;
- `backPleat`, which it adds: a short box pleat at the centre back, from the back yoke's seam down.

This shirt was first built with its own body and sleeve rows, longer hem, cuffs and crepe. Meanwhile the mountain landscape shirt (`hem`, `cuff`) and the Mango dot shirt (`rows`, `sleeve`, a crepe bump) added the same to the template. At each merge the user chose the template's, so there is one way to do each; the paisley shirt's shape is unchanged, and its fabric now uses the Mango shirt's crepe.

Its back yoke went through two merges: the pink yoke shirt added a `yoke` of its own (a seam all round, front and back, with gathers under it), so this shirt's was renamed `backYoke`; then the plaid flannel shirt added the same back-only `backYoke` seam, so this shirt uses that one and adds only the pleat (`backPleat`), as the user chose each time. No other shirt sets `backPleat`. Every outfit that `main` can build was built on `main` and on this branch and compared, with no difference in geometry, materials or textures.

**Print atlas, from the user's photos.** `src/wardrobe/paisley-shirt-atlas.js` is a 1536 × 768 WebP (about 265 KB), made during authoring, outside the app, in the printed tees' layout (the body unwrapped in the top three quarters, the sleeves in the bottom quarter):

- **Front:** from the front photo, centred on the placket, from below the collar to above the tuck and clear of her arms. Her torso is much wider for its height than the real one, so this band is squeezed about a fifth lengthwise. The photographed placket and buttons stay in the print, under the doll's own.
- **Back:** from the back photo, the back panel below her ponytail.
- **Sleeves:** two patches of the back panel lower down, upright, at the same scale.
- The photos' soft shading is partly divided out (a heavy blur of their brightness), and the contrast raised by 1.15 about the print's mid tone, because the studio's ambient light lifts the fine dark lines.

The front and back meet at her sides, like side seams.

**Colour.** Calibrated by measuring renders against the photos (the median of the front and back panels), with `tone` `#bdbab5`:

| | Front median | Back median |
| --- | --- | --- |
| Render | (212, 199, 183) | (191, 177, 162) |
| Photo | (209, 197, 187) | (189, 176, 164) |

**Fabric:** the template's fine crepe bump and a soft sheen. White buttons, worn with the top button open as on the model.

**Preset:** "Paisley shirt study", with the Tommy mom jeans.

## Styling facts

A relaxed shirt to the high hip; a large all-over paisley print in white, ochre, blue, pink, peach and sage. Warmth 1 of 4, inferred from the light, fluid woven fabric. Mild or warm days, or under a jacket; a light fabric that shows rain marks (inferred).

## Checks

- `npm test` passes (107), including a new `tests/paisley-shirt.test.js`, which checks:
  - the parts: body, sleeves, cuffs with buttons and stitching, collar, eight buttons, the yoke seam and pleat, the hem stitching;
  - it is wider at the waist and longer than the fitted shirts;
  - the yoke and pleat are on her back;
  - the print comes from its atlas: the atlas is WebP, the body reads the top three quarters and each sleeve its own half of the bottom quarter, and the cuffs and collar take it too; without the atlas it is a flat cream;
  - the other shirts keep their own construction: the fitted ones (tie-dye, spray floral, split floral) have no cuffs, yoke or relaxed body and are still cropped at 1.26; the mountain, Mango, pink yoke and flannel shirts have no back pleat.

  The shared tests cover it too: every waist-covering top over every bottom, the outerwear coverage of every top, and the triangle budget.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a slight turn and the back in the study, and compared with the photos.

## What changed while building it

- **The first version's print was drawn in code** (bold banded paisleys, leaf sprays and tendrils). The user said it looked nothing like the shirt: it was cartoonish, with thick outlines, solid blobs of colour and too much white, where the real print is fine line-work packed edge to edge. The print now comes from the product photos, as the mountain shirt's does.
- The hem was first a curved shirttail, rising at the sides. The shared test that a waist-covering top hides every bottom down to its lowest point failed: at her sides the trousers' hips showed below the raised hem. The hem is now straight.
- The lower body was first wider than the other tops at her waist. The new adidas cropped windbreaker's hem band is fitted there, and the shirt pushed through it, so the lower body now follows the Tommy sweater's widths.

## Known differences

- Worn untucked: the model wears the front tucked into high-rise jeans, which the doll cannot do.
- The hem is straight, not a curved shirttail (see above).
- The print is taken from photos of the shirt worn, so it carries a little of their drape shading, and the front is squeezed about a fifth lengthwise. The photos are small (600 px wide), so the fine lines are softer than on the real fabric.
- The collar is mostly hidden under her head, as with the other shirts.
