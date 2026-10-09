# Wardrobe item: ONLY Carmakoma taupe coat

Authored 9 October 2026. Status: first version, awaiting visual review. The first tailored coat. It adds the `tailored-coat` template (`src/doll/tailored-coat.js`).

## Source and reference reading

The user sent five product photos: front flat (buttoned), front on a model (open), a close-up of the lapels and buttons, the back, and full length on the model. They said their coat has **only one button**. No link was fetched, and the photos are not stored in the repository.

Features read from the photos:

- A taupe brown melange in felted, wool-look double-face fabric.
- A notched lapel collar.
- Single-breasted with two buttons in the product. The user's has one, assumed to be the top one, at the lapel break.
- Clean raw edges everywhere, as on double-face wool: the fronts, the lapels, the collar, the pockets, the hem and the sleeve ends.
- Slanted welt pockets at the hip.
- Long plain sleeves and a centre-back seam.
- Straight and slightly oversized, ending just above the knee.

Measured colour: about RGB 139, 123, 111 in plain areas, the same in all four photos to within a few points.

## How the user wears it

Not stated beyond the button. Their rule for outerwear applies: buttoned in real life, or not worn. So it starts **buttoned**, with its one button. Like every jacket, it can be shown open on the doll.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:**
  - Palette: taupe melange, plain.
  - Shape: a straight single-breasted coat with notched lapels, just above the knee.
  - Coverage: her torso, hips and thighs, and her arms to the wrist, with a V at the neck.
  - Material: felted wool-look double-face.
- **From the user:** one button; worn buttoned in real life (their rule).
- **Inferred:** warm (thick felted fabric, unlined), for cool to cold dry days; not for rain.
- **Unknown:** fibre composition, which button is left, and the exact length on the user.

## Implementation

Catalog ID `only-carmakoma-taupe-wool-coat-v1` (slot `outerwear`), built by `makeTailoredCoat()` in `src/doll/tailored-coat.js`. The template reuses the shared jacket body, easing and open shift from `src/doll/outerwear.js`, as the fur jacket does, so other coats can use it with their own spec.

- **Body.** A straight body from the neck to just above her knee (hem 0.74, outfit units), with soft folds from the hips down. It has its own wider rows over the skirt.
- **The V and the lapels.** The fronts meet below the button and part above it in a V up to the neck. This uses a new option on the shared jacket body: `open` can vary with height. Each lapel folds back from the V's edge and lies on the front, widening from the break to the notch. A collar folds over round the back of her neck. Her head hides most of the collar.
- **One button** at the lapel break, a dark horn button on her left front, with a buttonhole in her right front.
- **Pockets.** Slanted welts low on each front, each with a raw edge and the opening's shadow.
- **Raw edges.** A fine, slightly lighter line along the hem, both fronts, the lapels, the collar, the welts and the sleeve ends.
- **Back.** A centre-back seam, drawn as a flat ridge.
- **Sleeves.** Long, straight and plain, ending at her wrist in a turned hem.
- **Fabric.** A felted melange: a soft mottle with fibre flecks, matte, drawn procedurally.
- **Colour, by measurement.** The first render was too warm, about RGB 139, 116, 95. The front's plain areas now render at about 140, 124, 111.
- **Shown open.** The fronts hang apart down to the hem, with the button on her left front. The coat eases out over what is under it, like the other jackets.
- **Preset.** “Taupe coat study”: the coat over the grey chenille high-neck jumper, with the Levi's and the UGG cream sneakers. The Converse high-tops took that outfit over the scene's triangle budget.

### Shared changes (additive)

- **`jacketBody()` in `src/doll/outerwear.js`.** `open` may now be a function of height. With a number, it behaves as before, and all six existing jackets are unchanged: their fingerprints match `main`'s. `openShift` is now exported too.
- **One dispatch line in `makeOuterwear()`** for the `tailored-coat` template.
- **`tests/outerwear-coverage.js`.** A coat with a V neckline (`userData.neckline`) is checked like an open jacket: what lies between its fronts is meant to show. No existing jacket sets this.
- **The dress-under-outerwear test in `tests/doll.test.js`.** The same exception: between the coat's lapels, the dress's collar shows.

## Checks

- `npm test`: 92 passing after merging `main`, including the new `tests/tailored-coat.test.js`. It checks:
  - the parts, and the parts it leaves out
  - the raw edges
  - the one button at the break, at centre front
  - the V above the button and the fronts meeting below it
  - knee length, and the matte melange
  - the study
  - shown open: nothing spans the opening, and the button stays on her left front
- The shared outerwear tests run it buttoned and open over every top, bottom and the skirt, and check her hands stay inside the sleeves.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back, and open.

## Known differences

- The lapel's reverse face shows as a darker strip along the V, like a lapel's underside in shadow.
- The collar round her neck is mostly hidden by her head.
- The two-button product is built with the user's one button.
