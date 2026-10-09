# Wardrobe item: New Balance 550 cream leather sneakers

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Fifth pair of shoes from the user's wardrobe list.

## Source and reference reading

The user sent six product images: front three-quarter, back three-quarter pair, outer side, sole, inner side and toe three-quarter. They were attached directly; no link was fetched. The midsole reads “new balance” and the vamp is embossed “550”.

Features read from the images:

- A low retro basketball sneaker, all cream and off-white.
- Smooth cream leather, with a slightly darker heel counter and a pale leather toe cap.
- A perforated leather quarter below the lacing, and a beige mesh window under the collar.
- A big slanted N on each side in pale pinkish suede, edged in white leather.
- White leather piping sweeping from the heel down and forward, then up to the lacing. White leather edges along the eyestays.
- Punched eyelets and white flat laces tied in a bow.
- A very puffy padded collar with a peach-yellow lining, and a tall puffy nylon tongue with a label.
- A chunky cupsole: an aged cream midsole with horizontal grooves over a grey rubber outsole with block lugs. The outsole rises higher round the heel and toe.

## Implementation

Catalog ID `new-balance-550-cream-v1` (slot `shoes`), template `sneaker`. It is built by the UGG sneakers' builder, `makeLugBoot()` in `src/doll/model.js`, with new options that default to the old behaviour. The boots, the UGG sneakers and the loafers render pixel-identical to `main`, bare and with jeans.

- **Leather** (`leather`): a smooth, softly glossy upper instead of nubuck or mesh. Panels can be leather (`leather`), can carry punched holes or mesh as a bump map (`bump`), can sit at their own depth (`off`) and can go without stitching (`stitch: false`). The eyelets can be punched holes rather than metal (`punched`).
- **Cupsole** (`sole.cup`): a grey outsole with block lugs cut into its wall, rising higher round the heel and toe, under a cream midsole with two grooves and a rounded top edge. `sole.randFrom` lets the sole come down toward the toe earlier.
- **The N** (`logo`): a slanted N filled as a fine grid laid on the upper, so it follows the shoe's curve, with a white leather edge. It reads the right way round from outside on both sides of each shoe.
- **Piping** (`trims`): white leather piping along the sweep, on both sides.
- **Collar and tongue:**
  - A thick padded collar round the back and sides (`collarPad`) shows the peach lining on its inner side.
  - The tongue's top is a padded pillow (`tonguePad`). The laces arch less (`puffyLace.lift`) and have their own knot size (`puffyLace.knot`).
  - The tongue can have its own colour (`colours.tongue`), and the sole's welt line its own (`colours.welt`).
- **Proportions:** measured from the outer side photo.
  - Outfit heights stand at 0.76 of their length on her, so heights from the photo were scaled up to match.
  - The collar and tongue must stay below where the classic trousers end. Otherwise they would show through those trousers' cuff.
  - So the upper is a little lower than in the photo, and the shoe a tenth shorter than the measured length, so it doesn't look long and low.
- **Colours:** measured in the side photo and adjusted after comparing renders: the leather is about 214, 210, 204, the N is darker suede, the midsole 195, 186, 174 and the outsole grey 147.
- **Her socks and height:** like the UGG sneakers, the shoe brings her slim ankle socks and hides her round doll socks. The sole stays within her normal foot height, so she is not raised.
- **Layering:** the same shoe-side settings as the UGG sneakers. Long jeans and the track pants rest on the shoe, and cropped and classic jeans end above the collar. No trousers code changed.
- **Styling notes** (catalog `styling`): a closed low sneaker; all seasons except deep cold; cream and off-white with a grey outsole; retro sporty.

## Checks

- `npm test`: 68 passing. A new test checks:
  - the sneaker's parts, and that the boot-only parts are absent;
  - the eyelet count, and an N on both sides of each shoe;
  - that she is not raised and the sole is on the floor;
  - the two-tone cupsole, with the outsole rising round the heel;
  - that the N lies on the outside of the upper;
  - that her ankle socks stay inside the shoe and her legs inside the socks.

  The layering test covers the 550 with every bottom.
- `npm run build` succeeds.
- The boots, the UGG sneakers and the loafers render pixel-identical to `main` (bare, with Levi's '94 and with Davinia jeans).
- Rendered in headless Chromium (software WebGL):
  - next to the photos from the side, front three-quarter and back;
  - with Levi's '94, the classic jeans, the Nike track pants, and on her full figure.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The upper is lower than in the photos, so it fits under the classic trousers. The tongue does not stand up as high.
- The “550” and “new balance” lettering, the heel NB and the tongue label are not reproduced.
- The suede toe overlay is not modelled; the toe top is smooth leather. The midsole's stepped heel is simplified to straight grooves.
- The perforations and the mesh are bump maps that only read close up.
