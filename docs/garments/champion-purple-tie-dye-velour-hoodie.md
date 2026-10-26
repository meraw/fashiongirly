# Wardrobe item: Champion purple tie-dye velour hoodie

Authored 25 October 2026. Status: first version, marked approved in its own pull request: merging it is the approval (the user's rule).

## Source and reference reading

The user sent two photos with the words “Add this hoodie”:

- a second-hand shop's listing (goldcat_vintage, sold out): a mirror photo of the hoodie worn with its matching velour trousers, the hood up. The listing names it “챔피온 타이다이 트레이닝 세트” (Champion tie-dye training set), unisex, size M (length 68 cm, chest 60 cm across), condition A;
- a brand photo of the same hoodie on a model, three-quarter front, the hood down.

Only the hoodie was asked for, so the trousers are not added. The photos are not stored in the repository.

Features read from the photos:

- **Fabric:** a soft cotton velour, a short dense pile with a sheen that turns light at glancing angles.
- **Dye:** a bound tie-dye on a near-black violet ground:
  - a bright violet band across the chest, from just below the underarms, broken by dark vertical lines where it was folded and bound, so it reads as a row of pale bars;
  - a second, patchier band lower down, above the hem band;
  - bands of their own round the sleeves (the upper arm and the forearm);
  - the hood, shoulders and upper chest mostly dark, faintly mottled.
- **Fit:** relaxed and hip length, with dropped shoulders.
- **Sleeves:** long and full, into long ribbed cuffs.
- **Hem:** a ribbed band, the body blousing over it.
- **Hood**, its sides crossing at the front of the neck.
- **Drawcords:** round cream cords, knotted near their ends (on the brand photo).
- **Logo:** a small woven C patch, blue with a red half-disc inside and a white edge, on her left sleeve just above the cuff (on both photos; the first is a mirror photo taken with the back camera, so it is not flipped).
- **Chest mark:** a small tonal embroidered mark on her left chest (on the user's photo).

Measured on the user's photo:

| | RGB (10th / median / 90th percentile) |
| --- | --- |
| Chest band | (57, 34, 80) / (96, 51, 118) / (128, 74, 151) |
| Dark upper chest | (16, 17, 38) / (27, 30, 49) / (52, 47, 77) |
| Lower body | (42, 42, 70) / (68, 62, 96) / (127, 75, 150) |
| Rib hem band | (46, 48, 73) / (68, 65, 94) / (120, 92, 153) |

The brand photo's ground is blacker and warmer, and its rib band darker. The user's hoodie is a worn second-hand piece, so the colours follow the user's photo.

## Implementation

Catalog ID `champion-purple-tie-dye-velour-hoodie-v1` (slot `top`, family `velour-hoodie`), in its own garment file `src/wardrobe/garments/champion-purple-tie-dye-velour-hoodie-v1.js`, which holds its catalog entry and its study preset.

**New top template `velour-hoodie`.** It is registered in `src/doll/top-templates.js`, and `makeVelourHoodie()` in the new `src/doll/velour-hoodie.js` builds it from the entry's `build` spec. It reuses helpers that `hoodie.js` already exports (`dataTexture`, `canvas`, `arc`, `bodyAt`); no other template's code changes.

- **Fit:** a relaxed body from dropped shoulders to the hip, blousing over a rib band from 1.185 down to 1.1. The length is read from the listing (68 cm) and the mirror photo, where the hem reaches the hip. Over the layered skirt, the band widens (`bandOverSkirt`) to sit out over it. Full sleeves into long ribbed cuffs.
- **Velour:** a physical material with a full sheen (bluish violet) over a soft matte base, and a fine pile in the bump.
- **Tie-dye** (`dye` in the spec), drawn in code as a texture over the body, each sleeve and the hood:
  - bands of dye, each a centre, a half-height and a strength: on the body a faint one high on the chest (1.83), the bright chest band (1.61) and the patchier lower band (1.33), read down the user's photo from the neck to the hem band; on the sleeves the upper arm and the forearm; on the hood a faint one;
  - the bands' edges wander up and down;
  - the folds: dark lines across the bands, one about every 0.055 (world units) round her, each of its own width and darkness, broken here and there along its length;
  - a mottle, which makes the dye patchy inside the bands and lets a little reach the ground between them.

  The ground, the dye and its brightest tone are mixed by how much dye reached each point.
- **Hood:** worn down, as on the other hoodies: a rounded pouch over her upper back, lined in the same velour. Under a jacket the hood and cords are put away and a plain narrow ribbed neckband is worn instead.
- **Drawcords:** round cream cords hanging down her chest, each with a knot and a short tuft.
- **Logo patch:** drawn in code as a suggestion of the mark, not a copy, laid on the outer side of her left sleeve just above the cuff.
- **Chest mark:** a small tonal C, stitched a little lighter than the ground, on her left chest.

**Colour.** Calibrated by measuring a front render against the user's photo (10th / median / 90th percentile):

| | Render | Photo |
| --- | --- | --- |
| Chest band | (46, 35, 62) / (95, 45, 128) / (139, 68, 164) | (57, 34, 80) / (96, 51, 118) / (128, 74, 151) |
| Dark upper chest | (33, 28, 45) / (38, 33, 57) / (58, 47, 95) | (16, 17, 38) / (27, 30, 49) / (52, 47, 77) |
| Lower body | (34, 27, 45) / (58, 33, 85) / (92, 46, 121) | (42, 42, 70) / (68, 62, 96) / (127, 75, 150) |
| Rib hem band | (59, 46, 82) / (66, 53, 89) / (73, 60, 93) | (46, 48, 73) / (68, 65, 94) / (120, 92, 153) |

The renderer's ambient light keeps the darkest ground a little lifted.

**Fabric sample.** A sample of the body's dye at the chest band, `src/wardrobe/fabric-swatches/champion-tie-dye-velour.webp`, made by `scripts/render-fabric-swatches.mjs` (its line added next to the racing hoodie's). The other 85 samples came out byte for byte unchanged.

**Shared test.** The chenille jumper's test, which checks that no other top swaps parts under a jacket, left out the two hoodies by ID. It now leaves out every top whose family names a hoodie, so a new hoodie needs no edit there. It still checks the cropped hoodie is among them.

## Study

“Tie-dye velour hoodie study”: the hoodie with the Mango washed black jeans.

## Layering

- It covers every waistband (`layering.coversWaistband`) and is worn loose, never tucked (a hoodie).
- Over the layered skirt its band sits out further, and hides the skirt's bow.
- Under every jacket and coat: the hood and cords are put away, the neckband is worn, and the jacket covers the hoodie from its hem to its collar.

## Styling facts

- Relaxed, hip length; long sleeves; hood worn down.
- Near-black violet with violet tie-dye bands.
- Cotton velour.
- Warmth 3 of 4, inferred from a velour hoodie with long sleeves, long cuffs and a hood, to the hip: cool days.
- Weather: cool, dry days; velour soaks up rain and shows it (inferred).

## Checks

- New `tests/velour-hoodie.test.js` checks:
  - its parts;
  - the hem at the hip;
  - in the body's texture, the chest band is far brighter than the ground, broken by dark fold lines, and violet;
  - the hood on her back, the cords' knots on her chest;
  - the logo on her left sleeve just above the cuff, and the mark on her left chest;
  - under every jacket, the hood is put away and the neckband worn;
  - over the skirt, the band is wider.
- The shared tests run on it: waist coverage over every bottom, every jacket over it (open and closed, with and without the skirt), sleeves and hands, tucking, styling facts, the fabric sample and the garment-file layout.
- Rendered in headless Chromium: front, a turn, the side and the back, with close-ups.

## Known differences

- The tie-dye is a likeness of the photos' layout, not a copy; every tie-dyed piece differs anyway.
- The logo patch and the chest mark are simplified.
- The user's own photo shows the hood up with hair over the neck, so its cords cannot be seen; they are built as on the brand photo.
- The matching velour trousers are not added.
