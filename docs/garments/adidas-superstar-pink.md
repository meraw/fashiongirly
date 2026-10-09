# Wardrobe item: adidas Superstar pink suede sneakers

Authored 9 October 2026. Status: first version, awaiting visual review. Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent four product photos without a description: front three-quarter, outer side, back three-quarter and top. The insole reads adidas; the shell toe and three stripes are the Superstar. The photos are not stored in the repository.

Features read from the photos:

- A low-top Superstar in one pink throughout.
- Suede upper.
- A ridged rubber shell toe in the same pink, with a soft, satiny sheen.
- Three slanted suede stripes on each side, leaning toward the toe. Each is edged with stitching and pierced with small holes.
- Stitched eyestays, a heel counter overlay and a panel seam on each side.
- Wide flat pink laces through punched eyelets. The product photos show no bow.
- A padded collar lined in a deeper, smooth pink. The suede tongue stands above the lacing, with a debossed label.
- A pink rubber cupsole with a pebbled sidewall and moulded lines, higher at the heel than at the toe.

Measured colours (outer side photo): suede about RGB 202, 134, 150 to 216, 142, 159; sole about 206, 135, 153; shell toe about 239, 184, 198 (lifted by its sheen); collar lining about 233, 157, 170.

## Implementation

Catalog ID `adidas-superstar-pink-suede-v1` (slot `shoes`). It is built by the existing lug-boot template (`makeLugBoot()` in `src/doll/model.js`, template `sneaker`) from the `build` spec in its catalog entry.

**Template changes (additive).** New spec options, each off unless a spec sets it:

- `shellToe`: a rubber cap over the toe, from the sole up to a back edge. The edge crosses the top of the toe at height `top` and runs forward down each side (`edge`, [y, z] from the top down). Its ribs fan out toward the toe from a point behind it (`pivot`, `ridges`). It stands off the upper along the surface normal, so it also clears the nearly level top of the toe. Its back edge stands a little proud.
- `stripes`: slanted suede bands on both sides. Each starts just above the sole and runs up until it meets the eyestay beside the lacing, or comes near the collar. Each is edged with stitching and pierced with a row of holes. Set by `count`, `from`, `width`, `gap`, `slant`, `inset`, `endGap` and `holes`.
- `soleLines`: thin lines moulded round the sole, either `down` from its top edge or `at` a height above the ground.
- `punched`: matte punched eyelets instead of metal rings.
- `tongueAbove`: how far the tongue stands above the collar. Defaults to the old 0.02.
- `sole.heelRamp`: how gradually the sole rises to the heel. Defaults to the old 0.03 step.

The shell toe and stripes face the same way as the upper (`likeUpper`), so they shade alike under the studio's shadows. Without this, the stripes came out lighter than the suede around them.

The Buffalo boots, the UGG sneakers and the zip boots render pixel-identical to `main` before and after the change, as do the slides, the Blaire sandals and the loafers. Each was checked from the front and the side, with cropped and with long jeans.

**Shape.**
- **Proportions:** measured on the side photo: a long, low toe with a flat top, lacing sloping up to the collar, and a collar that dips over the ankle bones.
- **Sole:** the cupsole rises from the toe to the heel.
- **Width:** wider than the real shoe, as her legs are thick.
- **Collar:** a little lower than the photo's (back 0.28 against about 0.3), and the lacing is shorter (five eyelet rows against seven). At the photo's height, the collar, tongue and top laces poked through the bottom of the built-in barrel trousers.
- **Laces:** tied in a small bow, as she would wear them.
- **Socks:** her own ankle socks, as with the UGG sneakers.
- **Height:** she is not raised.

**Lace colour.** The template's lace texture reads its colours as linear values, so they come out darker than written. The Superstar's lace colours are written pre-encoded to compensate, rather than changing the shared texture function, which would change the UGG laces.

**Preset.** “Pink Superstars study”: the Superstars with the Tommy mom jeans and the navy striped polo, so the pink stands out.

## Styling facts

- Low, slim classic sneaker; all pink.
- Plain and monochrome: tonal three stripes and shell toe.
- Suede, with a rubber shell toe and cupsole.
- The ankle is bare above a low collar; she wears ankle socks.
- Warmth 2 of 4, inferred from a closed low-top suede sneaker: dry days. Suede marks in rain and puddles.

## Checks

- New `tests/superstar.test.js` checks:
  - its parts: shell toe and its edge, stripes, stripe stitching and holes, sole lines, panel seams, eyelets, tongue and label, ankle socks
  - that it has no boot parts (quilting, heel tab, webbing loops, zip, pull loop)
  - punched, not metal, eyelets
  - that she is not raised, and her doll socks give way to the shoe's ankle socks
  - that each stripe lies on the upper and leans toward the toe
  - that the shell toe covers the toe tip and reaches the sole, never sinks into the upper, and is ribbed across the front of the toe. A flat shell fails this check.
  - that her ankle socks stay inside the shoe below the collar
- The shared shoe test (every bottom with every shoe) runs on it. It caught the collar, tongue and laces poking through the built-in barrel trousers, so the collar was lowered.
- `npm test`: 75 passing after merging `main` (which added the Urban Classics pleated linen trousers and the Red Bull Racing windbreaker); `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, in close-up and in the study outfit, and under the long Levi's and Stradivarius jeans. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- On her thick doll legs, the shoe is wider than the real one.
- The collar sits a little lower and the lacing is shorter than in the photos.
- The tongue label, the insole and the heel carry no lettering or trefoil.
- The inner side isn't shown in the photos, so it is built like the outer side.
