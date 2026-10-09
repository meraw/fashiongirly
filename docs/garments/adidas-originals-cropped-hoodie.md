# Wardrobe item: adidas Originals cropped hoodie

Authored 9 October 2026. Status: approved: the user merged it, and merging means approved (their rule). The first hoodie.

## Source and reference reading

The user sent five product photos with no written description:

- a front flat lay;
- the front on a model;
- close-ups of the hem and cuff, the chest logo and patch, and the hood.

The photos are not stored in the repository.

Features read from the photos:

- Black brushed French terry (fleece), boxy and cropped at the waist, with dropped shoulders.
- A ribbed hem band and long ribbed cuffs, each finished with a narrow pale mint tipping at the edge.
- A hood, lined in pale mint with fine dark pinstripes in pairs, its sides crossing at the front of the neck.
- Thick black braided drawcords, knotted near their frayed ends, hanging to mid-chest.
- On her left chest:
  - a white embroidered trefoil over a lowercase wordmark;
  - below it, a white woven patch with a green script name, a swept underline and small grey type.

Measured colours:

| Part | Colour |
| --- | --- |
| Fleece | (39, 38, 41), a cool black |
| Tipping, lit | about (204, 212, 206) |
| Tipping, in shade | about (180, 187, 182) |
| Hood lining | about (206, 213, 212) |
| Logo and patch | about (240, 241, 241) |

## Implementation

Catalog ID `adidas-originals-cropped-hoodie-black-v1` (slot `top`), template `cropped-hoodie`, built by `makeHoodie()` in the new `src/doll/hoodie.js` from its catalog `build` spec. `makeTop()` gained one dispatch line for the template.

**Body and sleeves.** These follow the chenille jumper, which is as boxy and cropped, with dropped shoulders, and clears every bottom and the skirt:

- the body ends at 1.27 with a rib band 0.085 deep;
- relaxed sleeves blouse over long ribbed cuffs that ease over her hands;
- the fleece is drawn as a fine knit height map with a soft sheen.

**Tipping.** A pale mint ribbed ring finishes the lower edge of the hem band and of each cuff.

**Hood, worn down:**

- A rounded pouch lies over her upper back, fuller toward the bottom, with a centre seam and rolled edges, as for the jackets' lowered hoods.
- Its opening runs from the sides of her neck round the back, with the striped lining inside its rolled edge.
- Her large head hides the opening from the front, so the lining shows only from the side and back.
- At the front, the cords come straight out of the neckline.

**Drawcords.** Thick braided cords, with a chevron braid in their bump:

- they hang from the neckline either side of the centre, a little apart, down to 1.56;
- each ends in a knot with short frayed strands below it.

**Logo and patch.**

- Both are drawn in code at her scale as a suggestion of the brand's marks, not copied:
  - three leaves cut by three bars, over a round, heavy lowercase word;
  - a white label with a green script word, an underline, grey type and a small round mark.
- They are laid on the fleece on her left chest, the patch below the logo.

**Under a jacket.** The hood and cords would push through a jacket's collar. As the chenille jumper does with its collars, the hoodie carries a plain narrow ribbed neckband: under any jacket, open or closed, the hood and cords are put away and the neckband is worn (`userData.underJacket`, read by `makeOuterwear()`).

The chenille jumper's test checks that no other top swaps parts this way. It now leaves the hoodie out, which has its own test.

**Colour:**

- The fleece is darker and cooler in the catalog than measured, because the studio lifts and warms dark colours.
- A front render's plain fleece measures (40, 38, 39), against (39, 38, 41) in the flat lay.

**Build time:** about 60 ms per outfit rebuild.

**Preset:** "Cropped hoodie study", with the Mango washed black jeans (the photos pair it with black track pants).

## Layering

- **Waistband:** it is cropped above every waistband, like the chenille jumper, so it does not claim to cover it. Over the skirt, the skirt's waistband and bow show below its hem.
- **Closed jacket:** it hides the sleeves.
- **Under any jacket:** the hood and cords are put away (see above).

## Styling facts

- Boxy, cropped at the waist; black with pale mint tipping and a small white chest logo.
- Hood worn down, long sleeves, midriff cropped.
- Brushed French terry.
- Warmth 2 of 4, inferred from the brushed fleece, cropped. Cool to mild days.

## Revision after the user's first look

The user saw "a weird floating thing" at the collar. The hood's opening came forward and crossed at the front just under her chin, and its rolled edge and mint lining showed there as two pale pieces, loose from the body. The opening now starts at the sides of her neck, under her head, and lies close to the body, so nothing sits loose at the front.

## Checks

- `npm test`: 93 passing. The new tests check:
  - the parts;
  - black fleece with pale mint tipping, the tipping finishing the hem and each cuff;
  - the hood on her back, with a pale mint lining with fine dark stripes;
  - the cords knotted on her chest;
  - the logo above the patch on her left chest;
  - under every jacket, open and closed, the hood put away and a neckband narrow enough for the jacket's collar.

  The shared tests also run on it: sleeves over her arms, cuffs over her hands, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back, with the black jeans, and over the skirt under the open leather jacket. The user saw them and merged it. No device check.

## Known differences

- The logo and patch are simplified at her scale.
- The hood is only worn down. From the front her head hides it, and the lining does not show.
- Under a jacket the hood is put away rather than lying over the jacket's collar.
- The fleece is drawn, not taken from the photos.
