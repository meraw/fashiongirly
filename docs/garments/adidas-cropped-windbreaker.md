# Wardrobe item: adidas cream cropped windbreaker

Authored 9 October 2026. Status: first version, awaiting visual review. It is the fifth jacket on the zip-windbreaker template, and the first cropped one.

## Source and reference reading

The user sent two resale-listing photos of the jacket on a dress form, front (zipped) and back, with no text. No link was fetched, and the photos are not stored in the repository.

Features read from the photos:

- A cream (off-white) woven nylon shell, all tonal.
- A tall stand collar, folded over on the dress form, and a tonal coil zip to the top.
- A small tonal embossed trefoil on her left chest.
- Dropped shoulders and very full balloon sleeves.
- A cropped body that blouses over a wide shirred elastic waistband at the waist.
- Long shirred elastic cuffs.
- Two seams down the front, from the chest to the band.
- A back yoke seam and a centre-back seam.

Measured colour: about RGB 226, 224, 223 in plain areas, in bright studio light.

## How the user wears it

Not stated. Their rule for outerwear applies: zipped closed in real life, or not worn. So it starts **zipped**. Like every jacket, it can be shown open on the doll.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:**
  - Palette: cream, plain, with a tonal logo.
  - Shape: a cropped blouson with balloon sleeves.
  - Coverage: her torso to the waist and her arms to the wrist, and her neck when zipped. The top shows below the band.
  - Material: a thin woven windbreaker shell.
- **From the user:** worn zipped in real life (their rule).
- **Inferred:** a light layer for mild, breezy days; not for rain or cold.
- **Unknown:** the lining, the fibre composition, and how the user wears it.

## Implementation

Catalog ID `adidas-cream-cropped-windbreaker-v1` (slot `outerwear`), built by `makeZipWindbreaker()` from its `build` spec.

- **Body.** The windbreakers' upper body, ending at her waist. It blouses over a shirred band from 1.20 to 1.29 (outfit units), which sits over the trousers' waistband and the skirt's bow (`layering.coversWaistband`). The collar is taller (to 2.0).
- **Shirring.** The band and cuffs are built in channels: four on the band, three on each cuff. Each channel puffs between its stitched lines, over vertical gathers.
- **Sleeves.** Very full balloon sleeves, softly folded, gathered into the shirred cuffs at her wrist.
- **Front.** A tonal coil zip with its slider and pull at the collar, and two seams down to the band. The tonal trefoil on her left chest is a small generic three-leaf emblem in a shade of the shell, not the exact logo.
- **Back.** A yoke seam with a soft shadow, and a centre-back seam.
- **Colour, by measurement.** The front's plain areas render at about RGB 226, 221, 215, against the photos' 226, 224, 223.
- **Fabric.** A matte, softly crinkled nylon, lightly puffed.
- **Preset.** “Cropped windbreaker study”: the jacket over the black Mickey tee, with the raspberry Nike track pants and the UGG cream sneakers.

### New optional template settings (additive)

Each setting defaults to the old behaviour. The other four windbreakers are unchanged: their fingerprints match the versions before these settings.

- **`body.bandChannels`** and **`sleeve.cuffChannels`:** a shirred band and cuffs, built in that many channels.
- **`logo`:** a small tonal trefoil on her left chest, drawn on the body texture (`x`, `y`, `size`, `shade`).
- **Pockets are optional:** a jacket with no `pockets` has none.

## Checks

- `npm test`: 89 passing after merging `main`. The new `tests/adidas-cropped-windbreaker.test.js` checks:
  - the parts, and the parts it leaves out
  - that the band sits at her waist
  - that the band is shirred in channels
  - the full sleeves
  - the tonal trefoil on the body texture
  - the tonal zip
  - the study
- The shared outerwear tests run it zipped and open over every top, bottom and the skirt. They found three problems, all now fixed:
  - **Jeans shank button and the classic shirt's buttons:** these poked through a small gap between the body and the shirred band. The shirring now starts at the band's top, as the plain band does, and the band is a little longer and deeper at the front.
  - **The pointelle jumper's scalloped neckline:** it poked through just under the collar. The neck now matches the other windbreakers' shape.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back, and open.

## Known differences

- The collar stands up; on the dress form it is folded over. Her head hides it either way.
- The trefoil is a generic emblem, and any seam pockets are not modelled.
