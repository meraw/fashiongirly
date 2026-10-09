# Wardrobe item: Bomboogie pink faux-fur jacket

Authored 9 October 2026. Status: third version awaiting the user's visual review. Added by the chat that has been doing shoes (any chat can add any category).

## Source and reference reading

The user sent four product images on white, attached directly; no link was fetched. They show:
- the front, closed;
- a flat lay open, showing the lining;
- the back;
- a side three-quarter view.

The neck label reads Bomboogie.

Features read from the images:

- Short, dense, mink-like faux fur in dusty rose pink. It is about 187, 128, 121 at the median in the front photo.
- A big fur point collar.
- Hidden snaps under the fur at the centre front; only the top snap shows. The open flat lay shows four snaps down the front.
- A fur flap on each side of the chest, just below the collar points.
- Slanted side pockets (seen in the open flat lay).
- A boxy, cropped body with a straight hem.
- Dropped shoulders, and full sleeves gathered into fur cuff bands.
- A pink satin lining (about 204, 149, 144), with a black Bomboogie label on a chain hanger at the back of the neck.

## Implementation

Catalog ID `bomboogie-pink-faux-fur-jacket-v1` (slot `outerwear`), template `faux-fur-shirt-jacket`. It is built by `makeFurJacket()` in a new file, `src/doll/fur-jacket.js`. The file reuses the outerwear body and its fitting from `outerwear.js` (`jacketBody()`, `easeOver()` and their helpers, now exported). `makeOuterwear()` gains one dispatch line. The other outerwear renders pixel-identical to `main`, closed and open and over the skirt.

- **Fur:** a procedural texture of thousands of fine hairs lying the same way, each darker at the root and lighter at the tip. It drives both a bump map and a soft colour variation, under a matte, velvety sheen. The hairs lie down the body and down the sleeves.
- **Body:** boxy and straight to a high-hip hem, at its own size on her. It eases out only where the layers under it need room, as the leather jacket does, so it covers chunky jumpers and the skirt. The pile lies in soft, uneven waves.
- **Fur edges:** fur pieces have thick, rolled edges: the hem, the two front edges meeting in a soft parting at the centre, the collar, the chest flaps and the cuffs.
- **Collar:** a big point collar folded over the stand, lying on her shoulders, with rounded points.
- **Pockets:** a plush fur flap on each side of the chest: a domed, rounded pad whose thick lower edge stands a little off the body. A slanted slit with a fur welt low on each side.
- **Neck:** pink satin lining inside the neck, with the black label and its chain hanger.
- **Sleeves:** dropped-shoulder, full sleeves gathered into plump fur cuff bands, rolled under at the wrist.
- **Wear:** worn closed. The snaps make it a closed jacket, and the user wears outerwear closed unless it is designed to be worn open. It has no open state.
- **Colours:** measured in the photos and adjusted after comparing renders. The scene's warm lights pushed the measured pink toward peach, so the fur is set slightly cooler and darker (`#a06368`) to read as dusty rose in the app.
- **Study preset:** “Pink fur jacket study”, over the silver cable jumper, the black wide crop jeans and the cream UGG sneakers. The pointelle jumper with the 550s went over the outfit's triangle budget.

## Revision after the user's first review

The user found it very strange: the collar was far too big and covered the chest pockets. I had enlarged the collar to match how big it looks in the flat photo, but on her it swept down over her chest and the flaps. The collar is now smaller and narrower (`dropFront` .24 to .145, `spread` .42 to .3), and its points end just above the chest flaps, which sit fully in view below them, as in the photos. A test now checks that the collar's points stay above the flaps.

## Revision after the user's second review

The user said the chest pockets didn't look right: they should look like the jacket's fur flaps, not strange rectangles. They had been thin panels with a tube round the outline, which read as framed rectangles. Each is now a plush fur pad, larger and wider than tall like the photo's. Its shape is a rounded rectangle, domed and fullest toward its hanging lower edge, sinking into the body all round. The thick lower edge stands a little off the jacket, and its fur lies downward like the body's. It is laid out on an even grid, so the dome has no creases.

## Checks

- `npm test`: 84 passing. A new `tests/fur-jacket.test.js` checks:
  - the parts, and that zips, bands and the hood are absent;
  - the fur material, with hairs lying downward on the body and sleeves;
  - that the jacket stays closed;
  - the cropped hem, and the collar points ending above the chest flaps;
  - the chest flaps on each side;
  - that it eases out over a chunky jumper and is boxier than the leather jacket;
  - the build time.

  The shared outerwear tests cover it over every top and bottom and the skirt, and check that her arms and hands stay inside its sleeves and cuffs.
- `npm run build` succeeds.
- The other outerwear renders pixel-identical to `main`: the Marikoo and Red Bull windbreakers, the leather jacket (open and closed) and the emerald parka (closed, and open over the skirt).
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter and back next to the photo;
  - over a chunky jumper and over the skirt;
  - in the real app with its study preset.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The fur is a texture and a sheen on smooth surfaces; its silhouette is smooth rather than fuzzy.
- The collar is a single thick leaf with rolled edges, thinner than real fur.
- The hidden snaps are not modelled, apart from the one that shows at the top. The label lettering is not reproduced.
- Like every jacket on the doll, its sleeves end above her mitten hands.
