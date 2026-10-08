# Wardrobe item: Dr. Martens cow print platform slides

Authored 8 October 2026. Status: first interpretation awaiting the user's visual review. Second pair of shoes from the user's wardrobe list, added by the shoes lane. It is the first open shoe and the first pair that raises her.

## Source and reference reading

The user sent five phone screenshots of a shop gallery (images 1, 3, 4, 5 and 7 of 7): inner side, front three-quarter pair, back pair, top pair and a toe close-up. No product name or link was given; the footbed reads “Dr. Martens AirWair”.

Features read from the images:

- An open-toe, open-back slide on a chunky platform.
- Two wide crossed straps of black-and-white cow print pony hair, edged in black leather piping, with thin black leather cords crossing over them in an X.
- A black leather instep strap with a large silver buckle on the outer side.
- A black suede footbed with the AirWair logo.
- A black leather welt band with fine horizontal grooves and yellow welt stitching.
- A sculpted outsole in smoky, slightly translucent black: toe and heel blocks, a ribbed block under the arch, a row of mountain-shaped peaks along the side, deep lugs, and the tread lifting clear of the ground under the arch.

## Implementation

Catalog ID `dr-martens-cow-slide-v1` (slot `shoes`), built by `makePlatformSlide()` in `src/doll/model.js` from the `build` spec in its catalog entry.

- **Height.** This follows the user's rule: she stays on the floor and taller soles raise her. The footbed (0.138 in outfit units) sits 0.028 above where her foot normally stands, so `makeOutfit()` raises everything she wears except the shoes by that much, and the new `fitDoll()` raises her body to match. The view calls `fitDoll()` whenever the outfit changes.
- **Bare feet.** Her socks are part of the doll, so `fitDoll()` hides them under open shoes. Her bare feet belong to the slides: one smooth, toeless, skin-coloured shape each, like a felt sock-foot, built from horizontal slices (`foot.rows`). It has a rounded edge on the footbed, a soft toe that shows at the front opening, an instep, and a rounded heel curving up into a slim ankle that tucks into her leg. The first feet were tiny ovals lost in the middle of the footbed. Made fuller, they still looked lumpy from behind, because they were separate overlapping ovals. The user liked the fuller size and asked for a better shape, which led to this single surface. The instep strap moved slightly forward onto the instep so the ankle rises behind it.
- **Sole.** The plan is a rounded rectangle, narrower at the heel. The outsole has its wall recessed except for the toe and heel blocks, the ribbed block and the row of peaks. The blocks flare slightly toward the ground, with lugs cut into the bottom and the tread lifting under the arch. Above that come the grooved leather welt with yellow stitching, a leather-wrapped top layer, and the suede footbed set inside it.
- **Straps.** Each strap is a wide panel draped over her foot from one sole edge to the other, a little clear of it, running diagonally so the two cow straps cross. Black piping runs along their edges and the two cords cross over them. The instep strap is a leather panel with an extruded buckle frame and prong.
- **Cow print.** Drawn procedurally by `cowPrint()`: crisp, ragged black patches of mixed sizes on white, with a fine hair grain. It is not traced from the photos.
- **Long trousers.** The shoes report `rest()` in her raised clothes' frame. A full-length hem rests on the straps and footbed and falls to the floor beside the platform (`rest.floor`, below her clothes' own frame). `makeJeans()` now lets a hem come down below its usual floor when a shoe asks for it, and only then. Legs bow out around the straps and buckle (`rest.inside`). Cropped and ankle jeans simply end above the straps.

## Checks

- `npm test`: 41 passing. A new test checks:
  - the slide's parts;
  - that the sole stands on the floor while she and her clothes are raised by the footbed's height;
  - that her socks are hidden, her legs end inside her bare ankles, and her feet stand on the footbed;
  - that no part of her foot pokes through a strap;
  - that with loafers she is not raised and her socks show.

  The layering test now covers open shoes as well: no strap, buckle or ankle pokes through any pair of jeans, and full-length hems reach the footbed. It was confirmed to fail with the draping around the straps switched off.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the side, front three-quarter, top and back next to the photos, with every pair of jeans and full length. The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- Her feet are toy ovals without toes.
- The cow patches are procedural, and the print's scale is approximate.
- The outsole sculpting is simplified (blocks, one ribbed block, a row of peaks), and the outsole is not translucent.
- The footbed logo and the lettering on the buckle are not reproduced.
