# Wardrobe item: Van Gogh patchwork print tee

Authored 9 October 2026. Status: first version, awaiting the user's visual review. Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent six product photos with no written description: the front on a model (at two distances), the back (twice), and close-ups of the back band and of the front's side. The photos are not stored in the repository; a processed texture made from them is (see below). The brand is not stated.

Features read from the photos:

- A fitted, short-sleeved raglan tee in a fine stretch rib knit, ending at the high hip, at the waistband of high-rise jeans.
- It is pieced from panels, each printed with a section of a Van Gogh painting: a swirling blue sky with white clouds, and white roses with dark leaves on pale green (his *Roses*, 1890).
  - Front: sky on her right, roses on her left, joined by a centre seam.
  - Back: a large white cloud on blue and teal sky, above a band of roses across the lower back (about a quarter of the length).
  - Raglan sleeves: her right sleeve roses and leaves, her left sleeve sky.
- Every seam is exposed and overlocked in sage green (measured about RGB 72, 95, 85), slightly wavy.
- The hem, sleeve hems and crew neckline have lettuce edges in the same green.

## Implementation

Catalog ID `van-gogh-patchwork-tee-v1` (slot `top`). It is built by `makePrintedTee()` in the new file `src/doll/printed-tee.js`, from the `build` spec in its catalog entry (template `printed-raglan-tee`). `makeOutfit()` gained one dispatch line for the template.

- **Print atlas, from the user's photos.** `src/wardrobe/vangogh-tee-atlas.js` is a 1536 × 768 WebP (about 120 KB). It was made during authoring, outside the app, by projecting the front and back photos onto the doll's body.
  - Layout: the top three quarters hold the body unwrapped, round her from centre front and from the hem up to the neck. The bottom quarter holds the two sleeves.
  - Each front and back panel is sampled from its photo. Its position round her body sets where to read across the shirt, and a chosen vertical window of the photo sets where to read up and down.
  - The shoulders above the raglan lines are taken from the photos' own shoulders, with the doll's raglan line laid on the photo's raglan seam. The print therefore runs on into the sleeve as on the shirt.
  - The sleeves come from small interior crops of each sleeve, front and back.
  - Broad studio shading is partly divided out of the panels; fold shading is divided out of the sleeve crops.
  - Van Gogh's paintings are long out of copyright. Only this processed atlas is bundled, not the photos.
- **Shape.** A fitted body from a crew neck (1.91) to a hem at 1.19, on the bronze top's rows, which clear every waistband. Short raglan sleeves ending above her elbow, with the shared rounded shoulder cap.
- **Seams.** Exposed green overlocking, a slightly wavy raised line, sits on each panel edge of the unwrap:
  - four raglan seams, from the neckline down to each underarm
  - the centre front seam
  - the side seams
  - the back band's seam across the lower back
- **Lettuce edges.** The hem, sleeve hems and neckline wave softly and are finished with a green edge.
- **Colour.** Calibrated by measuring renders against the photos. The atlas keeps the photos' colours, and the studio lifts them, so the print is toned down (`printTone`). The back's averages now match the photo (about 165 against 166). The front is a little brighter, because the key light faces it.
- **Preset.** “Van Gogh tee study”, with the Stradivarius relaxed light jeans (the photos pair it with light jeans).

## Layering

It covers the waistband, like the other tops at this length. The short sleeve's fabric ends at -0.17 (`layering.bareArmBelow`), so the shared sleeve test checks her arm only above that. A jacket hides its sleeves, as for every top.

## Styling facts

- Fitted, high-hip length; sky blue, white, sage green and teal.
- A patchwork of painting prints with green overlocked seams.
- Crew neck, short sleeves, midriff covered.
- Fine stretch rib jersey.
- Warmth 1 of 4, inferred from the thin fitted knit and short sleeves: warm days, or a base layer under a jacket.

## Checks

- New `tests/printed-tee.test.js` checks:
  - the parts: seams, lettuce edges, two short sleeves
  - that the body and each sleeve print from their own part of the atlas, with her right sleeve on the left half
  - that the hem waves, and the sleeves end above her elbow
  - that every seam lies on the knit
  - that it still dresses her in a flat sky colour if the atlas fails to load
- The shared tests also run on it: sleeves and hands, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm test`: 65 passing after merging `main` (which added the dress slot); `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, at twice the resolution. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The print comes from photos, so it is softer than the fabric, and some photographed shading remains.
- Her torso is wider and shorter than the model's, so each panel shows a shorter vertical slice of its painting than the shirt does. The motifs are kept close to their shapes rather than stretched.
- The sleeves come from small crops and are blurrier than the body.
- The photo's own seam lines show faintly in places beside the modelled seams.
