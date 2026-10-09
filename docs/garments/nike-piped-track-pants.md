# Wardrobe item: Nike woven track pants with piping

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. A piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The user sent six phone screenshots of a product gallery (images 2, 3, 5, 6, 7 and 9 of 9), with no text:
- the front on a model, full length and closer
- the side
- a pocket close-up
- the styled top half (mostly the hoodie)
- the back

The embroidered swoosh identifies the brand; the product name was not visible. Photos are not stored in the repository.

Features read from the photos:

- Raspberry pink lightweight woven nylon with a fine crinkle and a soft sheen.
- An elastic, gathered waistband with a tonal drawstring tied in a knot at the front, its ends hanging nearly to the crotch.
- Wide straight legs, full length, pooling over the shoes; a mid rise.
- Two white piping lines on each leg, one either side of the side seam, both starting at the waistband. The front line edges the side pocket, then sweeps onto the front of the leg toward the hem; the back line sweeps toward the back.
- Side seam pockets.
- A small white embroidered swoosh on the wearer's left thigh, between the two piping lines.
- A small welt pocket on the back right.

The brown cropped hoodie, the white top and the trainers are styling.

## Implementation

Catalog ID `nike-piped-track-pants-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. It uses the jeans template as the Zara cargo trousers do:
- no loops, button, fly, rivets or back patch pockets
- a gathered elastic waistband (1.21 to 1.26) and a smooth, sheen `surface` with no twill
- slant pocket lines just in front of the side seams, and a tonal welt (`weltColour`)
- full-length legs resting on whatever shoes she wears

New jeans template options, all off by default (other pairs are unchanged):

- `piping`: contrast piping lines, each a path of [height, angle from the side seam toward the front], mirrored on both legs and placed on the built surface. Near a long hem that lifts over the shoe, a line stops before it would wrap to the far side of the leg. A first version showed short stubs at the back of the hem for this reason.
- `tick`: a small embroidered tick on the front of one thigh, a curved tapering mark with its point toward the side seam. It is a simple shape, not a traced logo.
- `drawstring.knot` and `drawstring.metal: false`: a knot at the centre, and tips in the cord's own fabric instead of metal.
- `weltColour`: a colour for the back welt pocket, which is otherwise dark.

The first piping angles put both lines too near the side seam: the front line hid at the sides from the front, and the back line at the silhouette from behind. They now follow the photos: the front line reaches about a third of the way across the front of each leg toward the hem, and the back line sweeps to the outer back.

## Styling facts

Recorded in the catalog entry in the tops' format, for later outfit selection:

- **Silhouette:** wide straight, full length.
- **Palette:** raspberry pink with white.
- **Coverage:** mid rise, full-length legs.
- **Material:** lightweight woven nylon (from the photos; composition unknown).
- **Warmth:** 1, inferred from a thin unlined shell.
- **Weather:** mild days. Water resistance is unknown.

## Fabric and colour

The swatch comes from a plain area of the pocket close-up, keeping the brightness detail of the nylon's crinkle (at 1.8 times contrast) with its colour from the measured average. A first, flatter swatch with a stronger sheen read as smooth plastic. Stored as WebP in `src/wardrobe/nike-track-fabric.js`.

Plain fabric in the photos measures RGB 186, 65, 105 and 196, 61, 95 at the front, 193, 79, 119 in the close-up and 190, 79, 116 at the back. The first render, from a swatch of 150, 52, 82, was 209, 85, 116 (too light). With a swatch of 135, 42, 70 and a rougher finish, front and back measure 194, 67, 96.

## Checks

- `npm test`: 66 passing after merging the other chats' spray-paint floral shirt, track dress and Van Gogh tee. A new test checks:
  - none of the jeans hardware is present
  - the knot, cords and welt
  - the tick is on the front of the left thigh
  - each leg has two piping lines, the front one sweeping toward the front lower down and the back one behind the side seam
  - full length over the shoes

  The layering and shoe tests cover this pair under every top and with every pair of shoes.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, without a top, under the crochet top, with the green cable sweater and UGG sneakers, and at phone size. Compared side by side with the front and back photos. The user has not yet seen it.

## Known differences

- The piping paths are an interpretation of photos taken at different angles.
- The drawstring hangs straight from a simple knot, without the photo's loose loops.
- The crinkle is a fine texture; the larger creases of the nylon are not modelled.
- Fixed 9 October 2026 for every pair: the line where the hips met the legs is gone (see [the pleated linen trousers](pleated-linen-wide-trousers.md#the-line-where-the-hips-meet-the-legs)).
