# Wardrobe item: paisley print relaxed shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review.

## Source and reference reading

The user sent four product photos without a description: the front on a model (half length), full length, the back on a model, and a front close-up. The brand is not shown. The photos are not stored in the repository.

Features read from the photos:

- A relaxed, straight long-sleeved button-down in a soft, fluid fabric with a slight sheen (it drapes like a viscose crepe).
- A warm white ground printed all over with large paisleys. Each is filled in concentric bands, outlined in near-black and ringed with a coloured line and dots. The bands are ochre-yellow, peach, cornflower blue, lilac-pink and sage, some combed into stripes.
- Feathery leaf sprays in blue and sage (and yellow), and curling tendrils between the paisleys.
- A point collar on a stand, worn with the top button open; white buttons down the front.
- Fuller sleeves gathered into buttoned cuffs.
- A back yoke with a centre pleat below it, and a curved shirttail hem.
- Worn with the front tucked into high-rise jeans in both front photos; the back hangs loose.

Measured: the ground about RGB 236, 237, 239 in the evenly lit back view. Ochre-yellow is the commonest ink, then peach, blue, pink, a little violet and sage; the outlines are near (54, 46, 39). The close-up is in shade and reads greyer.

## Implementation

Catalog ID `paisley-print-relaxed-shirt-v1` (slot `top`), built by `makeButtonShirt()` in `src/doll/shirts.js`, the template of the two fitted mesh shirts, with a new style. The template picks it up by its style, so `makeOutfit` is unchanged.

**Template options.** The shirt template has optional settings, used only by the shirts that set them. This shirt uses:

- `rows`: its own body rows, fuller than the fitted shirts below the chest, down to a hem at her high hip (1.19), as wide there as the Tommy sweater, which clears every jacket, bottom and the skirt;
- `sleeve`: fuller sleeve rows, gathering toward her wrist;
- `cuff`: buttoned cuffs, a band over the sleeve's end, seamed at its top, with a button on its outer side;
- `yoke`, which it adds: a seam across her upper back, with a short box pleat at the centre below it.

This shirt was first built with its own body and sleeve rows, longer hem, cuffs and crepe. Meanwhile the mountain landscape shirt (`hem`, `cuff`) and the Mango dot shirt (`rows`, `sleeve`, a crepe bump) added the same to the template. At each merge the user chose the template's, so there is one way to do each; the paisley shirt's shape is unchanged, and its fabric now uses the Mango shirt's crepe.

No other shirt sets `yoke`. Every outfit that `main` can build was built on `main` and on this branch and compared, with no difference in geometry, materials or textures.

**Print:** drawn in code (`paisleyData()`), not copied from the photos. One tile is half her girth wide and in proportion high, so the motifs stay round; a large paisley is about a third of her front's width, as on the model. On the tile:

- paisleys: teardrops whose tails curl, filled in bands from the edge in. The bands are an ink outline, a band with fine ink dots, a combed band and a solid core with a pale eye, ringed by a coloured line and dots;
- leaf sprays: leaflets along an arc, each filled, outlined and veined;
- spiral tendrils;
- a scatter of ink dots.

The tile wraps seamlessly. The inks are deeper than measured, because the studio's exposure lifted the first version to pastels; the ground renders at about 231, 229, 228.

**Fabric:** the template's fine crepe bump and a soft sheen. White buttons, worn with the top button open as on the model.

**Preset:** "Paisley shirt study", with the Tommy mom jeans.

## Styling facts

A relaxed shirt to the high hip; a large all-over paisley print in white, ochre, blue, pink, peach and sage. Warmth 1 of 4, inferred from the light, fluid woven fabric. Mild or warm days, or under a jacket; a light fabric that shows rain marks (inferred).

## Checks

- `npm test` passes (96), including a new `tests/paisley-shirt.test.js`, which checks:
  - the parts: body, sleeves, cuffs with buttons and stitching, collar, eight buttons, the yoke seam and pleat, the hem stitching;
  - it is wider at the waist and longer than the fitted shirts;
  - the yoke and pleat are on her back;
  - the print is about half ground, with yellow, blue, pink and green inks in it;
  - the tile repeats without a seam both ways;
  - the other shirts keep their own construction: the fitted ones (tie-dye, spray floral, split floral) have no cuffs, yoke or relaxed body and are still cropped at 1.26; the mountain and Mango shirts have no yoke.

  The shared tests cover it too: every waist-covering top over every bottom, the outerwear coverage of every top, and the triangle budget.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, the side and the back in the study, and compared with the photos. Not yet seen by the user.

## What changed while building it

- The first print was too sparse, its paisleys too thin and its colours washed out to pastels; it now has more and larger motifs, fatter teardrops and deeper inks.
- The hem was first a curved shirttail, rising at the sides. The shared test that a waist-covering top hides every bottom down to its lowest point failed: at her sides the trousers' hips showed below the raised hem. The hem is now straight.
- The lower body was first wider than the other tops at her waist. The new adidas cropped windbreaker's hem band is fitted there, and the shirt pushed through it, so the lower body now follows the Tommy sweater's widths.

## Known differences

- Worn untucked: the model wears the front tucked into high-rise jeans, which the doll cannot do.
- The hem is straight, not a curved shirttail (see above).
- The print is a simplified redrawing; the real paisleys carry more inner detail (leaf and petal shapes inside them), and the repeat is invented.
- The collar is mostly hidden under her head, as with the other shirts.
