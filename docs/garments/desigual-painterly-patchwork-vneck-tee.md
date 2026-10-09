# Wardrobe item: Desigual painterly patchwork V-neck tee

Authored 9 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved, without a separate pull request afterwards. The third tee on the printed raglan tee template, after the Van Gogh patchwork tee and the Desigual fresco V-neck tee. Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user sent four phone screenshots without a description:
- from a shop gallery: the front on a model, a three-quarter view on a model and a front flat lay (images 1, 3 and 4 of 4);
- from a Japanese shop (fashionwalker.com): the back on a model.

The Desigual label shows in the flat lay. The screenshots are not stored in the repository; a processed texture made from them is (see below).

Features read from the photos:

- A fitted, short-sleeved tee in a fine stretch rib knit, ending at the waistband of high-rise bottoms.
- It is pieced from panels, each printed with a section of an impressionist-looking painting:
  - **Front:** pale clouds in cream, grey and sky blue on her right; big yellow and orange-red flowers (chrysanthemums or dahlias) with white flowers and green leaves on her left. A centre seam joins them, from the point of the V to the hem.
  - **Back:** pale clouds above a band of red and yellow flowers across the lower back, about a third of its length.
  - **Raglan sleeves:** her right sleeve red flowers, her left sleeve clouds.
- A deep V-neck, its sides curving into a point at about underarm height, with a binding printed in orange.
- Every seam is exposed and overlocked in rust orange, slightly wavy: the raglan seams, the centre front, the side seams and the back band's seam.
- Short raglan sleeves ending high on the upper arm, slightly flared, and the hem, all finished in rust-orange lettuce edges.

The paintings are not identified.

Measured on the flat lay:
- the front's median colour is about RGB 206, 182, 151, with tenth, fiftieth and ninetieth percentile brightness 85, 176 and 208;
- the overlocking about 184, 113, 81;
- the binding about 182, 108, 72.

## Implementation

Its catalog entry, study preset and atlas reference are in their own file, `src/wardrobe/garments/desigual-painterly-patchwork-vneck-tee-v1.js`, with one line in `src/wardrobe/garments/index.js` (written by `node scripts/garment-index.mjs`). It is built by `makePrintedTee()` in `src/doll/printed-tee.js`, with its V-neck, side seams and back band seam. No template changes.

**Print atlas, from the user's photos.** `src/wardrobe/painterly-tee-atlas.js` is a 1536 × 768 WebP (about 155 KB), in the template's layout. It was made during authoring, outside the app.

- **Front:** from the flat lay, unwrapped across each front panel between the centre line and that side's edge.
  - The tee lies slightly askew, so the centre line is measured (the V's sides and the centre seam) and followed.
  - The V's inner edges were measured row by row. In the V's rows, each panel is mapped so that the photo's V edge lands on the doll's cut edge, so the cut follows the print's V exactly.
  - Vertically, the V's point is laid on the doll's V point and its corners on her neckline.
  - Below the V, the print is cropped a little at the hem: her torso is much wider for its height than the real tee, and showing the full length would squash the flowers to about half their height. They are now at about 0.6 of it.
- **Back:** from the back photo, projected round her back.
  - The band of flowers is taken from the band in the photo, so the doll's back band seam sits on the photo's.
  - Her hair hides the middle of the upper back, so the upper back is filled from the clouds just below her hair, at their own proportions, reflected upward where they run out.
- **Shoulders and sleeves:**
  - Above the raglan seams, the body shows the sleeve's own print, taken from the same crops as the sleeves.
  - The sleeves' fronts come from the flat lay's sleeves and their backs from the back photo's, crossfaded where they meet.
- **Contrast:** raised by 1.15 about the print's mid tone, because the studio's ambient light lifts the darks.

**Shape.**
- The fresco tee's fitted body, from the neck (1.91) to a hem at 1.19, which clears every waistband.
- The V comes to a point at 1.67, about her underarm height, and meets the neckline 0.16 of the way round. Its sides curve as in the flat lay (`round` 1.3). Her large head hides its upper part from the front.
- Raglan seams from just outside the V's corners down to each underarm, front and back. They start a little below the neckline, as on the fresco tee, so that a zipped jacket's collar covers them.
- Side seams, and the back band's seam across the lower back, 0.32 of the way up.
- Short sleeves with the template's rounded shoulder cap, ending at -0.155 (sleeve-local) in a lettuce edge, higher on the arm than the other two tees' sleeves. A first, wider flare stood out from her arms like wings, so they now stay close.

**Colour.** Calibrated by measuring renders against the photos. With `printTone` `#b39a83`:
- the front renders at a median of about (208, 181, 144), with brightness percentiles 96, 176 and 215, against the flat lay's (206, 182, 151) and 85, 176, 208;
- the back at about (192, 133, 83) against the back photo's (189, 125, 78).

The overlocking is `#a85a38` and the binding `#b66a46`, a little darker than measured, because the studio lifts them.

**Preset:** "Painterly patchwork tee study", with the Mango Claudia washed black jeans and the cream 550s.

## Layering

- Waistband: it covers the waistband, like the other tops at this length.
- Sleeves: the short sleeve's fabric ends at -0.155 (`layering.bareArmBelow`), so the shared sleeve test checks her arm only above that.
- Jackets: a jacket worn zipped closed hides the sleeves, as for every top.

## Styling facts

- Fitted, high-hip length.
- Cream, rust orange, yellow, sky blue, grey and green.
- A patchwork of painting prints, clouds and big flowers, with rust-orange overlocked seams.
- Deep V-neck, short sleeves, midriff covered.
- Fine stretch rib jersey.
- Warmth 1 of 4, inferred from the thin fitted knit, short sleeves and open neckline: warm days, or a base layer under a jacket.

## Checks

- A new `tests/painterly-patchwork-tee.test.js` checks:
  - the parts:
    - the binding, her skin in the V and the centre seam;
    - four raglan seams, two side seams and the back band seam;
    - the lettuce edges and two sleeves;
  - that the neckline stays at the neck at the back and drops symmetrically to the V's point;
  - that the body and each sleeve print from their own part of the atlas;
  - that the sleeves end high on her arm, where it turns bare;
  - the rust overlocking;
  - that the back band seam runs across the lower back;
  - that it still dresses her in a flat cream if the atlas fails to load.
- The shared tests also run on it:
  - sleeves and hands;
  - every waist-covering top over every bottom;
  - the styling facts;
  - every jacket over every top.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter and back, with its study;
  - a chest close-up.

  Nothing has been checked on a device.

## Known differences

- The print comes from photos, so it is softer than the fabric, and some photographed shading remains.
- The upper back is filled from a strip of the back photo, so its clouds repeat once, mirrored.
- Her torso is wider and shorter than the model's, so each panel shows a shorter slice of its painting. The back's band of flowers is squashed to under half its height.
- The sleeves come from small crops and are blurrier than the body.
- The binding is a plain orange; on the tee it is printed.
