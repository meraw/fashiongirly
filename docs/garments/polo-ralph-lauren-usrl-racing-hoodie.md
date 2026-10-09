# Wardrobe item: Polo Ralph Lauren USRL racing hoodie

Authored 9 October 2026. Status: first version, awaiting the user's visual review.

## Source and reference reading

The user sent two photos without a description: the front and the back of the hoodie laid flat. The brand is read from its patches and embroidery. The photos are not stored in the repository.

Features read from the photos:

- A boxy, cropped hoodie in white cotton fleece, with raglan sleeves, a white ribbed hem band and long white ribbed cuffs.
- **Colour blocks:**
  - a white yoke from the neck between two red raglan panels, which run down from the neck to the underarms, widening as they go;
  - below it, bands right across the chest: red, black, then royal blue;
  - white below the bands, down to the hem band.
  
  The black and blue bands run on round the sleeves, below their red tops. The back is blocked the same way.
- **Big appliqué letters** “USRL” in cream felt, heavy and slanted, with a wing before them, across the black band.
- **Embroidery:** “Ralph Lauren -67-” in navy script on the white yoke, on her right chest.
- **Patches:**
  - a round navy badge ringed in yellow, with a winged “1”, on her left chest;
  - a cream label with a navy eagle and “Polo Ralph Lauren”, on her left just below the blue band;
  - an “RL 67” flag patch, with the letters in red and white stripes and a navy corner with stars, on her right lower down;
  - a yellow “R.L. Speed” patch framed in red, on her left sleeve, on its black band;
  - a white “USRL Racing Team NYC Speed Equipment” patch framed in red, on the back of the hood.
- **Hood:** white, lined in white, with flat white drawcords from metal eyelets.

Measured in the front photo:

| | RGB |
| --- | --- |
| White | 222, 222, 220 (212 lower down, in the shade) |
| Red | 169, 19, 33 |
| Black | 24, 28, 29 |
| Royal blue | 32, 64, 147 |
| Felt letters | 193, 193, 175 |

## Implementation

Catalog ID `polo-ralph-lauren-usrl-racing-hoodie-v1` (slot `top`). It is in its own garment file, `src/wardrobe/garments/polo-ralph-lauren-usrl-racing-hoodie-v1.js`, which holds its catalog entry and its study preset.

**New top template `racing-hoodie`.** It is registered in `src/doll/top-templates.js`, and `makeRacingHoodie()` in the new `src/doll/racing-hoodie.js` builds it from the entry's `build` spec.

- **Fit:** the cropped hoodie's. It has the same boxy body, rib hem band at the waist (1.27), relaxed sleeves, long ribbed cuffs, and the hood worn down as a rounded pouch over her upper back. The photos are flat lays, so the length on her is read from their proportions: about as long as it is wide, like the cropped hoodie.
- **Colour blocks:** drawn as a texture over the body, by height and, above the bands, by the angle from the centre front or back. The heights are measured from the photo down from the neck to the hem:
  - the white yoke between the raglan panels, from 0.56 radians either side of the centre at the neck to 0.82 where it meets the red band;
  - red from 1.721, black from 1.661, blue from 1.574 to 1.515, then white.

  A slightly darker line marks each seam between two colours.
- **Sleeves:** banded by height down the sleeve: red to -0.137, black to -0.205, blue to -0.27, then white. They are measured along the sleeve from the photo, so they sit a little higher than the body's bands, as in the photo.
- **Drawcords:** flat white cords from silver eyelets, hanging down her chest to metal tips above the red band.
- **Decorations:** the letters, the embroidery and the patches are drawn in code at her scale. They are suggestions of the marks, not copies, and their small text is drawn as lines. They are laid on the fleece at the places measured from the photo, keeping the photo's proportions:
  - the wing and the slanted letters, in cream felt with a darker stitched edge;
  - the navy script signature;
  - the round badge;
  - the eagle patch;
  - the flag patch, its letters filled with red and white stripes and a navy corner with white stars;
  - the yellow sleeve patch, laid on the outer side of her left sleeve;
  - the hood's patch, on the folded hood, facing back.
- **Under a jacket:** the hood and cords are put away and a plain narrow ribbed neckband is worn instead, as for the cropped hoodie.

`src/doll/hoodie.js` now exports five of its helpers, which the new template reuses:

- `dataTexture`;
- `fleeceData`;
- `canvas`;
- `arc`;
- `bodyAt`.

That is the only change to it, so the cropped hoodie is unchanged. The chenille jumper's test, which checks that no other top swaps parts under a jacket, now also leaves out this hoodie, which has its own test for that.

**Colour.** Calibrated by measuring renders against the front photo, at the centre front and to her right of it:

| | Render | Photo |
| --- | --- | --- |
| White | (225, 221, 214) | (222, 222, 220) |
| Red | (166–176, 16, 35) | (169, 19, 33) |
| Black | (32, 30, 25) | (24, 28, 29) |
| Blue | (26, 58, 147) | (32, 64, 147) |

The fleece's sheen is a mid grey, so the bands keep their colour under the studio's lights.

**Preset:** “Racing hoodie study”, with the Tommy mom jeans.

## Styling facts

A boxy hoodie cropped at the waist, in white with red, black and royal blue bands, big cream letters and racing patches. Warmth 3 of 4, inferred from the fleece and long sleeves, though it is cropped. Cool, dry days; fleece soaks up rain (inferred).

## Layering

- Cropped at the waist, like the cropped hoodie: it does not cover the waistband.
- Under every jacket, the hood and cords are put away and the narrow neckband is worn.

## Checks

- `npm test` passes (131), including a new `tests/racing-hoodie.test.js`, which checks:
  - the parts: the body, hem band, sleeves, cuffs, hood, cords, eyelets, tips, letters, signature, badge and patches;
  - down the body's centre front: white, red, black, blue, white;
  - above the bands: the white yoke at the centre front and back, red toward the sides;
  - each sleeve: red at the top and white at the cuff;
  - the hood and its patch on her back, the neckband put away;
  - the cords end on her chest above the red band;
  - the letters lie across the black band;
  - the badge and eagle patch on her left, the signature and flag patch on her right;
  - the yellow patch on her left sleeve;
  - under every jacket, open or closed, the hood is put away and the neckband worn.

  The shared tests cover it too:
  - its sleeves over her arms;
  - every bottom and the skirt;
  - every jacket's coverage;
  - the triangle budget;
  - the garment-file layout.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a slight turn and the back in the study, and under the open leather jacket. Compared with the photos.

## Known differences

- The decorations are redrawn in code. Their small text is lines, and the badge, eagle and wing are simplified.
- The length on her is read from flat lays.
- The hood is worn down, so its patch faces back, low on the folded hood.
- The small label inside the back neck is not drawn.
- The raglan seams are drawn as colour changes on the body; the sleeves are set in at her shoulders, as on the other tops.
