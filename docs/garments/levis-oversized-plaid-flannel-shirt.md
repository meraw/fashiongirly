# Wardrobe item: Levi's oversized plaid flannel shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The first plaid.

## Source and reference reading

The user sent five product photos with no written description:

- the front on a model, and closer;
- the back on a model;
- a front flat lay;
- the model seated.

The Levi's label shows inside the neck in the flat lay. The photos are not stored in the repository.

Features read from the photos:

- Soft brushed cotton flannel in a large plaid. The ground is navy-black, crossed by bands of grey, light grey and white stripes, with a coral red line in each band. The stripes are woven in a twill, so where a stripe crosses the ground the two colours hatch together.
- The warp (stripes running down) and weft (stripes running across) differ: the vertical bands are wider and more broken up than the horizontal ones.
- Oversized and relaxed, with dropped shoulders. Hip length, with a curved shirt tail, lowest at the centre front and back.
- A point collar in the plaid.
- Eight pale grey buttons: one on the collar stand and seven down the placket, counted on the flat lay. On the model it is buttoned to the top.
- A patch chest pocket on her left, set between two of the horizontal bands.
- A back yoke.
- Long sleeves with buttoned cuffs.
- A small tonal embroidered mark on the lower left front.

**Plaid colours measured on the flat lay.** Five clusters:

| Colour | Measured | Share |
| --- | --- | --- |
| Ground | (20, 19, 26) | 53% |
| Grey | (96, 97, 103) | 12% |
| Light grey | (146, 139, 144) | 11% |
| White | (226, 216, 218) | 10% |
| Coral red | about (150 to 175, 67, 69) | a few percent |

**Stripe widths.** Read from colour profiles across the flat lay, in units of one repeat (180 units, about a sixth of the shirt's length):

- **Warp (running down):** ground 60, grey 4, light 8, grey 3, ground 12, white 6, ground 6, red 4, ground 3, grey 6, ground 5, light 6, ground 56.
- **Weft (running across):** ground 60, grey 10, ground 3, light 4, white 8, red 5, ground 4, grey 10, ground 76.

## Implementation

Catalog ID `levis-oversized-plaid-flannel-shirt-v1` (slot `top`), built by `makeButtonShirt()` in `src/doll/shirts.js`, with its own style in that file.

**The plaid.** `plaidData()` weaves it in code from the stripe widths above:

- warp and weft threads are interlaced in a 2/2 twill, as the cloth is, so crossing stripes hatch together;
- `flannelData()` gives a soft twill bump under a fuzzy nap;
- the check repeats six times round her body and every 0.26 in height, so the checks are a little squatter than on the shirt, to suit her proportions;
- three times round each sleeve and cuff, and three times along the collar.

**Shape.** It uses the settings the Mango dot shirt added to the template:

- relaxed hip-length rows, with a shirt tail lowest at the centre front and back;
- tucked into the skirt when she wears one;
- relaxed sleeves into buttoned cuffs, each with a pale grey button.

It is buttoned to the top as on the model: eight pale grey buttons from just under the collar to near the hem. The collar has no topstitching; the stitching is tonal.

**New template options.** All are optional, and the shirts that don't set them are unchanged (their geometry and texture coordinates fingerprint identical before and after):

- `sleeveAround`: how many times the print repeats round a sleeve and cuff (default once, as before).
- `pocket`: `{ x, y }`, a patch pocket on her left chest. It lies on the body in the same print, laid as on the body under it, with stitching round its sides and bottom and a hem stitch below its top edge.
- `backYoke`: the height of a back yoke seam, laid across her back. (The pink yoke shirt's `yoke` is a different setting: a yoke front and back with gathers below it.)

**A fix to the template.** The template caches where it finds the shirt's surface, to place its buttons and stitching. Its key didn't tell a tucked body from an untucked one, so a shirt built untucked and then tucked into the skirt placed its lowest buttons where the untucked hem had been, floating on the skirt. The key now includes whether the shirt is tucked. Of the existing shirts, two tuck into the skirt:

- the Mango dot shirt shows no buttons, and its stitching is unchanged;
- the pink yoke shirt, added at the same time on `main`, had the same problem: put on the skirt after wearing it untucked, and its two lowest buttons (1.21 and 1.10) floated on the skirt below its tucked hem (1.26). The fix removes them.

Untucked, every shirt builds exactly as before.

**Colour.** Calibrated by measuring renders against the flat lay. The ground's share is right: 0.55 in renders against 0.55 measured.

| Colour | Render | Flat lay |
| --- | --- | --- |
| Ground | (30, 29, 31) | (20, 19, 26) |
| White | (215, 208, 206) | (226, 216, 218) |
| Coral red | (191, 58, 58) | (149, 67, 69), its median mixed with hatching |

The ground stays a little lighter than measured: the studio's ambient light lifts even a near-black.

**Build time:** about 55 ms per outfit rebuild.

**Preset:** "Plaid flannel study", with the Tommy mom jeans (the photos pair it with dark blue jeans).

## Layering

- **Over trousers:** it hangs over every waistband (`coversWaistband`).
- **Over the skirt:** it is tucked in (`tucksIntoSkirt`), so the skirt's bow shows, and no buttons show below its tucked hem.
- **Closed jacket:** it hides the sleeves, cuffs and collar.
- **Open leather jacket:** the plaid, the placket and the buttons show between the fronts.

## Styling facts

- Oversized and relaxed, hip length with a curved hem; navy-black with grey, white and coral red; a large plaid.
- Point collar buttoned to the top, long cuffed sleeves, midriff covered.
- Brushed cotton flannel.
- Warmth 2 of 4, inferred from a long-sleeved brushed flannel. Cool to mild days, or as a light layer.

## Checks

- `npm test`: 98 passing. The new `tests/plaid-flannel.test.js` checks:
  - the parts, including the pocket and its stitching, the yoke seam, the cuffs and their buttons, and eight buttons;
  - pale grey buttons from the collar to the hem;
  - the plaid's ground share, and that it has white and red stripes;
  - the pocket on her left chest, in the same print as the body;
  - the yoke seam on her back;
  - the shirt tail;
  - that over the skirt it is tucked in, with no button below its tucked hem;
  - that the tie-dye and Mango shirts gain no pocket or yoke.

  The shared tests also run on it: sleeves and cuffs, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back, with the mom jeans, and tucked into the skirt under the open leather jacket. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The plaid is woven in code from measurements, not copied. Its stripes are crisper than the brushed flannel's, and the hatching only shows up close.
- The checks are a little squatter than on the shirt.
- The plaid is not matched across the placket, pocket and seams as carefully as on the shirt.
- The dropped shoulders and the tonal embroidered mark are not modelled.
- Her hair hides the back yoke seam from behind.
