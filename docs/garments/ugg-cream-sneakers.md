# Wardrobe item: UGG cream platform sneakers

Authored 8 October 2026. Status: first interpretation; approved: the user merged it, and merging means approved (their rule). Third pair of shoes from the user's wardrobe list, added by the shoes lane.

## Source and reference reading

The user sent five phone screenshots of a shop gallery (images 1, 2, 3, 4 and 6 of 6): outer side, front three-quarter pair, back pair, top pair and a toe close-up. No product name was given. The insole and tongue read UGG, and the style resembles the UGG Lowmel.

Features read from the images:

- A low-cut, chunky skate-style sneaker, all in cream.
- A cream mesh base, showing at the toe box and as a band round the heel collar.
- Cream suede overlays with tonal stitching: a band all round above the sole, the side quarters, the heel counter and the eyestays.
- Big round eyelets, four a side.
- Very wide, puffy flat laces in cream with a beige-brown diamond zigzag, tied in a large floppy bow with long tails.
- A thick padded tongue with a debossed UGG label, a padded collar, and a cream webbing pull loop at the heel.
- A smooth cream platform sole with a rounded top edge and small lugs round the bottom.

## Implementation

Catalog ID `ugg-lowmel-cream-v1` (slot `shoes`), template `sneaker`. It is built by the same slice-based laced-shoe builder as the Buffalo boots (`makeLugBoot()` in `src/doll/model.js`), whose boot-only parts (quilting, logo tapes, webbing loops, side window) are now optional. The boots render pixel-identical to before.

- **Proportions** are measured from the side photo: the shoe is about 3.5 times as long as the heel is high; the sole is about an eighth of the length; the collar sits below her ankle; the toe box is high and rounded.
- **Upper.** A mesh base (`meshKnit()` pores as a bump map) with suede overlay panels from the catalog (`panels`): a band all round above the sole, taller at the toe; the heel counter; and the side quarters up to the eyestays. Each panel has tonal stitching, and suede eyestays run beside the lacing. A padded collar edge, a padded tongue with a plain debossed label, and a webbing pull loop complete the upper.
- **Laces.** Soft flat laces (`flatLace()`, an elliptical tube) with a redrawn diamond zigzag (`laceTexture()`). They cross between four big eyelets a side, arching up off the tongue. The large bow has loops lying out to the sides and long tails hanging down over them, with aglets.
- **Sole.** The plain-sole option is new for this pair: small lugs round the bottom, a smooth, slightly rounded sidewall and a rounded top edge.
- **Colours.** Measured in the side and top photos and in renders, then adjusted: suede about 228, 221, 202 in the photo; the suede band a little darker; the sole 217, 202, 175; the mesh about 225, 220, 203. The side render now matches within about 15 levels. Top-lit surfaces still render a little lighter than the top photo.
- **Her socks.** A low shoe would show her round doll socks bulging over the collar. So, like the slides bringing her bare feet, these sneakers bring her own slim ankle socks (`sock` in the spec): a knit tube from inside the shoe up into her leg, with a turned cuff, centred on her leg. `fitDoll()` hides the doll's socks when an outfit reports `ownSocks`.
- **Height.** The sole is within her normal foot height, so she is not raised.
- **Layering.** Long jeans rest on the shoe and drape around the laces and bow (`drapeClear`). Shorter hems sit on the collar (`collarRest`), lifted at the heel over the pull loop. These are shoe-side settings; no jeans code changed for this pair.

## Revision after the user's first review

The user found the soles convincing but the ankle far too loose: her leg came out of a wide opening and looked tiny. The shaft now narrows above the instep and curves in round the ankle (the upper's top rows are narrower and the back comes forward), as a padded sneaker collar does. The ankle sock is fuller and a little taller, with a turned cuff, centred on her leg rather than the shoe, so it meets her leg where the leg is wider.

## Checks

- `npm test`: 57 passing. A new test checks:
  - the sneaker's parts, and that the boot-only parts are absent;
  - the eyelet count;
  - that the collar sits well below her sock tops and she is not raised;
  - that the doll's socks are hidden, her legs stay inside the ankle socks, and the ankle socks stay inside the shoe.

  The layering test covers the sneakers with every pair of jeans.
- `npm run build` succeeds.
- Loafers, boots (with and without long and ankle jeans) and slides render pixel-identical to `main` after the template change.
- Rendered in headless Chromium (software WebGL) from the side, front three-quarter, top and back next to the photos, with six pairs of jeans and on her full figure. The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The shoe is a little less puffy and chunky than in the photos, and the mesh and suede look more alike than they do there.
- The curved suede piece beside the toe mesh is not modelled.
- The tongue label and the side and insole logos carry no lettering. The lace pattern is redrawn.
