# Wardrobe item: Replay cream rose embroidered sweatshirt

Authored 9 October 2026. Status: first version, awaiting visual review. It adds the `embroidered-sweatshirt` template (`src/doll/embroidered-sweatshirt.js`).

## Source and reference reading

The user sent three photos:

- the front on a model, cropped, with black jeans
- the front on another model, with light jeans
- a crumpled photo of the front on a hanger, which the user sent "to notice the details in front"

No link was fetched, and the photos are not stored in the repository. The brand is read from the script on the sleeve.

Features read from the photos:

- Cream cotton fleece, boxy and cropped.
- A spray of embroidered red roses across the chest:
  - a large rose in the middle, a smaller one to her right and lower, and one to her left and higher
  - rosebuds at the top right and to the left
  - stems, and many green leaves in two tones with paler veins
- A ribbed crew neckband, with a stitched V insert below it at the front.
- Dropped shoulders, with the shoulder seam low on her upper arm.
- Very full long sleeves into long rib cuffs.
- A deep rib hem band. On the hanger and the first model, it dips lower at the back.
- A small navy embroidered script, "Replay", on her left sleeve above the cuff.

Colours measured on the photos:

- fleece about RGB 234, 227, 216
- rose red about 184, 8, 44, with shadows about 142, 1, 22
- leaf green about 67, 102, 11

## How the user wears it

Not stated. The two models show different lengths. It is built cropped at the waistband, as on the first photo and on the hanger.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:**
  - Palette: cream, with red and green embroidery.
  - Shape: boxy and cropped at the waistband, with full sleeves.
  - Coverage: a crew neck, long sleeves, and her midriff covered.
  - Material: cotton fleece.
- **Inferred:** warmth 3. For cool days, on its own or under a light jacket.
- **Unknown:** the fibre composition, and how long it is on the user.

## Implementation

Catalog ID `replay-cream-rose-embroidered-sweatshirt-v1` (slot `top`), built by `makeEmbroideredSweatshirt()` in a new file, `src/doll/embroidered-sweatshirt.js`, from its `build` spec. `makeOutfit()` gains one dispatch line. No shared code changes. The Levi's sweatshirt's template is left as it is: this one differs in shape and in its details, so it gets its own template rather than new options on another chat's.

- **Body.** A boxy body from dropped shoulders, straight into a deep rib band at the waistband. The band dips about 0.045 lower at the back (outfit units), and the body above it follows. Over the skirt, the band sits out wider. The lower body has the Levi's sweatshirt's proven width: wider, it showed through the adidas cropped windbreaker's shirred band.
- **Embroidery.** Drawn in code, not copied from the photos, at three times its final size and averaged down for soft edges:
  - **Roses:** five rings of cupped petals. Each petal is deep red where the petals inside it rise over it, brighter toward its curled-back rim, and creased where it meets its neighbours. The petals vary a little in size and tone, and the heart is a tight, shadowed cup.
  - **Leaves:** serrated blades in two greens, with a pale midrib and side veins.
  - **Buds:** red teardrops held in green sepals.
  - **Stems:** green cords.
  - **Stitching:** every piece is satin-stitched, a fine ripple of light and shade across its threads, with a darker edge where the embroidery stands proud of the fleece.

  The spray is about 0.46 wide on her chest. The motifs are placed as in the photos but squeezed a little in height, to fit her shorter torso.
- **Projection.** The body's texture holds a front and a back panel, each projected flat, as on the Levi's sweatshirt, so the embroidery stays upright and undistorted.
- **V insert.** A rib-knit triangle below the neckband, with two rows of stitches along each side. Her large head hides most of it from the front.
- **Sleeves.** Very full, with a shoulder seam low on her upper arm. They end in long rib cuffs that ease over her hands.
- **Script.** A joined handwriting stroke in navy, on a small patch on the front of her left forearm above the cuff. It is a generic hand, not the brand's lettering.
- **Colours, by measurement.** The front's plain fleece renders at about RGB 237, 231, 220. The rose and leaf inks are set darker than the photos' colours, to allow for the scene's lighting.
- **Preset.** "Rose sweatshirt study": with the Mango washed-black jeans, as on the first photo.

## Checks

- `npm test`: 102 passing after merging `main` (the pink yoke shirt, the snap-collar jumper and the plaid flannel shirt), including the new `tests/replay-sweatshirt.test.js`. It checks:
  - the parts, and the parts it leaves out
  - the roses and leaves on the front panel, a red big rose, and a plain back
  - the cream fleece
  - the hem lower at the back
  - cuffs past her wrist, and the script on her left sleeve
  - the band over the skirt
  - the cached rebuild time
  - the study
- The shared tests also run on it:
  - sleeves over her arms, and cuffs clear of her hands
  - the waistband covered over every bottom
  - every jacket over it
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back.

## Known differences

- The embroidery is a redrawing. Its roses and leaves are simpler than the real stitching, and their layout is approximate.
- The script is a generic joined hand.
- The V insert is mostly hidden by her head.
