# Wardrobe item: Levi's floral batwing logo sweatshirt

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user sent four product photos without a description, attached directly; no link was fetched:
- a close-up of the chest;
- a full-length front on a model;
- the back on a model;
- the front on a model.

The photos are not stored in the repository. The brand is read from the logo and the red side tab.

Features read from the photos:

- A washed black cotton fleece sweatshirt, relaxed and slightly boxy.
- On the chest, centred a little below the neckband, the Levi's batwing logo:
  - filled with white lilies (blushed pink, with long stamens), pink buds and green leaves on a sky-blue ground;
  - some lilies spill over its top and side edges;
  - black lettering across it, and a registered mark at its top right.
- A ribbed crew neckband.
- Dropped shoulders, and full long sleeves gathered into rib cuffs.
- A deep rib hem band at the waistband of high-rise jeans, with the body blousing a little over it.
- A small red tab in her left side seam, just above the band.
- A plain back.

Colours measured on the photos:
- fleece about RGB 34, 30, 36 (the close-up is darker, about 19, 16, 22), with the bands the same;
- the logo's sky blue about 136, 160, 185;
- lily white about 195, 194, 203;
- pink about 194, 134, 149;
- leaf green about 107, 126, 127;
- the lettering near black.

## Implementation

Catalog ID `levis-floral-batwing-sweatshirt-v1` (slot `top`). It is built by `makeSweatshirt()` in a new file, `src/doll/sweatshirt.js`, from the `build` spec in its catalog entry (template `logo-sweatshirt`). `makeOutfit()` gains one dispatch line. No shared code changes, so every other garment is unchanged.

**Shape.** The body falls from dropped shoulders like the windowpane jumper's, a little slimmer, and blouses over a deep rib band. Its fit already clears every bottom and the skirt. Over the skirt the band sits out wider, as the jumper's does. There is a ribbed crew neck, and the sleeves are full, gathered into rib cuffs that ease over her hands.

**Fleece.** A matte cotton fleece with a soft sheen and a fine knit bump. The washed black is faintly mottled where the dye has faded.

**Logo.** It is drawn in code, not copied from the photos, at three times its final size and averaged down for soft edges:
- **batwing:** a straight top edge and sides; along the bottom, two arches rise into it between three points;
- **flowers:** inside it, a sky-blue ground with soft lighter patches, then leaves, buds and pale lilies behind. Six big lilies and four buds are placed as on the photos, three lilies and a bud spilling over the edge. Each lily has six pointed petals in white shading to lilac, blushed pink at the throat, and a few curving stamens;
- **lettering:** a heavy sans built from simple shapes, which is close to, but not, the brand's own lettering. It has a long-footed L, a round e open at the lower right, a v, an i with a square dot, an apostrophe and an s. Upright strokes are heavier than the curves across, which keeps the counters open;
- **registered mark:** a thin ring with an R.

It is about 0.3 wide on her chest, its top about a fifth of the way from the neckline to the hem. It sits on the front of a body texture that holds a front and a back panel side by side, each projected flat, as on the Mickey tee, so it stays upright and undistorted.

**Tab.** A small red tab sewn into her left side seam just above the band, folded flat and pointing forward. With her arms down, her arm hides it from most angles, as it would on a person.

**Colours.** The colours were measured on the photos and checked in renders, then adjusted for the scene's lighting: the sky blue is set darker (`#46699a`) so that it renders at about the photo's blue.

**Study preset.** “Levi's logo sweatshirt study”, with the Tommy mom jeans and the cream Converse high-tops, close to the photos' light jeans and black high-tops.

**Styling notes** (catalog `styling`):
- warmth 3, inferred from a fleece sweatshirt with long sleeves and rib cuffs and hem;
- for cool days, on its own or under a light jacket;
- black with sky blue, white, pink and green;
- casual and sporty.

## Checks

- A new `tests/levis-sweatshirt.test.js` checks:
  - its parts;
  - that the logo is on the front panel, mostly sky blue with flowers, with the lettering across it;
  - that the back and the front beside the logo are plain;
  - that the texture runs from the neckline down, so the logo is upright;
  - the red tab on her left side above the band;
  - the cuffs at her wrists;
  - the band sitting out over the skirt;
  - the cached rebuild time.
- The shared tests also run on it: sleeves over her arms, cuffs clear of her hands, every waist-covering top over every bottom, styling facts, and every jacket over every top and the skirt.
- `npm test`: 95 passing after merging `main` (which added the Desigual mountain landscape shirt, the ONLY taupe coat and the Mango halftone dot shirt). `npm run build` succeeds.
- The logo takes about 0.9 seconds to draw the first time the sweatshirt is worn; later outfits reuse it.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter, side and back;
  - a logo close-up next to the chest photo;
  - over the skirt, and under the open leather jacket;
  - in the real app with its study preset.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The logo is a redrawing: the flowers are simpler than the printed artwork and their layout is approximate. The lettering is a plain heavy sans, not the brand's typeface.
- The text on the red tab is not drawn.
- The dropped shoulder seams are not drawn.
