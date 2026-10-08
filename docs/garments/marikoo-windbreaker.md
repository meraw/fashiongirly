# Wardrobe item: Marikoo two-tone hooded windbreaker

Authored 8 October 2026. Status: approved by the user on the first version (“Yes, it's good”). It is the first piece of outerwear and added the outerwear slot. Added by the outerwear chat (see [AGENTS.md](../../AGENTS.md)).

## Source and reference reading

The user sent seven phone screenshots of a product gallery:

- on a model: front, back, and side (worn open)
- flat lays: front and back, zipped
- a zipped flat lay showing the hood and collar
- the open jacket, showing the lining

No link was fetched, and the screenshots are not stored in the repository.

Features read from the screenshots:

- Slate-blue shell with an ecru yoke over the shoulders. At the front the yoke ends in a shallow V pointing down to the zip, at about 44% of the length at the sides and 56% at the centre. Across the back it ends straight, at about 39%, as a flap with a stitched seam just above its edge.
- Dropped shoulders. On the sleeves the yoke colour ends diagonally: higher on the outside of the arm than underneath.
- A gunmetal coil zip from the hem to the top of a stand collar.
- A hood, blue outside and lined in ecru. Ecru drawcords come out either side of the zip below the collar and end in blue tips with a white band.
- A vertical welt pocket low on each front, near the side, closed by two white snaps.
- An elastic, gathered hem band and cuffs, with the body and sleeves blousing into them.
- An embroidered blue “Marikoo” script on the yoke at her left chest, just above its edge.
- A round white rubber badge on the upper left sleeve, a woven label on the hood, and a small white label low on the back at her right.
- A grey jersey lining (inside view).
- Relaxed and boxy, ending at the high hip.

Measured colours (sampled from plain areas of the flat lays): blue about RGB 88, 104, 126; ecru about 222, 222, 214; zip about 96, 94, 84.

## How the user wears it

The user is being intentional about outerwear. A jacket is either worn zipped closed or put away, and it is only worn open when it looks good open or is designed to be worn that way. This one is built **zipped closed**, hood down.

## For styling later

Recorded in the catalog entry's `styling` block, so a future outfit chooser can use it:

- Observed in the photos: slate blue and ecru, colour-blocked with a V yoke; a boxy, hip-length blouson with dropped shoulders. It covers her torso and arms to the wrist, and her neck when zipped. A woven shell with a grey jersey lining in the body.
- From the user: worn zipped closed, or not at all.
- Inferred, not stated: a light layer for mild, breezy or cool days. The hood suits light showers. Waterproofing and fibre composition are unknown.

## Implementation

Catalog ID `marikoo-two-tone-windbreaker-v1` (slot `outerwear`). It is built by `makeZipWindbreaker()` in `src/doll/outerwear.js` from the `build` spec in its catalog entry. Other zip jackets can reuse the template with their own spec. No image asset is bundled: the colour layout, script and zip teeth are drawn locally in code.

- **Outerwear slot.** `outerwearId` joins the recipe (default `'none'`). There is a new “Choose outerwear” selector after “Choose shoes”, and the slot is saved with looks. Older saved looks load with no outerwear. With no outerwear, renders are pixel-identical to `main` (checked on the default outfit, the lilac top over Levi's with the skirt, and the plaid jumper with the boots and long hair, from the front and back).
- **Body.** A boxy shell from a stand collar to a gathered elastic hem band at 1.06–1.12 (hip length; the band sits below every top's hem). The body blouses into the band in small gathers, with a few faint creases across the sides. Over the skirt, the lower body and band sit out over its fullness.
- **Colour layout.** Drawn as a texture by angle round the body and height. It holds the V-shaped front yoke, the straight back yoke with its flap seam, a soft shadow under the yoke's edge and topstitching above it, and the blue collar. The sleeves have their own diagonal layout, mirrored for her right arm. The front's centre seam is hidden under the zip.
- **Sleeves.** Dropped-shoulder sleeves with the shared rounded shoulder cap (`roundSleeveCap`), long and relaxed. They blouse into gathered elastic cuffs that end at her wrist, with her mittens out.
- **Details.**
  - Coil zip: a strip with interlocking teeth, with tonal topstitching either side, a slider and pull with a cord loop at the collar, and a stop at the hem.
  - Pockets: a tonal raised welt on each side with an opening line and two white snaps.
  - Drawcords: two, from metal eyelets, with blue-white-blue tips.
  - Badge and labels: the round sleeve badge on her left arm, and small labels on the hood and back.
- **Hood, worn down.** A rounded pouch lying over the back yoke. It is fuller toward the bottom, with two soft folds, a rolled edge, a centre seam and a label. The hood's opening comes forward round her neck to the zip as a blue roll, with an ecru lining edge. Her large head and hair hide the upper part of the hood and most of the collar; with the bun or ponytails, more of the hood shows below the head.
- **Colour, by measurement.** The first render was nearly navy, from a colour-space mistake in the texture code (fixed). After that, two adjustments: the front's plain blue now renders about 88, 104, 127, against 88, 105, 128 in the photos. The ecru renders about 229, 227, 220, against 222–232 in the flat lays.
- **Preset.** “Marikoo windbreaker study”: the jacket over the crochet top with the Tommy mom jeans (the photos pair it with mid-blue jeans).

## Layering rules (shared code, recorded here)

- A closed jacket (`layering.coversTopSleeves`) hides the sleeves of whatever top is under it. The elastic cuffs gather tighter than any top's sleeve, and the crochet top's flared sleeves are wider than her wrist, so the under-sleeves would otherwise push through. Hidden sleeves are still built, so nothing else about the top changes.
- Zipped to the chin (`layering.closed`), it also closes over the classic striped shirt's collar points, which would otherwise stand out through the chest.
- It covers the skirt's ribbon bow (`layering.coversWaistband`), like the long tops do.
- Changes outside `outerwear.js`:
  - `makeOutfit()` adds the outerwear last and applies the rules above.
  - The skirt bow's condition also checks the outerwear.
  - `model.js` exports its shared builders on one line at the end, for `outerwear.js`.
  - The waist-covering test in `tests/doll.test.js` now picks only tops: it had picked up the jacket's `coversWaistband` flag.

## Checks

- `npm test`: 46 passing after merging `main`, which added the tops chat's Lacroix sweater and the bottoms chat's carpenter jeans. The jacket's coverage test includes both. The new `tests/outerwear.test.js` checks:
  - the slot validation, and that looks without outerwear are unchanged
  - the parts: zip, pockets and snaps, cords, hood, cuffs, badge and labels
  - the colour layout: the V at the front, the straight back, the blue collar and the script on her left chest
  - hip length, and that an outfit with the jacket builds in under 0.6 s. Measured: about 80 ms after the first build, and about 230 ms for the first, which draws the textures.
  - that no vertex of any top, any bottom or the skirt between the jacket's hem and its collar shows through the jacket (with and without the skirt). A point counts as covered when it is inside the jacket's outermost surface, so the stripe jumper's wrapped shoulder is covered by the sleeve.
  - that every top's sleeves are hidden under the jacket and the bow is gone
  - that her arms, hands and thumbs stay inside the jacket's sleeves and cuffs down to the cuff's lower edge
  - the selector, saving and the study preset

  Temporarily narrowing the jacket's chest made the coverage test fail on the classic sweater, so the test does catch clipping.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, and close up at twice the resolution. Renders covered:
  - the classic outfit
  - the plaid jumper with the skirt
  - the lilac top with the Levi's, boots and long straight hair, where the hair lies over the jacket and the hood is hidden under it
  - the stripe jumper with the high bun

  The user reviewed renders from the front, a turn, the side and the back (with the bob and with the bun) and a front close-up, and approved it.

## Known differences

- The script is suggested by a capital and small joined loops. It does not spell the brand's lettering. The badge and labels carry no lettering.
- Her hands rest against the lower sides of the body, where the jacket is wider than her hips. They touch the cloth slightly, as with the jumpers.
- The jersey lining is not modelled. Only the collar's ecru lining and the hood's lining edge are drawn.
- The hood's shape when worn down is interpreted: on the model it is mostly hidden by her hair. Under the doll's head it reads as a rounded pouch whose top is in shadow.
- Fit is fixed; there are no controls for this jacket.
