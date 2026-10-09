# Wardrobe item: Levi's Ribcage straight ankle jeans

Authored 9 October 2026. Status: first version. Its file marks it `user-approved`, because merging its pull request is the user's approval (their rule).

## Source and reference reading

The user sent five phone screenshots of an Amazon listing:

- a back close-up on a model
- the front flat lay
- the front, the back and the side on a model

No link was sent. Only a processed fabric swatch from the flat lay is stored (see below). The brand is read from the back patch, the red tab and the arcuate stitching.

Features read from the screenshots:

- An ultra high rise, up to her natural waist.
- Straight, fairly full legs, cropped at the ankle.
- Dark indigo stonewash, a little paler on the thighs and the seat.
- A button fly with a silver top button.
- Gold topstitching and double seams, copper rivets, scoop front pockets and a coin pocket.
- A back yoke and patch pockets with gold arcuate stitching.
- A red tab on her right back pocket.
- A tan leather patch on the back waistband.

Measured colour: plain denim is about RGB 20, 34, 57 in the flat lay and 35, 51, 80 on the model from the back. The side view is darker still.

## How the user wears it

Not stated. Built as on the model, ending at the ankle.

## For styling later

Recorded in the garment file's `styling` block:

- **Observed:**
  - Palette: dark indigo.
  - Shape: ultra high rise, a straight leg cropped at the ankle.
  - Coverage: her legs to the ankle.
  - Material: rigid denim.
- **Inferred:** warmth 2; for most days, not heavy rain.
- **Unknown:** the fibre composition.

## Implementation

Garment file `src/wardrobe/garments/levis-ribcage-straight-ankle-jeans-v1.js` (slot `bottom`), built by `makeJeans()` from its `build` spec. It names its own denim swatch (`atlas`), which the view loads, and edits no shared list.

- **Shape.**
  - Rise and seat: the Tommy mom jeans' ultra high rise and seat (waistband at 1.335, outfit units).
  - Legs: straight rather than tapered, from about 0.16 across at the knee to 0.147 at the hem. The hem ends at the ankle (0.24).
  - Over boots: the hem sits on the boot's collar, as the other ankle jeans do. A first version, wider and shorter, draped over the Buffalo boots and pushed its legs together, which the shared shoe test caught.
- **Denim.** A swatch from the flat lay, processed like the other jeans' swatches. It is stored as a 256 × 640 WebP in `src/wardrobe/levis-ribcage-denim.js`, about 11 KB.
  - Crop: the lower left leg, inside its seams (220 × 550 px of the 1280-px-wide screenshot).
  - Flat lighting: the crop is divided by a heavy blur of itself.
  - Seamless: a half-offset cross-fade, with the contrast restored.
  - Calibration: to texel mean RGB 20, 33, 55.
  - Scale: about three repeats round each leg and three down it, matching the swatch's size on the leg in the photo.
- **Details.**
  - Gold topstitching and double seams, copper rivets, and a silver top button.
  - Gold arcuate stitching on the back pockets.
  - The red tab on the inner edge of her right back pocket.
  - A tan leather patch on her right back waistband.
- **Colour, by measurement.** The front of the legs renders at about RGB 28, 38, 62, between the flat lay and the model shots.
- **Preset.** "Levi's Ribcage jeans study": with the cropped Tommy Jeans varsity jumper and the New Balance 550s.

## Checks

- `npm test`: 128 passing after merging `main`, including the new `tests/levis-ribcage-jeans.test.js`. It checks:
  - the swatch module, a small WebP
  - the legs, the arcuate stitching and the patch
  - the ultra high rise
  - straight legs ending at the ankle
  - the gold arcuate stitching, and the patch on her right back
  - the study
- The shared tests run it under every top and jacket, over every pair of shoes, and over the skirt.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, the back and the side, and over the Buffalo boots.

## Known differences

- The button fly shows as a stitched fly with one top button: the other buttons sit under the placket.
- The patch and the tab carry no lettering.
- A faint line crosses the upper thighs where the template's hip and leg pieces meet, as on the other jeans.
- Most tops cover the leather patch, as on the model.
