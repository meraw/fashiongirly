# Wardrobe items: white and lapis blue linen button-down shirts

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The first linen tops, and the first garments made from a description alone.

## Source

The user asked: "Please make two linen button down shirts: one white and one lapis blue." There were no photos and no further description, so nothing here is read from the user's own shirts.

The cut is a classic relaxed linen shirt. The user asked for the buttons to be closed on the last two shirts, so these are worn buttoned to the top. If the user's shirts differ (a band collar, no pocket, a cropped or boxy cut, sleeves worn rolled, a top button open), the style can change to match.

## Implementation

Two catalog entries, both slot `top`, built by `makeButtonShirt()` in `src/doll/shirts.js`:

- `white-linen-button-down-shirt-v1`
- `lapis-blue-linen-button-down-shirt-v1`

Both shirts share one style function, `linenShirt()`, which takes the colour, the slubs' tone, a seed, and the stitching and button colours.

**Shape.** It uses the template settings the Mango and plaid shirts added:

- relaxed hip-length rows, with a curved shirt tail lowest at the centre front and back;
- tucked into the skirt when she wears one;
- relaxed sleeves into buttoned cuffs;
- eight buttons from the collar stand to the hem;
- a patch chest pocket on her left;
- a back yoke seam;
- a point collar, topstitched;
- tonal stitching.

**The linen.** `linenWeave()` weaves it in code:

- a plain weave, each thread a little lighter or darker than its neighbours;
- slubs scattered along the warp and weft: thick, uneven runs of the yarn, swelling and thinning along their length;
  - on the lapis shirt they are a little lighter, where the yarn took less dye;
  - on the white shirt they are a touch greyer;
- a height map on the same tile, with the slubs standing proud;
- each colour is woven with its own seed, so the two shirts' slubs differ.

**New template option, `creases`:** `{ depth, seed }`.

- Soft wrinkles pressed into the fabric, running mostly across it, as linen creases in wear.
- The surface rises and falls by up to half `depth`.
- On the body they are deepest round the waist. They fade out toward the shoulders and the collar, and toward the hem, so the hem hangs as cut and stays inside every jacket.
- On the sleeves they are deepest at the inside of the elbow. They fade out at the shoulder and above the cuff, so the cuff fits as before.
- The noise wraps round each piece, so its back seam stays closed.

**A fix to the template: the chest pocket faced inward.** It was laid from the placket toward her side, so its faces (and normals) looked into her body. It was drawn double-sided, so it showed, but it was lit as if from inside: darker than the body, and the bump flipped.

- The pocket is now laid the other way and faces out.
- This changes the plaid flannel shirt, the only other shirt with a pocket. Its pocket was dark, and its plaid looked mirrored against the body. Now it is lit as the body is, and its plaid lines up with the body's.
- Every other shirt is identical: its geometry and texture coordinates fingerprint the same before and after.

**Colour.** Calibrated in studio renders.

| Shirt | Catalog colour | Render | Target |
| --- | --- | --- | --- |
| White | `#e4e1da` | (237, 235, 231) | A clean white, barely warm, not blown out |
| Lapis blue | `#033068` | (22, 72, 146) | Pantone Lapis Blue, about (0, 75, 141) |

- The lapis is set much darker than it renders, because the studio lifts it.
- **Buttons:** pearly white on the white shirt, tonal blue on the lapis.

**Presets:**

- "White linen shirt study": with the Urban Classics pleated linen trousers and the cow print slides.
- "Lapis linen shirt study": with the crystal straight jeans.

## Layering

- **Over trousers:** they hang over every waistband (`coversWaistband`).
- **Over the skirt:** tucked in (`tucksIntoSkirt`), so the skirt's bow shows, with no buttons below the tucked hem.
- **Closed jacket:** it hides the sleeves, cuffs and collar.
- **Open leather jacket:** the linen, the placket and the buttons show between the fronts.

## Styling facts

- Relaxed, hip length with a curved hem; white, or lapis blue; plain linen with slubs.
- Point collar buttoned to the top, long cuffed sleeves, midriff covered.
- Linen.
- Warmth 1 of 4, inferred from a light, breathable linen shirt. Warm to mild days.

## Checks

- `npm test`: 109 passing. The new `tests/linen-shirts.test.js` checks:
  - the parts: eight buttons, the pocket and its stitching, the yoke seam, the cuffs and their buttons, and the collar topstitching;
  - that the pocket faces out from her;
  - white and lapis blue, slubby, with the slubs raised in a bump on the same tile, and the two colours woven apart;
  - the creases:
    - present round the waist;
    - none at the collar or the hem, measured against the plaid flannel, which has the same rows without creases;
  - that over the skirt they tuck in, with no button below the tucked hem.

  The shared tests also run on them: sleeves and cuffs, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back:
  - the white shirt with the linen trousers, and over the skirt;
  - the lapis shirt with the crystal jeans, and over the skirt under the open leather jacket.

  Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- Not from photos: the cut, collar, pocket, buttons and shade are a classic linen shirt, not the user's own.
- The creases are a soft, fixed pattern; real linen creases where it is worn and folded.
- The linen is not see-through, though white linen often is a little.
