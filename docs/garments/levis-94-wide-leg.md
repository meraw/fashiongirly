# Wardrobe item: Levi's '94 baggy wide leg

Authored 8 October 2026. Status: first interpretation, shortened on the user's note; awaiting their visual review. Fourth piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The user sent six product images, described as “Levi's 94 Wide Leg” (the waistband label reads “The Baggy Wide Leg”): a back pocket close-up, a front flat lay, front, back and side views on a model, and a full-length front. They were attached directly; no link was fetched.

Features read from the images:

- Low-to-mid rise; wide legs that fall straight and widen gently to the hem.
- Washed black faded to charcoal, with faint whiskers across the upper thighs and a visible diagonal twill.
- Raw, frayed edges on the front pocket openings; a coin pocket; belt loops; a dark metal button.
- Back: yoke, five-pocket back pockets with tonal double-arc stitching and small frayed nicks along their tops, a red tab on the wearer's right back pocket, and a tan printed patch on the waistband.

The tank top and shoes are styling.

**Length:** on the model the hem pools over the shoes. The user said “these are not that long on me”, so the doll's pair ends at the ankle, just above the loafers. The fit decision follows the user, not the product photos.

## Implementation

Catalog ID `levis-94-wide-leg-v1` (slot `bottom`), built by `makeJeans()` from its `build` spec, with the sewn crotch construction (`crotch: { top: 1.18, y: .95 }`).

- New template options added for this pair: `backPocket.arcuate` (double-needle wing stitching), `backPocket.tab` (a woven tab on one pocket), `backPocket.nicks` (worn nicks on the pocket tops), `frontPocket.fray` (raw-edged pocket openings) and `labelPatch.printColour` (a printed border on the patch, with no lettering or logo). Hem type `ankle` is a plain hem with no shoe-resting adjustment.
- Denim: a swatch from the flat lay (the left leg below the knee, inside its seams), processed like the other jeans' swatches; 256 × 640 WebP in `src/wardrobe/levis-94-denim.js`.
- Colour: the images disagree because their lighting differs: plain denim measures RGB 57, 53, 54 in the flat lay, about 38, 33, 37 in the model shots and 75 to 90 in the brightly lit close-up. The target is between the flat lay and the model shots, about 50, 46, 48. The first render was 54, 47, 46 (slightly warm); with a cooler swatch the front render measures 49, 45, 47.
- Stitching is tonal dark grey. A first pass used a paler grey that read as white piping, and fray and nicks that read as a white dotted line; both were toned down. The arc stitching is darker than the denim, as in the close-up.

## Checks

- `npm test`: 22 passing. A new test checks the back-pocket details (one tab only), that the hem clears the loafers but reaches the ankle, that the legs widen toward the hem, and that the two legs never cross. The layering test covers this pair under every waist-covering top automatically.
- `npm run build` succeeds.
- Rendered in headless Chromium from four angles with the crochet top and without a top; compared side by side with the flat lay and back photos. The user has not yet seen it.

## Known differences

- Shorter than in the product photos, at the user's request.
- The patch and tab carry no lettering or logo.
- Whiskers and the thigh fade are subtle compared with the flat lay.
