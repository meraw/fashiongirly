# Wardrobe item: Desigual garden print mesh tee

Authored 9 October 2026. Status: first version, awaiting the user's visual review.

## Source and reference reading

The user sent five product photos without a description:

- the front on a model, hands on hips;
- the front, seated;
- a close-up of the front;
- the back;
- a close-up of the back yoke.

The brand is not shown. It is read as Desigual from its style and the product photography. The photos are not stored in the repository; a processed print atlas made from them is (see below).

Features read from the photos:

- A fitted, long-sleeved crew-neck tee in a fine printed stretch mesh (tulle), with a soft sheen.
- **The body** is printed as a Persian-miniature garden:
  - a sky-blue yoke with blossoming trees over a dark hill, with a white-turbaned figure (at the back, seated by a white flower);
  - below it, a brown ground overlaid with a silvery, velvety flocked damask of leaves and flowers, with robed figures: a green robe and an orange robe at the front, a multicoloured patchwork robe at the back.
- **Small printed speech-bubble patches** with English text:
  - “Only from the heart you can touch the sky”;
  - “Do you have any plans for tonight?”;
  - “Love dancing”;
  - on the back, “My … you are the universe in motion”.
- **A yoke seam** across the chest and across the upper back, an exposed pale grey-blue overlock, slightly wavy. The back seam is lower than the front one.
- **A dark charcoal crew neckband.**
- **Long fitted sleeves** in an open net, printed as a knit: a dark teal and green zigzag knit at the shoulders, shading into yellow and lime green down the arm.
- **Olive-gold metallic lamé cuffs** at the wrist.
- The hem is at the high hip, slightly ruched.

Measured in the photos:

- the front body's median colour is about RGB 120, 115, 110, the back's 149, 145, 143;
- the front of the sleeve is about 156, 167, 92;
- the cuffs are about 128, 125, 46, with highlights to 187, 186, 103;
- the neckband is 62, 57, 59 in shade and 92, 93, 98 in light;
- the overlock is about 190, 198, 205.

## Implementation

Catalog ID `desigual-garden-print-mesh-tee-v1` (slot `top`). It is in its own garment file, `src/wardrobe/garments/desigual-garden-print-mesh-tee-v1.js`, which holds its catalog entry, its study preset and its print atlas, which the 3D view loads from there.

**New top template `mesh-print-tee`.** It is registered in `src/doll/top-templates.js`, and `makeMeshPrintTee()` in the new `src/doll/mesh-print-tee.js` builds it from the entry's `build` spec. It changes no other garment's code. It builds:

- **The body:** the Mickey tee's fitted rows, from the neck (1.91) to a hem at 1.18, which clear every waistband. It is printed from the top of the atlas.
- **The neckband:** a crew neckband in charcoal.
- **The yoke seams:** two wavy overlocked lines laid on the body, at the heights where the atlas puts the photographed seams:
  - the front one at 1.727;
  - the back one, lower, at 1.642.

  Each runs across between her sleeves.
- **The sleeves:** long and fitted, on the Mickey tee's rows, with the shared rounded shoulder cap, eased over her hands. Each is printed from its own half of the bottom of the atlas.
- **The cuffs:** olive-gold lamé bands over the sleeve ends, metallic, with soft crinkles in the bump, eased over her hands.
- **The fabric:** the atlas, and a fine diamond net in the bump, with a soft sheen.

**Print atlas, from the user's photos.** `src/wardrobe/garden-mesh-tee-atlas.js` is a 2048 × 1024 WebP (about 300 KB). It was made during authoring, outside the app.

- **Layout:**
  - the top 640 rows hold the body unwrapped, with the column running from centre front toward her left and round the back;
  - the bottom 384 rows hold the sleeves, her right on the left half;
  - each sleeve's column runs round it from its front toward the outside, and its rows from the shoulder to her wrist.
- **Front:** from the front photo, from the neckband to just above her hands (the photo's rows 670 to 1200). It is laid round her front with the sides spread a little more evenly than a true projection, so that the edges do not smear. Each column is mapped in two parts, the yoke and the rest, so that the photographed yoke seam lands on one row of the atlas. The front keeps close to its true proportions.
- **Back:** from the back photo, the same way, from the neck to above the hem (rows 425 to 1120). Her arms hide the body's sides below the yoke, so the back is spread between the visible edges. Her torso is much wider for its height than the model's, so the back is squeezed in height by about a third.
- **Sleeves:** each half is the middle of the sleeve as photographed, spread evenly round its half:
  - her right sleeve's front from the front close-up, its back from the back photo;
  - her left sleeve's front is not shown clearly in any photo (her arm is bent), so it repeats that sleeve's back, mirrored.
  - The photographed cuff's top falls at 0.918 of the way down the sleeve, where the lamé cuff begins.
- **Shading and contrast:**
  - the photos' soft shading is partly divided out (a heavy blur of their brightness, levelled to the garment's own median);
  - the contrast is raised by 1.12 about the print's mid tone.

**Colour.** Calibrated by measuring renders against the photos, with `printTone` `#aaabaf`:

| | Front median | Back median | Sleeve median |
| --- | --- | --- | --- |
| Render | (125, 117, 111) | (154, 144, 143) | (164, 159, 93) |
| Photo | (120, 115, 110) | (149, 145, 143) | (156, 167, 92) |

**Preset:** “Garden mesh tee study”, with the Topshop washed black wide crop jeans. The photos pair the tee with wide black trousers.

## Styling facts

A fitted, high-hip mesh tee with long sleeves, in a photographic garden print: sky blue, taupe brown and silver grey, with knit-print sleeves in teal, yellow and lime, and olive-gold cuffs. Warmth 1 of 4, inferred from the thin, slightly open mesh, though it is long-sleeved. Mild days, or as a layer under a jacket.

## Layering

- Waistband: it covers the waistband, like the other tops at this length.
- Jackets: a jacket worn zipped closed hides the sleeves, as for every top. Under the open leather jacket, the print shows between the fronts.

## Checks

- `npm test` passes (122), including a new `tests/garden-mesh-tee.test.js`, which checks:
  - the parts: the body, the neckband, the two yoke seams, the sleeves and the cuffs;
  - the front seam is on her front and the back seam on her back, lower;
  - each cuff is metallic and covers its sleeve's end;
  - the print comes from its atlas: the atlas is WebP, the body reads the top of the atlas and each sleeve its own half of the bottom; without the atlas it is a flat colour.

  The shared tests cover it too:
  - the sleeves cover her arms;
  - every top over every bottom and the skirt;
  - the outerwear coverage of every top;
  - the triangle budget;
  - the garment-file layout.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a slight turn and the back in the study, and over the skirt under the open leather jacket. Compared with the photos.

## Known differences

- The print is taken from photos of the tee worn, so it carries a little of their shading and of the mesh's folds, and it is softer than the real fabric.
- The back is squeezed in height by about a third. The sides of the body, hidden under the arms in the photos, are spread from the print beside them.
- The sleeves are photographed narrow, so their knit-print zigzag is softened and stretched round the arm. Her left sleeve's front repeats its back.
- The mesh is opaque here; the real mesh, and especially the sleeves' net, is slightly sheer.
- The hem is straight, not ruched.
- Her large head hides most of the sky-blue yoke at the front.
