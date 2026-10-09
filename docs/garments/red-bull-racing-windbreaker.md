# Wardrobe item: Red Bull Racing stone windbreaker

Authored 9 October 2026. Status: awaiting visual review. The second jacket on the zip-windbreaker template (after the [Marikoo windbreaker](marikoo-windbreaker.md)).

## Source and reference reading

The user sent five phone screenshots of a product gallery, with no text:

- on a model: front (worn open) and back
- a close-up of the collar
- flat lays: front and back, zipped

No link was fetched, and the screenshots are not stored in the repository.

Features read from the screenshots:

- A one-colour stone (light greige) woven shell, matte and slightly technical.
- A tall stand collar with the hood stowed inside it. The collar has a zip seam across its back, metal snaps at the front and a small cord toggle.
- A zip covered by a storm placket from the hem to the top of the collar.
- Raglan sleeves. Curved front panel seams sweep from the sides down to pocket openings low on each front.
- A horizontal flap seam across the middle of the back.
- Reflective silver-white prints: “RED BULL RACING” running down beside the placket on her right chest, and “Red Bull” across the back just above the flap.
- An elastic, gathered hem band with a cord toggle at the front, and elastic cuffs.
- A small rectangular rubber patch on the upper left sleeve.
- Boxy and relaxed, ending at the high hip.

Measured colour: the shell is about RGB 197, 192, 183 in plain, lit areas of the photos.

## How the user wears it

The user wears outerwear zipped closed unless it is designed to be worn open (see the Marikoo record). The model wears this one open, but nothing marks it as made to be worn open, so it starts **zipped closed**. On 9 October 2026 the user asked to see jackets open on the doll, though not to wear them that way. So it has the “Wear it open” setting: the fronts part, the placket stays on her left front with a zip half on each edge, and the inside shows in the shell colour (the lining is not visible in the photos).

## For styling later

Recorded in the catalog entry's `styling` block:

- Observed in the photos: stone with silver-white reflective prints; plain apart from tonal lettering. A boxy, hip-length blouson with raglan sleeves. It covers her torso and arms to the wrist, and her neck when zipped (the collar is tall). A woven shell.
- From the user: worn zipped closed, or not at all, in real life (their rule for outerwear). Shown open on the doll only to see how it looks.
- Inferred, not stated: a light layer, as the shell is unpadded, for mild, breezy or cool days. The stowed hood suits light showers. Waterproofing, lining and fibre composition are unknown.

## Implementation

Catalog ID `red-bull-racing-stone-windbreaker-v1` (slot `outerwear`). It is built by `makeZipWindbreaker()` in `src/doll/outerwear.js` from the `build` spec in its catalog entry, with the Marikoo jacket's body and sleeve shape. No image asset is bundled: the colour, seams and prints are drawn locally in code.

### New optional template settings (additive)

Each setting is optional. When it is missing the template does exactly what it did before, so the Marikoo windbreaker is unchanged: a fingerprint of its geometry, placement and textures (with and without the skirt) is identical to `main`'s, and a test checks that it keeps its own zip, hood, cords, snaps and badge and gains none of the new parts.

- **One-colour body** (no `yoke`): the body is drawn by `plainBodyData()` in the shell colour, and the sleeves use the shell colour too.
- **`lines`**: seams drawn on the body texture. Each line is a list of points as seen straight on from the front or the back, optionally mirrored, with a width, a shade and an optional soft shadow below it.
- **`prints`**: blocks of light printed lettering, horizontal or running downwards, on the front or back. Each print spells its `text` in a plain 5 × 7 block-capital font (`letterInk()`), not the brand's typeface.
- **`placket`**: a storm placket covering the zip (`coveredZip()`), with topstitching either side and snaps on the collar, in place of the coil zip, slider and pull.
- **`toggles`**: short cords ending in dark toggles (`cordToggle()`), here at the hem band and the collar.
- **No `hood`, `cords` or `backLabel`**: those parts are left out.
- **`badge.shape: 'rect'`**: a flat rectangular patch in place of the round badge.
- **Shown open** (`layering.canOpen`, with `build.open.shift` and an optional `colours.lining`). This applies to both windbreakers, added on 9 October 2026 at the user's request:
  - The fronts slide apart at their edges, as in the leather jacket, and the hem band and collar part with them.
  - A coil zip becomes a half on each edge, with the slider left at the hem. A placket stays on her left front.
  - A lining shows inside.
  - The body eases out where the layers under it need room (`easeOver()`, spread wider by `broaden()` so a loose body eases gradually), for example over the classic shirt's collar points, which a zipped jacket hides.
  - Zipped, both windbreakers are unchanged: their fingerprints match the versions before this setting.

### Details

- **Colour, by measurement.** The first version rendered the shell at about 226 against the photos' 197. The colours were darkened twice; the shell now renders at about 195–206 in lit areas.
- **Seams.** Raglan seams front and back, the curved front panel seams down to the pockets, and the back flap seam with a shadow under it and a stitch line above.
- **Pockets.** Narrow welts at the low ends of the curved seams, without snaps.
- **Preset.** “Red Bull windbreaker study”: the jacket over the navy half-zip dress with the UGG cream sneakers.

## Checks

- `npm test`: 72 passing after merging `main`. The new `tests/red-bull-windbreaker.test.js` checks:
  - the parts: placket, topstitching, collar snaps, two toggles on cords, pockets, cuffs and the rectangular patch on her left sleeve
  - that there is no coil zip, hood, drawcord, snap pocket or back label
  - the prints on the body texture: beside the placket at the front, across the back above the flap, and nothing on the sides
  - that the study wears it
  - that the Marikoo windbreaker keeps its own parts and gains none of the new ones
  - shown open, for both windbreakers: the zip halves, the lining, the placket on the left front, the shirt collar showing, and nothing spanning the opening. Zipped, there is no lining or zip half and the shirt collar is hidden.
- The shared coverage tests now also run both windbreakers open (they cover every way a jacket can be worn). The two tests that said the windbreaker only stays closed were updated to the user's new decision.
- The shared outerwear tests in `tests/outerwear.test.js` pick up the new jacket automatically. They check that it covers every top, bottom and the skirt from its hem to its collar, hides the tops' sleeves, and keeps her arms and hands inside its sleeves and cuffs.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back, over the half-zip dress, zipped and open. The open Marikoo jacket was rendered over its study outfit and over the classic striped shirt.

## Review history

- The first version drew made-up block glyphs in place of the lettering. The user saw them as Russian (some looked like Cyrillic letters), so the prints now spell the words.

## Known differences

- The prints spell “RED BULL RACING” and “RED BULL” in a plain block font. They do not use the brand's typeface or reproduce its logo. The sleeve patch has no lettering.
- The hood stays stowed in the collar and is not modelled. The collar's back zip seam is not drawn.
- The pocket openings are drawn as narrow welts along the curved seams.
- Fit is fixed; there are no controls for this jacket.
