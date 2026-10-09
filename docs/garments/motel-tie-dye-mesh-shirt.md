# Wardrobe item: Motel tie-dye mesh button-down shirt

Authored 8 October 2026. Status: first version; approved: the user merged it, and merging means approved (their rule). The first button-down shirt.

## Source and reference reading

The user sent six photos: the front and back on a model (shop photos), the shirt laid flat on a rug with a close-up of the collar, and the front and back of the shirt on a hanger. The photos are not stored in the repository.

Features read from the photos:

- Sheer stretch mesh printed with a warm grey-mauve tie-dye: dark brown-grey clouds bleeding into pale pinkish beige, with speckled edges. The mesh netting is visible up close, and the sleeves look sheer on the model.
- A point collar on a stand, with black topstitching just inside its edges. Black facing inside the back neck shows between the collar points.
- A front placket edged with black stitching, with seven glossy black buttons from the collar to the hem (counted on the hanger).
- Long, fitted, set-in sleeves to the wrist, with plain stitched hems.
- A black overlocked hem.
- Slim and cropped at the waist.

Measured on the hanger photos (front and back agree): from darkest to palest tenth, about (50, 38, 38), (81, 69, 68), (115, 102, 101), (155, 142, 141) and (200, 188, 186). The tones spread evenly from dark to pale, so no single colour dominates.

## Implementation

Catalog ID `motel-tie-dye-mesh-shirt-v1`, built by `makeButtonShirt()` in the new `src/doll/shirts.js`. No image asset is bundled. Since the [spray-paint floral shirt](desigual-spray-floral-shirt.md), `makeButtonShirt()` is a template with one style per shirt; this shirt's style keeps the values below, and its geometry and texture are unchanged.

- **Print:** `tieDyeData()` draws a seamless tile of cloudy patches from wrapped, warped value noise, with speckles breaking up the patch edges. The values are then spread evenly from darkest to palest along a measured colour ramp, as in the photos. The print is mapped around her and up her body in tiles sized to her, so the patches are the same size on the body, collar and sleeves and stay round on her squat torso.
- **Mesh:** `meshNetData()` is a fine lattice of tiny holes, used as a bump map. The material has a slight sheen.
- **Body:** slim and fitted from the neck to a straight hem at her waist (1.26). It follows the polo's rows, which clear every waistband.
- **Collar:** a point collar whose fall turns over a stand and lies on her shoulders. Its front edges meet at the top button and spread to points. The stand is faced in black, which shows between the collar's front edges, and black topstitching runs just inside the collar's outer and front edges. Her large head hides most of the collar from the front, and her hair hides it from the back.
- **Front:** black stitching down both sides of the placket, from the collar to the hem, and seven glossy black buttons. It is worn buttoned, as on the hanger.
- **Sleeves:** long and fitted, like the bronze mesh top's, with the rounded shoulder cap. They end at the wrist in a stitched hem that eases over her hands (`easeOverHand()`, now exported from `model.js`).
- **Hem:** black stitching round the hem.
- **Colours:** calibrated by measurement. Averaged over front and back renders, the tenths are (65, 57, 55), (85, 75, 73), (108, 95, 93), (150, 134, 131) and (199, 188, 184), against (50, 38, 38), (81, 69, 68), (115, 102, 101), (155, 142, 141) and (200, 188, 186) in the photos. The darkest tenth stays a little light because of the studio's ambient light.
- **Build time:** about 43 ms per outfit rebuild, the same as the polo (41 ms).
- **Preset:** "Tie-dye mesh shirt study", with the Mango washed black jeans (the photos pair it with black leather trousers).

## Layering

- Skirt: the shirt ends above the skirt's waistband, so `coversWaistband` is not set and the skirt's bow stays visible.
- Bottoms: every waistband that reaches above the hem passes inside the body (tested for every bottom).
- Outerwear: a jacket worn zipped closed hides the sleeves, as for every top, and now also hides the button-down's collar. That rule in `makeOutfit` now hides any piece whose name starts with `shirt-collar` (the classic shirt's `shirt-collar` points included) or `polo-collar`. Under the open leather jacket the collar, placket and buttons show between the fronts.
- Under the cardigan: the shirt is not offered as a top worn under another, pending a visual check.

## Styling facts

Slim and cropped at the waist, a cloudy grey-brown, mauve and pale beige tie-dye with black buttons and topstitching, point collar buttoned, long sheer sleeves. Warmth 1 of 4, inferred: a thin, sheer mesh, though long-sleeved. Mild days, or as a layer. The composition is not visible in the photos.

## Checks

- `npm test`: 61 passing. The new test checks:
  - the parts, with seven buttons on the centre front from under the collar to near the hem;
  - both sleeves reaching her wrist, with their hem stitching;
  - the placket stitching, collar topstitching and hem stitching;
  - the print's spread from dark to pale;
  - the hem above the skirt, with the skirt's bow visible;
  - that no trouser or skirt vertex between the hem and 1.4 pokes through the body, for every bottom.

  The shared sleeve, hand, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, with the Mango black jeans, the skirt, the Marikoo windbreaker and the open leather jacket. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The mesh is not see-through. Dithered transparency was tried on the sleeves and looked like glitter. Over her body, sheer mesh would show cream felt rather than skin.
- The tie-dye is drawn procedurally to match the photos' colours and patch size; it is not the shirt's own pattern.
- It is worn buttoned to the top, as on the hanger; the model wears it open at the neck.
- The seven-button count is read from the hanger photo.
- The sleeve seam down the back of the arm is not drawn.
