# Wardrobe item: Mango pink halftone dot shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The third button-down, and the first relaxed, hip-length shirt on the shirt template.

## Source and reference reading

The user sent five product photos without a description: a front flat lay, a close-up of the collar, the back on a model, and two fronts on models (one worn open low over shorts, one over white wide-leg jeans). The photos are not stored in the repository. The neck label reads “MNG” (Mango).

Features read from the photos:

- A relaxed, straight, long-sleeved shirt in a fine crepe (the close-up shows a pebbled surface).
- **The print:** soft pink dots on cream, on a square lattice, in blocks of two kinds set in an uneven checker.
  - In a pink block the dots are big pink circles that touch, leaving small cream four-point stars between them.
  - A cream block is the reverse: touching cream circles with small pink stars.
  - About 22 dots across the front of the flat lay, in blocks of 4 to 5 dots.
- A point collar with the collar and stand in the print, and one button at the collar.
- A concealed placket: no buttons show down the front, only a line of stitching beside the closed edge.
- Long relaxed sleeves gathered into buttoned cuffs.
- Hip length, with a curved shirt-tail hem that dips at the centre front and back. Worn untucked and open at the neck on the models.

Colours, measured:

- Collar close-up (well lit, sharp): pink about (210, 166, 152), cream about (238, 226, 216).
- Whole-garment averages: flat lay (232, 209, 200); front model photo (237, 214, 203).

## Implementation

Catalog ID `mango-halftone-dot-shirt-v1`, built by `makeButtonShirt()` in `src/doll/shirts.js`.

**New shirt template options.** All are optional; the other shirts don't use them. A fingerprint of every vertex and texture of every top is identical before and after the change.

- `rows`: the body's shape. This shirt uses relaxed rows: wider from the chest down, easing out over the hips like the lilac top.
- `tucked`: the body's shape over the skirt. This shirt is tucked in there: it narrows below 1.4 and ends inside the skirt's waistband.
- `shirttail`: a curved hem. Below 1.24 each column of the body is spread down to the hem's height at its angle: 1.03 at the centre front and back, 1.10 at the side seams. The hem stitching follows the curve.
- `concealed`: a fly-front placket. The stitching follows both sides of the open V, then a single line runs down the wearer's left of the closed edge, beside a fine fold line (`placket-edge`). No buttons show.
- `sleeve`: the sleeve's rows. This shirt has relaxed sleeves, a little wider than the fitted ones.
- Cuffs: this shirt uses the mountain landscape shirt's `cuff` (from main): a band in the print over the end of the sleeve, seamed at its top, with a button on the outer side. This branch first added its own `cuff` (a plain band below a shorter sleeve, stitched along both edges, no button). When the mountain shirt reached main with a different `cuff` under the same name, the user chose to keep only the mountain shirt's. The Mango sleeves now run to the wrist, as the template's do, under that cuff.
- `depth`: spaces the print by distance round her body rather than by angle. Spaced by angle, round dots were about a fifth wider than tall across her front, where her oval body is widest.

**Layering.** The catalog has a new `layering.tucksIntoSkirt` flag. A waist-covering top with it lets the skirt's bow show, because it is tucked in over the skirt. `makeOutfit()` passes the skirt to `makeButtonShirt()`.

**This shirt:**

- **Print:** `dotPatchData()` draws a seamless tile of 16 × 16 dots (32 pixels each).
  - Each dot fills its cell to the edges, so the gaps are four-point stars.
  - A pink block shows the dots in pink; a cream block shows them in cream.
  - The blocks are set out row by row: four rows of 4 dots, with blocks 3 to 5 dots wide, each row shifted along. The kinds alternate along each row.
  - Two tiles go round her body and one round each sleeve, so about 16 dots cross her front. The real shirt has about 22; larger dots stay visible on a phone.
- **Fabric:** a fine crepe bump (`crepeData()`), matte, with a little warm sheen.
- **Front:** worn with the top button open, a narrow V down to 1.8, as on the models.
- **Colours:** calibrated in studio renders. The collar close-up is partly in shade, so the shirt's overall average was matched to the flat lay's, keeping the pink and cream as far apart as the close-up allows.
  - The texture is much deeper than the photos, because the studio's exposure and tone mapping lift these soft colours strongly.
  - Rendered: pink (220, 185, 170), cream (240, 231, 223), average (230, 207, 195) against the flat lay's (232, 209, 200).
- **Preset:** “Halftone dot shirt study”, over the pale stone Urban Classics pleated trousers with the cream New Balance 550s. The photos pair it with cream shorts and white wide-leg jeans.

## Layering

- **Over trousers:** it hangs over every waistband. Its lower body is shaped to clear every pair of trousers from the hem up: about 0.33 wide at the sides and 0.24 deep at front and back, in outfit units.
  - The shared waistband test (`tests/bottoms.test.js`) used to check from the top's lowest point. It now checks from the hem's height at each angle round her, so a curved hem is checked only where it reaches. Every other top hems level, so their checks are unchanged.
- **Over the skirt:** tucked in, ending inside its waistband, with the bow showing.
- **Under outerwear:** the shirt stays inside every jacket from the jacket's hem up. The lower rows were narrowed so that the Marikoo windbreaker's hem band covers it. A zipped jacket hides the sleeves and collar as for the other shirts.
- **Not offered:** under the cardigan, or with the striped shirt and knit layers.

## Styling facts

Relaxed and straight, hip length with a curved hem, in soft pink and cream halftone dots in a patchwork checker. Point collar worn open, long cuffed sleeves. Warmth 1 of 4, inferred: a light, thin crepe, though long-sleeved. Mild to warm days, or as a light layer.

## Checks

- `npm test`: 92 passing.
  - The new test checks:
    - the parts: no buttons down the front, three placket stitch lines, buttoned cuffs reaching the wrist;
    - the shirt-tail hem, lower at the centre than at the sides;
    - the print: pink about half, with every dot's centre and corners in opposite colours and both block kinds present;
    - over the skirt, the tucked hem and the visible bow.
  - The shared sleeve, hand, waistband, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, over the pleated trousers and tucked into the skirt. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The print is redrawn in code as a regular lattice; the real blocks vary more in size and shape.
- The dots are larger than on the shirt (about 16 across her front instead of about 22), to stay visible on a phone.
- The dropped shoulder seam is not modelled. As on the other shirts, the top of the far sleeve opens slightly at the shoulder in a three-quarter view (the shirt template's sleeve cap).
- Worn open at the top; the flat lay is buttoned to the collar.
- Tucked into the skirt rather than worn loose over it.
