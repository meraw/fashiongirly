# Wardrobe item: Desigual spray-paint floral mesh shirt

Authored 9 October 2026. Status: first version; approved: the user merged it, and merging means approved (their rule). The second button-down, and the first garment added to the shirt template.

## Source and reference reading

The user sent four product photos: two fronts on a model (one with her arms crossed), a front flat lay and the back on a model. The photos are not stored in the repository.

Features read from the photos:

- Fine-rib stretch mesh printed with blurred spray-paint clouds in pale pink, pink, coral, red-pink and red, with more orange on the back.
- Large cream stencilled shapes sprayed over the clouds: five-petal flowers, long leaves and round petals, with soft sprayed edges and speckled overspray.
- A point collar in the print, without contrast stitching.
- Eight pale peach buttons from the collar to the hem (counted on the flat lay). On the model the top button is open; the flat lay is fully buttoned.
- Tonal stitching on the placket and hems.
- Long, fitted sleeves to the wrist; slim and cropped at the waist. The hem dips slightly at the centre front on the model.

Colour clusters measured on the flat lay (share, colour): pale pink 30% (241, 188, 182), pink 22% (242, 160, 159), coral 19% (244, 129, 133), red-pink 15% (245, 98, 98), red 10% (246, 56, 49) and cream 4% (247, 221, 215). The back on the model has more cream and orange.

## Implementation

Catalog ID `desigual-spray-floral-mesh-shirt-v1`, built by `makeButtonShirt()` in `src/doll/shirts.js`.

**The shirt template.** The tie-dye shirt's builder became a template. Each shirt has a style setting:

- its print and fabric bump;
- its sheen;
- the colours of its stitching, stand facing and buttons;
- its button heights;
- whether the collar has topstitching;
- whether the top button is worn open (a V cut into the body, with the stitching following the V and the collar starting either side of it).

The tie-dye shirt's style keeps its earlier values. Its geometry and texture were fingerprinted before and after the change and are identical.

**This shirt:**

- **Print:** `sprayFloralData()` draws a seamless tile.
  - The clouds are warped value noise spread to the measured shares along a ramp from pale pink to red. Some clouds turn orange, and there are fine red overspray speckles.
  - Thirteen cream stencils sit on top: flowers, leaves, petals and dots, sprayed with soft, grainy edges and stray dots.
  - Two tiles go round her, so a flower is about a quarter of her front's width, as on the model.
- **Fabric:** a fine vertical rib (`fineRibData()`) as the bump, with a light pink sheen.
- **Front:** worn with the top button open. A narrow V runs down to the second button, and her neck shows through it. Seven peach buttons show, and the placket has tonal stitching.
- **Collar:** the point collar, stand included, is in the print.
- **Colours:** calibrated by measurement in renders, front and back.
  - The studio's exposure and tone mapping lift bright reds and turn them salmon. So the texture is much deeper than the photos, leans magenta, and keeps the red channel low on the deepest reds. Lowering the sheen made no difference.
  - Rendered clusters: (237, 74, 75) 10%, (249, 114, 125) 18%, (248, 157, 162) 25% and (248, 173, 175) 22%, with cream stencils. The flat lay has (246, 56, 49), (245, 98, 98), (244, 129, 133), (242, 160, 159) and (241, 188, 182).
  - The palest pink and the deepest red stay about 15–20 lighter than the photos.
- **Build time:** about 35 ms per outfit rebuild.
- **Preset:** "Spray floral shirt study", with the Stradivarius light relaxed jeans (the photos pair it with white jeans).

## Layering

As for the tie-dye shirt: it ends above the skirt's waistband, so the skirt's bow stays visible, and every waistband stays inside the body. A zipped jacket hides the sleeves and the collar (`shirt-collar*`). Under the open leather jacket, the print, the open placket and the buttons show between the fronts. It is not offered under the cardigan.

## Styling facts

Slim and cropped at the waist, with vivid pink, coral, red and orange spray-paint clouds and big cream stencilled flowers. Point collar worn open, long sheer sleeves. Warmth 1 of 4, inferred: a thin, sheer mesh, though long-sleeved. Mild to warm days, or as a layer.

## Checks

- `npm test`: 62 passing. The new test checks:
  - the parts, and seven peach buttons with none above the V;
  - no collar topstitching;
  - the V ending at the second button;
  - the print's share of deep red and of cream.

  The shared sleeve, hand, outerwear and styling tests also run on it. The tie-dye shirt's test still passes, unchanged.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, with the Stradivarius jeans, the skirt and the open leather jacket. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The print is drawn procedurally to match the photos' colours, shares and motif sizes; the stencil shapes are an interpretation.
- The hem is straight; on the model it dips slightly at the centre front.
- Not see-through, as for the tie-dye shirt.
- Her large head hides the open V and most of the collar from the front.
