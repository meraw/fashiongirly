# Wardrobe item: Buffalo Aspha olive platform boots

Authored 8 October 2026. Status: first interpretation awaiting the user's visual review. First pair of shoes from the user's wardrobe list, and the first item in the shoe slot, added by the shoes lane (see [AGENTS.md](../../AGENTS.md)).

## Source and reference reading

The user sent five phone screenshots of an Amazon listing, “Buffalo Aspha NC Mid Vegan Nu”, colour Verde, size 36 EU: front three-quarter, outer side, back three-quarter, inner side and inner three-quarter. They were attached directly; no link was fetched.

Features read from the images:

- A chunky platform sole in the same olive as the upper: deep trapezoid lugs, a ledge above the lugs, a raised heel cup that steps down toward the midfoot, and a toe that lifts off the ground.
- Mid-cut upper in matte, softly mottled olive vegan nubuck, with tan double topstitching.
- A padded collar quilted in two horizontal rows around the back and sides.
- A tall heel pull tab of jacquard logo tape: a grey centre band reading “BUFFALO //” between black and taupe woven edges. The same tape runs down the tongue and forms a short tongue pull tab.
- Lacing: metal eyelets low and high, two taupe webbing loops per side in between, and flat olive laces.
- On each side, a curved overlay edged in dark piping arches from the heel cup up to the lacing. Below it, a window shows two diagonal taupe webbing straps.
- A small rubber badge low on the tongue; a woven label in the side window; “Buffalo” script embossed on the heel of the sole.

## Implementation

Catalog ID `buffalo-aspha-mid-olive-v1` (slot `shoes`), built by `makeLugBoot()` in `src/doll/model.js` from the `build` spec in its catalog entry. Other lug-sole boots can reuse the template with their own spec.

- **Shoe slot.** `shoesId` joins the recipe (default `'classic'`). The classic loafers moved out of `makeDoll()` into the outfit via `makeShoes()`; her socks stay part of the doll. With loafers, renders of the default outfit and of every catalog pair of jeans are pixel-identical to `main`.
- **Height.** The platform is built inside her existing foot height: she is not raised, and the sole stands on the floor. The user was asked whether platforms should raise her but had not answered, so this is a reversible default.
- **Upper.** Built from horizontal slices whose front recedes up the lacing (`upper` rows: height, front, back, half-width), with a squarer toe and a rounder heel. It encloses her socks with clearance, and narrows a little toward the collar so the two legs of wide jeans have room between her feet.
- **Sole.** Flared from the upper's base outline, with 21 wedge-shaped lug gaps, a ledge, a groove, a heel cup that rises toward the back, and a lifted toe.
- **Details.** Padded collar roll and lining; collar puffed between its quilting rows; heel tab and tongue tab in logo tape; tongue with tape and a badge; eyelets, webbing loops, crossed laces and a small bow; side piping, window straps, vamp and eyestay stitching.
- **Tape texture.** `src/wardrobe/buffalo-tape.js` is a 128 × 768 WebP drawn locally from the back photo (grey band, darker grey lettering set in Inter ExtraBold, black and taupe woven edges). It is a redrawing, not a crop of the photo, and the lettering is not Buffalo's own typeface.
- **Colour, by measurement.** In the side photos, plain nubuck measures about RGB 75, 69, 53 and the sole about 70, 68, 57. The first render was too brown and dark (66, 56, 42). After two adjustments the side render measures 73, 66, 51 on the upper and 68, 67, 56 on the sole. Nubuck mottling is a gentle multiplier around 1, so it doesn't shift the average.

## Layering with bottoms (changes in the bottoms lane)

Each pair of shoes now reports `rest(side, x, z)`: the height at which a hem resting on it lies at that point. The loafers keep the exact formula `makeJeans()` used before, now moved into `makeShoes()`. `makeJeans()` takes this function instead of assuming the loafer. These were the only bottoms-lane edits; they were needed so long jeans could sit on any shoe:

- For boots, a full-length hem (`hem: 'rests-on-shoe'`) settles partway up the vamp (`restCap`), falls away to the floor just beyond the platform instead of stepping down, and tents gradually around the leg. Above the hem, the leg bows out just enough to clear the boot shaft, laces, collar and tabs (`rest.inside`).
- The Levi's '94 and Stradivarius tests now read the loafer's height from the outfit instead of the doll.
- The side seams and frayed hem follow a hem that has moved up onto a boot collar.
- Catalog jeans whose hem would end inside the boot (the cropped Davinia and the ankle-length Tommy mom jeans) sit on top of the padded collar instead, gathering a little above it, with the pull tabs standing up outside them (`rest.collar`). An attempt to take them over the shaft made slim legs balloon. The classic barrel jeans tuck into the shaft.

## Checks

- `npm test`: 29 passing. A new `tests/shoes.test.js` checks four things:
  - The slot: only shoes fill it, and the loafers moved from the doll to the outfit.
  - The boots: their details, platform thickness, lugs, feet kept apart, and her socks and lower legs inside the boots.
  - Layering, for every bottom with every catalog shoe: full-length jeans drape over the shoe without any part poking through, without pushing the legs together more than the loafers do, and still reach the platform; shorter jeans sit on the collar; the classic jeans stay inside the boot shaft.
  - The UI: selector, saving and the study preset.
- The draping check was confirmed to fail with the draping switched off.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front three-quarter, both sides, the back and full length, and compared with the product photos. Also rendered with every pair of jeans (Levi's '94, Topshop barrel, Stradivarius, Davinia, Tommy and classic). The real app page loads the preset and switches shoes without errors. The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- Her toy foot is shorter and wider than a real foot, so the toe is stubbier and the lacing starts closer to the toe than in the photos.
- The heel-cup step in the sole is softer than in the photos, and the lugs are evenly spaced.
- The quilting is drawn as stitch lines with a slight puff, not as deep channels.
- The tongue badge, side-window label and embossed “Buffalo” script on the sole carry no lettering. The tape lettering is redrawn.
- Laces are round cords, not flat laces.
