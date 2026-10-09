# Wardrobe item: Mango Sienna white flare crop jeans

Authored 9 October 2026. Status: first version, marked approved in its own pull request: merging it is the approval (the user's rule). Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent two phone screenshots of Google image results for the Mango “Jeans Sienna flare crop” (Mango Italia and Mango México), without text: the front and the back on a model. The photos are not stored in the repository.

Features read from the photos:

- White denim, smooth and plain, with no visible wash, whiskers or wear.
- High rise, at her natural waist.
- Slim through the hips and thighs, narrowest at the knee, then a gentle kick flare to the hem.
- Cropped just above the ankle bone, with a raw frayed hem.
- A five-pocket front:
  - scoop pockets and a coin pocket
  - a silver shank button with a dark centre
  - small dark rivets
- At the back: a yoke, a centre-back seam and plain patch pockets. No label patch or embroidery is visible. What looked like a mark on one back pocket is its corner stitching.
- Tonal white stitching.

Measured colours: the plain thigh is about RGB 217 to 231, 218 to 235, 220 to 237; the studio wall is about 213, 218, 222. The jeans carry the same cool cast as the wall, so the cast is the lighting, and the colour is set to a soft, neutral white.

## Implementation

Catalog ID `mango-sienna-flare-crop-jeans-v1` (slot `bottom`), in its own garment file, `src/wardrobe/garments/mango-sienna-flare-crop-jeans-v1.js`: its catalog entry, its study preset and its texture module (`atlas`). It is built by the existing jeans template (`makeJeans()`) from the `build` spec in that file. **No template code changes**, so every other pair is unchanged.

**Denim.** The new swatch `src/wardrobe/mango-sienna-denim.js` comes from the plain right thigh in the front photo:

- cropped inside the seams
- its lighting divided out by a heavy blur
- made seamless
- coloured to the soft white

The screenshot is small and the fabric smooth, so its grain is faint (it is raised fourfold to about 1% variation). The shared twill bump gives the weave. In a render, the plain thigh in front light measures about RGB 230, 228, 225.

**Shape.** The hips and slim thighs are the Davinia jeans', raised to the Mango black jeans' high waistband (1.285). The legs:

- narrow to the knee (0.11 across at 0.53)
- then flare to the hem at 0.31: about 0.145 by 0.156, about a third wider than at the knee
- end in a raw frayed edge just above her ankle; the template's `raw-crop` hem with pale threads

Folds are shallow, as the photos show smooth, close-fitting denim. There is no thigh fade, and almost no whiskers.

**Details.** The template's existing options:

- scoop front pockets, a coin pocket and the fly, all double stitched
- a silver-grey shank button and dark rivets
- six belt loops and one at the back
- a back yoke, a centre-back seam and plain patch pockets

The stitching is a shade deeper than the denim, so the seams read on white.

**Preset.** “Sienna flare crop study”: the jeans with the black cropped adidas hoodie, close to the black top in the photos. Every top in the wardrobe covers this high waistband.

## Layering

They are a bottom like the other jeans: tops that cover the waistband hang over them, and the cropped hem sits above every shoe, or on a boot's collar, as for the other cropped pairs (`tests/shoes.test.js` checks every bottom with every shoe).

## Styling facts

- High-rise slim kick flare, cropped at the ankle.
- White, plain.
- Legs covered to just above the ankle.
- Cotton denim.
- Warmth 2 of 4, inferred: denim, with the ankle bare below the cropped hem. For mild to warm, dry days. The white shows rain spots and dirt.

## Checks

- New `tests/sienna-jeans.test.js` checks:
  - its parts: two legs, the shank button, four rivets, two back pockets, the coin pocket's stitching, the frayed hems, no back patch
  - that the leg is narrower at the knee than at the thigh, and at least 15% wider again at the hem
  - that the hem sits above her ankle
  - that the stand-in colour (without the swatch) is white
- The shared tests also run on it: every waist-covering top over every bottom, every shoe under every bottom, outerwear over every bottom, the garment-file layout.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the black hoodie and with the crochet top.

## Known differences

- The flare is fitted to her short legs. The model's legs are longer, so the flare starts lower on her.
- The denim's grain comes from small screenshots and the shared twill, not a close-up.
- The exact shade (white or off-white) is not stated. It is a soft, neutral white.
- The button's dark centre and engraving are simplified to a silver-grey button.
