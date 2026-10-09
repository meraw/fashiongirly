# Wardrobe item: Desigual navy rugby shirt with tiger patches

Authored 9 October 2026. Status: approved: the user merged it, and merging means approved (their rule). The first rugby shirt, and the first top tucked into trousers.

## Source and reference reading

The user sent seven product photos with a note: "This is a dress but I don't normally wear it as one, I tuck it in. Buttons closed." So it is a top here, tucked in, buttoned.

The photos:

- the front on a model, closer and full length;
- a front flat lay;
- the front on two other models;
- the back on a model;
- a styled look tucked into white flared jeans.

The photos are not stored in the repository. The Desigual label shows in the flat lay.

Features read from the photos:

- An oversized, long-sleeved rugby shirt in a smooth, heavy navy jersey, sold as a mini dress with side slits at the hem.
- A cream rugby collar and a short cream placket, from the collar to about a fifth of the way down, with white buttons.
- Three appliqué tigers stacked on her left chest, each a leaping cat in felt:
  - blue (63, 100, 186);
  - pink (217, 106, 134);
  - yellow (213, 216, 116).
  
  Each has white embroidered stripes and a white edge.
- Dropped shoulders, and roomy sleeves into long ribbed cuffs.

Measured on the flat lay: navy (22, 22, 34) and cream (236, 236, 234).

## Implementation

Catalog ID `desigual-navy-rugby-tiger-patches-v1` (slot `top`), built by `makeButtonShirt()` in `src/doll/shirts.js`, with its own style in that file.

**Shape:**

- The Mango shirt's relaxed rows, so it is roomy above the waist.
- Tucked in: over trousers with the new `tuckIn` setting (below), and over the skirt with the tucked rows, so the skirt's bow shows.
- Roomy sleeves, as on the Mango shirt, into long ribbed cuffs without buttons.
- Buttoned: three white buttons, one just under the collar and two on the placket.

**New template options.** All are optional, and the shirts that don't set them are unchanged (fingerprinted before and after):

- `tuckIn`: the shirt tucks into the trousers she wears.
  - `makeOutfit()` builds the trousers before the top, and its shirt dispatch line now passes them to the template. That is a change to the dispatch line only.
  - The shirt finds the top of their waistband.
  - Below it, at each height and angle, it measures the trousers' inner surface and draws the body in just inside it. It takes the closest surface over that height and a little below, since right at the top a ray can miss the waistband or meet a patch or belt loop standing outside it.
  - Just above the waistband, the fabric narrows into it, so the shirt blouses over the waistband as a tucked shirt does.
  - Fabric far below the waistband's top is folded up out of the way.
  - Over the skirt, the style's tucked rows tuck it into the skirt instead.
  - A tucked-in shirt takes its shape from the trousers, so its surface is not cached.
- `placket`: `{ bottom, half, colour, stitch }`. A short placket in a contrast colour from the collar down to `bottom`, edged by stitching, with the buttons on it. Below it the front is plain (no full-length placket stitching).
- `patches`: `[{ at, size, colour, seed }]`. Appliqué patches laid on the front. Each is a leaping tiger drawn in code (`tigerPatchData()`) at her scale, a suggestion of the patches rather than a copy: a bumpy felt outline, white embroidered stripes, a white edge and an eye.
- `cuff.rib`: a knitted rib on the cuff, as a bump of ribs running down it.

**Colours:** the collar's and placket's cream from the flat lay. The navy is darker in the catalog than measured, because the studio lifts dark colours: a front render's navy measures (31, 30, 37), against (22, 22, 34) on the flat lay.

**Preset:** "Rugby shirt study", tucked into the crystal straight jeans. The styled photo tucks it into white flared jeans, which are not in the wardrobe.

## Layering

- **Trousers:** tucked inside the waistband of every pair, bloused above it.
- **Skirt:** tucked into the skirt, whose bow shows. It does not claim to cover the waistband (`coversWaistband` is not set); `layering.tucksIn` records that it is worn tucked.
- **Closed jacket:** it hides the sleeves and the collar.
- **Open leather jacket:** the front, placket and patches show between the fronts.

## Styling facts

- Oversized, tucked in and bloused at the waist; navy, cream, blue, pink and yellow.
- Plain, with a contrast collar and placket and three small appliqué tigers.
- Rugby collar buttoned, long sleeves with ribbed cuffs, midriff covered.
- Smooth heavy jersey.
- Warmth 2 of 4, inferred from a long-sleeved heavy jersey. Cool to mild days.

## Checks

- `npm test`: 103 passing. The new `tests/rugby-shirt.test.js` checks:
  - the parts, with no cuff buttons;
  - navy jersey, a cream collar and placket, and three white buttons on the placket;
  - the three patches on her left chest;
  - ribbed cuffs;
  - the tuck, over every pair of trousers: at three depths below the waistband's top, all round her, the shirt lies inside the trousers, and it reaches below the waistband's top, with no gap;
  - over the skirt, tucked into the skirt with the bow showing.

  The shared tests also run on it: sleeves and cuffs over her arms and hands, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back:
  - tucked into the crystal jeans and the high-rise Tommy mom jeans;
  - into the skirt;
  - into the low-rise barrel jeans under the open leather jacket.
  
  The user saw them and merged it. No device check.

## Known differences

- Worn tucked in as the user does, so the dress length and side slits are not shown.
- The tigers are simplified at her scale.
- The dropped shoulders are not modelled.
- The tucked fabric is smooth; a real tuck gathers in soft folds round the waistband.
