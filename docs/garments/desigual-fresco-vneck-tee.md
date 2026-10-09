# Wardrobe item: Desigual fresco print V-neck tee

Authored 9 October 2026. Status: approved: the user merged it, and merging means approved (their rule). The second printed tee, and the first V-neck on the printed tee template.

## Source and reference reading

The user sent four product photos with no written description: a front flat lay, the front on a model (full length and closer) and the back on a model. The Desigual label shows in the flat lay. The photos are not stored in the repository; a processed texture made from them is (see below).

Features read from the photos:

- A fitted, short-sleeved tee in a fine stretch rib knit, ending at the waistband of high-rise trousers.
- Printed all over with a pale baroque ceiling fresco:
  - cherubs and clouds;
  - a seated figure in white robes;
  - dark rocks with a touch of teal and blue;
  - on the back, an eagle with spread wings above more figures.
  
  It is mostly cream, beige, ochre and sage, with hints of teal, blue and pink. It looks like an 18th-century Venetian ceiling fresco, long out of copyright; the painting is not identified.
- A deep, wide V-neck with a narrow bound edge. Its sides curve: steep near the neckline, flatter toward the point, which is at about underarm height.
- An exposed cream overlocked seam down the centre front, from the point of the V to the hem.
- Exposed overlocked seams from the neckline down to each underarm, front and back.
- Lettuce-edge hem and sleeve hems in cream.
- Elbow-length sleeves, slightly flared.

Measured on the flat lay: the front's median colour is about (214, 192, 168), and its tenth and ninetieth percentile brightness are 122 and 211. The V-neck's binding is a tan, about (200, 165, 120).

## Implementation

Catalog ID `desigual-fresco-rib-vneck-tee-v1` (slot `top`), template `printed-raglan-tee`, built by `makePrintedTee()` in `src/doll/printed-tee.js` from its catalog `build` spec.

**New template options.** All are optional, and the Van Gogh tee, which sets none of them, is unchanged: its geometry and texture coordinates fingerprint identical before and after.

- `vneck`: `{ bottom, half, round, binding }`.
  - A V cut into the front. It meets the neckline `half` of the way round from centre front and comes to a point at height `bottom`.
  - It is drawn in the atlas's own coordinates, so it lines up with the V in the photo the atlas came from.
  - `round` curves its sides.
  - The cut edge gets a bound neckline: a band `binding` wide lying just below the edge, and a rolled edge.
  - Her shoulder skin fills the V. This is the same skin piece the stripe jumper and the cardigan use; under clothes her body is cream felt.
- `seams.armTop`: where the seams from the neckline to the underarms start (default 0.985 of the way up).
- `seams.centreTop`: where the centre front seam starts (default 0.985).
- `seams.sides`: where the side seams sit (default both sides). This tee has none.
- `seams.band`: the back band's seam, now left out when it is not set.

`model.js` now also exports `cloth` and `SHOULDER_ROWS`, for the skin piece. That is an additive change to the export line only.

**Print atlas, from the user's photos.** `src/wardrobe/fresco-tee-atlas.js` is a 1536 × 768 WebP (about 160 KB), in the Van Gogh tee's layout. It was made during authoring, outside the app.

- **Front:** from the flat lay, unwrapped across the front between its side edges.
  - The garment lies slightly askew, so the centre line is measured (the V's point and the centre seam) and followed.
  - Vertically, the V's point is laid on the doll's V point and the V's top corners on her neckline. Below the V, the print is cropped a little at the hem: her torso is much wider for its height than the real tee, and showing the full length would squash the figures to about half their height. They are now about two thirds of it.
  - The inside of the back and the label, seen through the V in the flat lay, are replaced with print from beside the V, so they cannot show if the cut sits a little off.
- **Back:** from the back photo, projected round her back from the measured body edges. The back photo's side shading is partly divided out, and the arms and background at the sides are filled with the print beside them.
- **Sleeves:** front halves from the flat lay's sleeves, back halves from the back photo's, taken from the lower part of each sleeve. Her arms are much thicker for their length than a real arm, so a sleeve shows a short band of its print, stretched across.
- **Contrast:** raised by 1.2 about the print's mid tone, because the studio's ambient light lifts the darks.

**Shape:**

- The body follows the Van Gogh tee's rows, from the neck (1.91) to a hem at 1.19, which clear every waistband.
- The V comes to a point at 1.68, about her underarm height, as on the model. Her large head hides its upper part from the front.
- Cream overlocked seams run down the centre front from the V's point, and from the shoulders beside the neckline down to each underarm, front and back. The latter start a little below the neckline (`armTop` 0.95), so that a zipped jacket's collar covers them.
- Elbow-length sleeves with the shared rounded shoulder cap, a little longer and more flared than the Van Gogh tee's, ending at -0.205 (sleeve-local) in a lettuce edge.
- A lettuce-edge hem.

**Colour.** Calibrated by measuring renders against the photos. With `printTone` `#bdb8b3` (a slight warm tint to restore the photo's warmth), a front render's print measures:

| | Median colour | Brightness, 10th / 50th / 90th percentile |
| --- | --- | --- |
| Render, front | (215, 194, 164) | 130 / 191 / 203 |
| Flat lay | (214, 192, 168) | 122 / 191 / 211 |

The back renders about 15 lighter than the back photo, which is shaded by the model's lighting.

**Preset:** "Fresco V-neck tee study", with the Mango washed black jeans (the photos pair it with black wide trousers).

## Layering

- Waistband: it covers the waistband, like the other tops at this length.
- Sleeves: the short sleeve's fabric ends at -0.205 (`layering.bareArmBelow`), so the shared sleeve test checks her arm only above that.
- Jackets: a jacket worn zipped closed hides the sleeves, as for every top. Under the open leather jacket, the print, the centre seam and the V show between the fronts.

## Styling facts

- Fitted, high-hip length; cream, beige, ochre, sage and teal.
- An all-over baroque fresco print with cream overlocked seams.
- Deep V-neck, short sleeves to the elbow, midriff covered.
- Fine stretch rib jersey.
- Warmth 1 of 4, inferred from the thin fitted knit, short sleeves and open neckline: warm days, or a base layer under a jacket.

## Checks

- `npm test`: 82 passing. The new test checks:
  - the parts: the binding and rolled edge, her skin in the V, the centre seam, four neckline-to-underarm seams, lettuce edges, two sleeves, and no side or back band seams;
  - that the neckline stays at the neck at the back, drops to the V's point at centre front, and curves as in the flat lay, symmetrically;
  - that the body prints from its own part of the atlas;
  - that the sleeves reach the elbow and end where her arm turns bare;
  - that the centre seam runs on the centre front from the V's point to the hem;
  - that the binding reaches the V's point;
  - that it still dresses her in a flat cream if the atlas fails to load.

  The Van Gogh tee's test passes unchanged. The shared tests also run on it: sleeves and hands, every waist-covering top over every bottom, the styling facts, and every jacket over every top. That last test caught the first placement of the neckline-to-underarm seams, which showed through the zipped Marikoo windbreaker; they now start lower.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back, with the Mango black jeans, and over the skirt under the open leather jacket. The user saw them and merged it. No device check.

## Known differences

- The print comes from photos, so it is softer than the fabric, and some photographed shading remains.
- Her torso is wider and shorter than the model's, so the front shows a shorter slice of the print, and the figures are a little squatter.
- The sleeves come from small crops of the photos and are blurrier and more stretched than the body.
- The front and back come from different photos, so the print does not join at her sides. The real tee likely has plain side seams there.
- The binding is a plain tan; on the tee it is printed.
