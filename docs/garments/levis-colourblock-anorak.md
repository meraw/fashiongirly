# Wardrobe item: Levi's colour-block half-zip anorak

Authored 9 October 2026. Status: first version. Its file marks it `user-approved`, because merging its pull request is the user's approval (their rule). It is the sixth jacket on the zip-windbreaker template, and the first pullover.

## Source and reference reading

The user sent three product photos with no text:

- the front on a model, with the cords hanging
- the back on a model, with the hood down
- the front on a model over denim shorts

No link was fetched, and the photos are not stored in the repository. The brand is read from the chest print and the cords.

Features read from the photos:

- A light woven windbreaker shell, pulled on over the head.
- Colour-blocked:
  - a red yoke over the shoulders, the upper sleeves, the collar and the hood
  - the yoke ends in a V at the centre front and again at the centre back
  - pale pink below the yoke
- A red half zip from the stand collar down to the V.
- A small white Levi's print on her left chest.
- Flat white drawcord tapes printed LEVI'S in black, hanging long from the hood opening.
- A hood, worn down.
- Dropped shoulders and full sleeves into elastic cuffs.
- An elastic drawcord hem, blousing at the waistband.
- A slanted pocket on her right front.

Measured colours: red about RGB 216, 62, 70 and pink about 240, 226, 229, in the two lighter photos. The first photo is darker all over.

## How the user wears it

Not stated. Their rule for outerwear applies: closed in real life, or not worn. So it starts **zipped**. Shown open on the doll, the half zip is undone: a pullover opens no further.

## For styling later

Recorded in the garment file's `styling` block:

- **Observed:**
  - Palette: red and pale pink, with white.
  - Shape: a boxy hip-length pullover anorak.
  - Coverage: her torso and her arms to the wrist, and her neck when zipped.
  - Material: a light woven shell.
- **From the user:** zipped closed in real life (their rule).
- **Inferred:** a light layer for mild, breezy days; the hood suits a light shower.
- **Unknown:** the lining, the waterproofing and the fibre composition.

## Implementation

Garment file `src/wardrobe/garments/levis-colourblock-half-zip-anorak-v1.js` (slot `outerwear`), with one line in that folder's `index.js`. It is built by `makeZipWindbreaker()` in `src/doll/outerwear.js` from its `build` spec, and edits no shared list.

- **Body and sleeves.** The Marikoo windbreaker's, which clear every top, bottom and the skirt: a boxy body from dropped shoulders into an elastic hem band, and full sleeves into elastic cuffs.
- **Colour block.**
  - Front: the red yoke's V points at the zip's end, at 1.57 (outfit units), and rises to 1.75 at the sides.
  - Back: a second V, pointing to 1.55.
  - Collar: the red runs up over it.
  - Sleeves: the red ends diagonally on each sleeve.
- **Half zip.** A red coil zip from the collar to the V, with its slider at the top and a stop at its end.
- **Print.** LEVI'S in small white block capitals on the red of her left chest. It is a generic font, not the brand's lettering.
- **Tapes.** Two flat white tapes printed LEVI'S down their length in black, hanging from small eyelets either side of the collar. Their ends are simply cut.
- **Hood.** Red, lying down on her back, without the Marikoo's label.
- **Pockets.** A slanted pocket low on each front, with no snaps.
- **Colours, by measurement.** The front renders at about RGB 219, 66, 74 for the red and 238, 226, 227 for the pink.
- **Shown open.** The fronts part above the zip's end, widening to the collar, and stay joined below it. The zip parts into its two halves, with the slider at its end.
- **Preset.** "Levi's anorak study": over the crochet top with the Tommy mom jeans.

### New optional template settings (additive)

Each defaults to the old behaviour. All eight existing jackets are unchanged: their fingerprints match `main`'s, closed, over the skirt and open.

- **`yoke.backCentre`:** the yoke also ends in a V across the back.
- **`yoke.script` is optional,** and **`yoke.wordmark`** adds a small printed name in block capitals instead.
- **`zip.bottom`:** a half zip. Shown open, the fronts part only above its end.
- **`cords.tape`:** flat printed tapes in place of round cords.
- **`colours.hood`:** a hood in its own colour.
- **The block font** gains S, V and an apostrophe. No existing print uses them.

## Checks

- `npm test`: 114 passing, including the new `tests/levis-anorak.test.js`. It checks:
  - the parts, and the parts it leaves out
  - the half zip and its stop
  - the colour block: red above the V and pink below it, front and back; the V rising to the sides; red over the collar
  - the print, on her left chest only
  - the printed tapes
  - the red hood
  - the study
  - shown open: closed below the zip, and nothing spanning the open neck
- The shared outerwear tests run it zipped and unzipped over every top, bottom and the skirt, and check her hands stay inside the sleeves.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back, and unzipped.

## Known differences

- The print and the tapes are in plain block capitals, not the brand's lettering.
- The hem drawcord's toggle at the back is not modelled.
- Only one pocket shows in the photos; one is built on each side.
