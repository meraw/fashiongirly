# Wardrobe item: Tommy Jeans red varsity crest jumper

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user sent two product photos without a description: the front and the back on a model, over light jeans. The photos are not stored in the repository. The brand is read from the knitted-in lettering.

Features read from the photos:

- A boxy, cropped jumper in a heathered red knit, flecked with lighter yarn.
- Knitted in off-white across the front:
  - TOMMY JEANS in tall, worn varsity capitals with slab serifs, broken by fine red streaks. The top of the lettering is straight; its foot rises toward the middle, so the letters are tallest at the ends and arch over the crest;
  - below it, an oval crest. A ring is lettered TOMMY JEANS, MANHATTAN and NEW YORK round a shield with a big T and a crown. Under the shield are small TOMMY and JEANS banners and 1985, and a VARSITY CHAMPS ribbon runs across the crest's foot.
- A ribbed mock neck, rolled at the top.
- Dropped shoulders, and full sleeves gathered into long rib cuffs.
- A deep rib hem band ending at the waistband of high-rise jeans.
- A plain back.

Colours measured on the photos:
- red about RGB 220, 13, 25, with lighter flecks about 255, 90, 92 (a few per cent of the knit);
- the ink an off-white about 244, 225, 219.

## Implementation

Catalog ID `tommy-jeans-red-varsity-crest-jumper-v1` (slot `top`), on the logo-sweatshirt template (`makeSweatshirt()` in `src/doll/sweatshirt.js`), which gains optional settings for it. Without them the template draws exactly what it did: the Levi's sweatshirt renders pixel-identical to `main`, both on its own and over the skirt.

- **Heathered knit (`colours.fleck`):** short flecks of a lighter yarn scattered through the knit.
- **Varsity crest print (`logo.kind: 'varsity-crest'`):** drawn in code, not copied from the photos, in a new file, `src/doll/varsity-crest.js`:
  - a simple stroke lettering on a small grid, with the capitals and figures the print uses;
  - **TOMMY JEANS:** heavy strokes with slab serifs, warped between a straight top and an arched foot. Fine, broken red streaks run down through the letters;
  - **the crest:**
    - an oval ring of two lines, with its lettering running clockwise between them, tops outward;
    - a solid shield with a big red T outlined in white, and a crown;
    - two small curved banners and the year in a little box;
    - the ribbon across the ring's foot, with its lettering, edges and forked tails;
  - drawn at three times its final size and averaged down; a few red flecks show through the ink.
- **Mock neck (`body.neckName`, `body.neckRoll`):** a taller ribbed neck with its top edge rolled over. Her big head hides most of it, as with the other high necks.
- **Tab (`tab`):** now optional; this jumper has none.

**Shape.** The chenille jumper's boxy cropped body and sleeves, which clear every bottom. The band ends at her waist, above the jeans' waistband, so it does not cover it. Over the skirt, the skirt's bow shows.

**Print size.** The print is 0.44 across her front, about two thirds of its width, as on the model. Her torso is wider and shorter than the model's, so the print is a little squatter, and the crest sits closer under the lettering to fit above the band.

**Colours.** Calibrated in renders: the knit renders at about 225, 27, 39 against the photos' 220, 13, 25.

**Study preset.** “Varsity crest jumper study”, with the Tommy mom jeans and the cream Converse high-tops.

**Styling notes** (catalog `styling`):
- warmth 3, inferred from a knit jumper with a mock neck and long sleeves, though cropped;
- cool, dry days;
- red and off-white; sporty, collegiate and bold.

## Checks

- A new `tests/varsity-jumper.test.js` checks:
  - its parts: the mock neck and its roll, and no tab or crew neck;
  - the print on the front, both the lettering band and the crest;
  - the plain, flecked back;
  - the cropped hem, with the skirt's bow showing;
  - that the Levi's sweatshirt keeps its crew neck and tab;
  - the cached rebuild time.
- The shared tests also run on it: sleeves and hands, styling facts, and every jacket over every top and the skirt.
- `npm test`: 102 passing after merging `main` (which added the Levi's plaid flannel shirt). `npm run build` succeeds.
- The Levi's sweatshirt renders pixel-identical to `main`.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter, side and back;
  - a chest close-up;
  - over the skirt, and under the open leather jacket;
  - in the real app with its study preset.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The lettering is a simple stroke lettering with slab serifs, not the brand's typeface; the crest's artwork is simplified, and its small lettering is legible only close up.
- The print is a little squatter than on the model, to fit her torso.
- The mock neck is mostly hidden under her head.
