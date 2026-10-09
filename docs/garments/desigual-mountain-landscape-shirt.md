# Wardrobe item: Desigual mountain landscape mesh shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The third button-down on the shirt template, and the first printed from the photos rather than drawn.

## Source and reference reading

The user sent five product photos with no written description:

- a front flat lay;
- the front on a model, twice (once closer and turned);
- the back on a model;
- a close-up of the front.

The Desigual label shows in the flat lay. The photos are not stored in the repository; a processed texture made from them is (see below).

Features read from the photos:

- Sheer, fine stretch mesh; the netting shows in the close-up.
- Printed all over with a painted mountain landscape at sunset:
  - a peach, pink and lilac sky;
  - ochre and rust mountains with lilac-white snow;
  - dark brown slopes with cream flecks lower down.
  
  On the back, one large snowy peak fills the middle.
- A point collar in the print.
- Eight glossy black buttons: one on the collar stand and seven down the placket, counted on the flat lay. On the model the top two are open.
- Gathers either side of the placket below the bust, between the third and fifth buttons.
- Long, fitted sleeves with buttoned cuffs, a black button on each.
- Tonal stitching.
- Slim and fitted, to the high hip.

Measured median colours:

| Photo | Area | Median colour |
| --- | --- | --- |
| Flat lay | Front body | (187, 122, 91) |
| Back photo | Back | (180, 124, 94) |

## Implementation

Catalog ID `desigual-mountain-landscape-mesh-shirt-v1` (slot `top`), built by `makeButtonShirt()` in `src/doll/shirts.js`, with its own style in that file. `makeOutfit()` now passes each shirt its atlas, if it has one; that is a change to its dispatch line only.

**New template options.** All are optional. The tie-dye and spray floral shirts set none of them, and their geometry and texture coordinates fingerprint identical before and after the change.

- `atlas`: `{ tone, fallback }`. The print comes from a texture atlas made from the product photos, in the printed tees' layout:
  - the body unwrapped in the top three quarters;
  - the sleeves in the bottom quarter;
  - the collar and cuffs taking the print by their angle round her (or round the arm).
  
  `tone` tones the print down for the studio's lights. `fallback` is a flat colour if the atlas fails to load.
- `hem`: a longer hem. This shirt ends at 1.19 on the printed tees' lower rows, which clear every waistband, and the hem stitching follows it.
- `ruche`: `{ from, to, reach, depth, folds }`. Gathers either side of the placket: folds fanning out from it, deepest at the placket and fading toward her sides and at the top and bottom of the gathered band. The body's rows are doubled so the folds have rows enough.
- `cuff`: `{ from, to, button }`. A buttoned cuff over the sleeve's end, eased over her hand like the sleeve, with a seam at its top and a button on the outer side. It belongs to the sleeve's group, so it hides with the sleeve under a closed jacket.
- `skin`: her shoulder skin piece, the one the fresco tee, stripe jumper and cardigan use, fills a deep open V. Her body under clothes is cream felt.

**Print atlas, from the user's photos.** `src/wardrobe/mountain-shirt-atlas.js` is a 1536 × 768 WebP (about 155 KB). It was made during authoring, outside the app.

- **Front:** from the flat lay, unwrapped across the front between its side edges.
  - Her torso is much wider for its height than the real shirt, so the length is cropped and compressed.
  - The plain sky over the shoulders is compressed most.
  - The mountains keep about 0.6 of their height.
  - The darkest slopes at the hem are left out.
  - The photographed buttons are painted out, since the doll has her own, and the photographed gathers stay in the print, over the modelled ones.
- **Back:** from the back photo, projected round her back from body edges measured at each height. Her waist narrows on the left, where a gap opens between her arm and body.
  - Her braids over the upper back and the background are filled with the shirt beside them.
  - The side shading is partly divided out.
- **Sleeves:** front halves from the flat lay's sleeves, back halves from the back photo's.
  - Her arms are short and thick, so each sleeve's print is compressed lengthwise: pink sky at the shoulder down to dark brown at the cuff.
- **Contrast:** raised by 1.15 about the print's mid tone, because the studio's ambient light lifts the darks.

**Colour.** Calibrated by measuring renders against the photos, with `tone` `#b5ada4`:

| | Front median | Back median |
| --- | --- | --- |
| Render | (191, 131, 103) | (184, 118, 80) |
| Photo | (187, 122, 91) | (180, 124, 94) |

The two photos differ a little in warmth; averaged, the renders match them within about 5.

**Shape:**

- The cropped shirts' slim body, continued to the high hip.
- Open to the third button (a V to 1.69), as on the model; six buttons show.
- Gathers from 1.42 to 1.64.
- Long fitted sleeves to the wrist with buttoned cuffs.
- No collar topstitching; tonal stitching on the placket, hem and cuffs.
- About 70 ms per outfit rebuild, against about 90 for the spray floral shirt.

**Preset:** "Mountain mesh shirt study", with the pleated linen trousers (the photos pair it with camel pleated trousers).

## Layering

- **Waistband:** it covers the waistband (`coversWaistband`), so the skirt's bow is hidden, and every waistband stays inside it.
- **Closed jacket:** it hides the sleeves and cuffs, and the collar (`shirt-collar*`).
- **Open leather jacket:** the print, the open V and the buttons show between the fronts.
- **Cardigan:** it is not offered as a top worn under another.

## Styling facts

- Slim, high-hip length; peach, rust, ochre, dark brown and lilac; a painted mountain landscape at sunset.
- Point collar with the top two buttons open, long sheer sleeves with buttoned cuffs, midriff covered.
- Fine stretch mesh, composition unknown.
- Warmth 1 of 4, inferred: thin, sheer mesh, though long-sleeved. Mild days, or as a layer.

## Checks

- `npm test`: 85 passing. The new test checks:
  - the parts, including a cuff, cuff seam and cuff button per sleeve, her skin in the V, and no collar topstitching;
  - six black buttons, none above the V, and the V's point at 1.69;
  - the hem at 1.19, covering the waistband;
  - that the body and each sleeve print from their own part of the atlas;
  - that the front ripples in the gathered band and is smooth below it;
  - each cuff button on the outer side;
  - the flat rust fallback;
  - that the tie-dye and spray floral shirts gain none of the new parts.

  The shared tests also run on it: sleeves over her arms, cuffs and sleeve ends over her hands, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back, with the linen trousers, and over the skirt under the open leather jacket. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The print comes from photos, so it is softer than the fabric, and some photographed shading remains.
- The mountains are lower than on the shirt, and the front shows a shorter slice of the landscape.
- The sleeves are compressed lengthwise.
- The collar is a plain peach from the print; on the shirt it is mottled rust and mauve.
- The front and back come from different photos, so the print does not join at her sides.
- Not see-through, as for the other mesh shirts.
- Worn with the bottom button done up; on the model it is open at the hem too.
