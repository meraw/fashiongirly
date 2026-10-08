# Wardrobe item: Desigual silver foil cable jumper

Authored 8 October 2026. Status: first version, awaiting the user's visual review. Added by the tops chat (see “Parallel chats” in `AGENTS.md`).

## Source and reference reading

The user sent five phone screenshots of a Modivo listing for a Desigual knit jumper: the front and back on a model, a front close-up, a neckline close-up and a flat lay. The screenshots are not stored in the repository.

Features read from the screenshots:

- Black yarn coated with silver foil. Raised stitches shine silver; grooves, gaps and the inside stay black.
- A centre panel, about half the body's width, of fine twisted-stitch cables forming a diamond lattice: two diamonds stacked, with half diamonds at the sides. The back has the same panel.
- Narrow columns either side of the panel: twisted ribs and small rope cables, separated by dark grooves.
- A large wavy two-strand cable down each sleeve, with black slits where its strands part.
- A deep ribbed hem band (about 13% of the length), long ribbed cuffs (about a quarter of the sleeve) gathered at the wrist, and a ribbed crew neck. Every groove is black.
- Slim fit with set-in sleeves, cropped at the waist.

Measured on the flat lay: the panel averages (160, 160, 160), its darkest tenth (99, 100, 100) and its brightest tenth (212, 213, 213). The cuffs go down to (26, 26, 26) in the grooves.

## Implementation

Catalog ID `desigual-silver-cable-jumper-v1`. No image asset is bundled. `silverKnitData()` in `src/doll/model.js` draws each knit as a height field. Height sets both the colour (black through to silver, with a grainy foil sparkle) and the bump map. The material is metallic (metalness 0.55, roughness 0.38).

- Body (`frontPanelHeight`): one tile covers half the body, side seam to side seam, and repeats front and back. It holds the lattice panel (twisted-cable lines between dark grooves, with an occasional eyelet), the columns either side, and stockinette beyond.
- Sleeves (`sleeveCableHeight`): a two-strand cable crossing three times above the cuff, with the strand on top alternating. The inside of its loops is recessed, and there are narrow black slits where the strands bulge apart. The tile is turned so the cable faces the outer front of each arm.
- Ribs: silver ridges and black grooves, about 120 round the hem band, 64 round the neck and 40 round each cuff, with matching geometry ripples.
- Shape: a slim body from the crew neck to a deep rib band at the waist (1.27 to 1.36). The band tucks just inside the body's lower edge. Fitted set-in sleeves with the rounded shoulder cap, each blousing slightly over a long ribbed cuff that is gathered narrower than the sleeve.
- Layering: cropped, so `coversWaistband` is not set and the skirt's bow stays visible. The band clears every waistband that reaches above it, including the ultra-high Tommy pair (tested).
- Colours: calibrated by measurement. A front render's panel averages about (147, 144, 141), against (160, 160, 160) in the flat lay. The studio has no reflections, so the silver is shaded by its lights alone.
- Preset: “Silver cable study”, with the Mango washed black jeans (the photos pair it with black jeans).

## Checks

- `npm test`: 28 passing. The new test checks:
  - the parts
  - that the knit is mostly silver, with dark grooves and true black gaps
  - that the material is metallic, with a bump map
  - the cropped hem, and that the skirt's bow stays visible
  - that no trouser or skirt vertex between the hem and 1.4 pokes through the body or band, for every bottom

  The shared sleeve test also runs on this jumper. It caught the sleeve's taper under the cuff touching her arm, which was then eased.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the Mango black jeans, the Tommy jeans and the skirt. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The lattice, columns and cables are drawn procedurally. The order of the narrow columns is simplified, and the stitches are not copied one for one.
- The foil has no reflected environment, so it reads as a bright satin grey more than as a mirror.
- The black inside of the jumper is not modelled; the inside shows silver at the neck.
- Over low-rise jeans, her cream felt midriff shows between the hem and the waistband, as with the cropped crochet top.
