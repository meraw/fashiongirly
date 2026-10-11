# Wardrobe items: laced flame print top and mini skirt, cut from one dress

Authored 11 October 2026. Status: first version, marked approved in its own pull request: merging it is the approval (the user's rule). Added by the chat that has been doing outerwear (any chat can add any category).

## Source and the user's plan

The user sent four product photos of a printed lace-up mini dress, without a description:

- the front, full length on a model;
- the front, closer, on a second model;
- a close-up of the shoulder and sleeve;
- the back, full length.

The user said: “I'm going to cut up this dress so it becomes a shirt and a skirt, cut a little above the fake belt drawing. Add both to the wardrobe.” So these are two garments, the top and the skirt, cut from the dress just above its printed belt. The brand is not stated. The photos are not stored in the repository; processed print atlases made from them are (see below).

Features read from the photos:

- A fitted dress in a smooth stretch jersey with a high mock neck and long fitted sleeves, to the top of her thigh.
- An all-over print on washed black:
  - a printed denim twill, with bleached clouds;
  - pale pink flame outlines;
  - white line drawings of cute devils, horned lambs, cats, bunnies, cherubs, moon-faced girls and a princess.
- A printed lace-up stripe down the outside of each sleeve: pink laces crossing between grey eyelets on a pale band. At each cuff, real pink cords are laced through and tied in a bow with long ends.
- A printed (“fake”) belt round the hips: a band with pink laces crossing between grey eyelets, and a big printed O-ring at her left front.
- Three metal snap clips hanging from the belt on her right front. Two carry flat dark grey felt charms, a bow and a cherub badge, stitched and drawn in white.
- Real pink cords laced up near the hem on her right front, tied in a bow with long ends.

Measured colours (front close-up, the torso): the ground is about RGB 53, 54, 63 at its median and 22, 24, 32 at its darkest. The pale lines are about 197, 178, 186: the pink flames are a pale pink, and the white drawings a little cooler.

## Where the dress is cut

“A little above the fake belt drawing”: at the front the belt starts at about row 1035 of the close front photo, and the cut is taken at row 1022.

On the doll:

- The top's hem is at 1.19.
- The skirt's top edge is at 1.225, so the top's hem laps over the skirt's cut edge. Worn together, they read as the dress.
- The printed belt starts just below the skirt's edge.

Both cut edges are raw: a cut jersey edge does not fray.

## Implementation

Two catalog IDs, each in its own garment file with its catalog entry, its study preset and its print atlas:

- `laced-flame-print-mockneck-top-v1` (slot `top`), in `src/wardrobe/garments/laced-flame-print-mockneck-top-v1.js`.
- `laced-flame-print-mini-skirt-v1` (slot `bottom`), in `src/wardrobe/garments/laced-flame-print-mini-skirt-v1.js`.

### The top: new template `laced-print-top`

`makeLacedPrintTop()` in the new `src/doll/laced-print-top.js`, registered in `src/doll/top-templates.js`. It changes no other garment's code. It builds:

- **The body and mock neck** as one surface: the lilac top's mock neck (up to 1.972), then the Mickey tee's fitted rows, cut at 1.19. It is printed from the top two thirds of its atlas.
- **The sleeves:** long and fitted, on the Mickey tee's rows, with the shared rounded shoulder cap, eased over her hands. Each is printed from its own half of the bottom third of the atlas.
- **The laced cuffs:** on the outside of each cuff, two pink cords cross four times between the atlas's eyelet columns. They rise a little off the sleeve between the eyelets. A bow (two loops and a knot) sits at the cuff, and its two ends (0.15 and 0.12 long) hang straight down in the world, easing away from her hand.
- **The fabric:** a matte jersey with a fine knit in the bump and a faint sheen. The atlas is toned (`printTone`), calibrated by measuring renders against the photos.

### The skirt: new bottom template `mini-skirt`, the first skirt in the bottom slot

`makeMiniSkirt()` in the new `src/doll/mini-skirt.js`. `makeOutfit()` gains two lines: its import and its dispatch, which moves the skirt's pieces into the `trousers` group. It builds:

- **The skirt:** fitted, from the cut edge at 1.225 (the jeans' waistband size there) over her hips to a hem at 0.88, the top of her thigh. It is printed from its atlas, printed belt included.
- **Her bare legs**, as under the dresses: the same skin shells, from 1.0 down to her ankles.
- **The charms (`charms`):** three metal snap clips hang from the belt's lower edge at her right front. Two of them carry flat felt charms on short chains, a bow and a rounded cherub badge, each with a pale stitched outline. Their shapes are stretched back so they are true in the world, as the outfit is scaled 0.76 high.
- **The lacing (`lacing`):** on her right front near the hem, metal eyelets in two columns, two pink cords crossing three times, a bow at the hem and two long ends hanging below it.

### Layering changes for a skirt in the bottom slot (small, additive)

- **`cleanRecipe()`** (`src/doll/recipe.js`): a skirt in the bottom slot (`layering.skirt`) is never worn under the built-in layered skirt, so `skirt` is forced off. The app disables that toggle, and its message for a selected skirt says it is worn with bare legs.
- **`tests/shoes.test.js`:** it checks that trouser legs come down over open shoes, which a skirt does not have, so it skips a skirt over open shoes, with a comment. Over boots, the skirt's bare legs are checked like the classic jeans (they stay inside the boot shafts).

Every other garment's code is unchanged. Their outfits build the same, since the new lines only act on the new templates.

### Print atlases, from the user's photos

Both were made during authoring, outside the app, by a script that unwraps the photos onto the doll's surfaces:

- `src/wardrobe/laced-flame-top-atlas.js`: a 2048 × 1536 WebP, about 690 KB.
- `src/wardrobe/laced-flame-skirt-atlas.js`: a 2048 × 512 WebP, about 260 KB.

**Layout.** The body and the skirt are unwrapped by angle round her: the column runs from centre front toward her left and round the back, and the rows by height. Each photographed half is laid round her with the sides spread a little more evenly than a true projection, so the edges do not smear. Edges were measured from the gaps of background beside the body, a few pixels inside, clear of the shadow where her arms touch her body.

**The top:**

- **Front:** from the close front photo, the mock neck from row 152 to 235, then the body to the cut line. Her hair falls over her right shoulder there, so that corner is filled from her left shoulder, mirrored.
- **Back:** from the back photo, from the shoulders (row 135) to the cut line (575). Her long hair hides the upper back down to row 398. There, the back repeats the front's print from the diagonally opposite side: her right front on her left back, her left front on her right back, feathered. Below the hair it is the real back print.
- **Sleeves:** her sleeves are much plumper for their length than the model's. Each sleeve's front half is its own photographed face (the stretch of arm from row 520 to 760), and its back half is the other sleeve's face. The motifs keep their shape, larger than on the body, without being mirrored. The two faces meet at the outside, under the lacing, and are cross-faded where they meet under her arm.
- **Sleeve lacing:** the printed lacing down the outside of each sleeve is drawn, not copied: a pale grey band, grey eyelets along both edges and pink laces crossing between them. Over the last fifth above the wrist only the eyelets are printed, as the real cords are modelled there.

**The skirt:**

- **Front:** from the close front photo, from the cut line (row 1022) to the hem (1605).
- **Back:** from the back photo (rows 572 to 900).
- **Hidden areas:** in the front photo, the charms, their clips and the laced cords hide the print on her right front, and her left hand covers its right edge near the hem. Below the belt these areas are filled from the diagonally opposite quarter of the back, feathered. The modelled charms and lacing sit on top.

**Shading and grade:** the studio's soft shading is partly divided out (a heavy blur of the brightness). The studio's warm lights tint the dark ground and flatten the fine lines, so the atlas is graded, calibrated by measuring renders against the photos:

- the dark ground darkened and kept near neutral;
- more contrast about the ground;
- more chroma in the pale lines, so the flames read pink.

**Calibration** (the torso in a front render against the close front photo, by brightness band):

| Band | Photo | Render |
|---|---|---|
| Darkest (5th–15th percentile) | (22, 24, 32) | (28, 24, 27) |
| Median | (53, 54, 63) | (53, 50, 58) |
| Pale lines (85th–95th percentile) | (171, 167, 173) | (186, 180, 192) |

The renderer's ambient light keeps the very darkest ground a little lifted and warm.

### Presets

- “Laced flame top study”: the top with the skirt, as the dress was.
- “Laced flame skirt study”: the skirt with the black Mickey tee and the pink Superstars.

## Layering

**The top:**

- It covers every waistband (`layering.coversWaistband`), and laps over the skirt's cut edge.
- It is worn loose, and can be tucked in like the other fitted tops.
- A jacket hides its sleeves, laced cuffs included, as for every top.

**The skirt:**

- It is a bottom: tops that cover the waistband hang over it, and a tucked top tucks into it, as into a waistband.
- Its waist and hips are no wider than the jeans' where the tops cover them.
- Jackets and coats cover it as they cover the jeans.

The shared tests check all of these against every top and jacket.

## Styling facts

**Top:**

- Fitted, high-hip length, with a mock neck and long sleeves.
- Washed black with pale pink and white.
- An all-over cartoon line-drawing print with flames, and a printed denim look.
- Stretch jersey.
- Warmth 2 of 4, inferred from the fitted long-sleeved jersey with a high neck: mild or cool days, or under a jacket.

**Skirt:**

- A fitted mini to the top of her thigh.
- The same print, with a printed lace-up belt.
- Bare legs.
- Stretch jersey.
- Warmth 1 of 4, inferred from the short skirt with bare legs: warm or mild days.

## Checks

- New `tests/laced-flame-top-skirt.test.js` checks:
  - **the top:**
    - its parts: the body, sleeves, laced cords, bows, knots and tie ends;
    - that the mock neck reaches her chin and the hem is at 1.19;
    - that every texture coordinate lands inside the atlas, and no sleeve wraps the atlas within one segment, which drew a dark streak down her right sleeve in the first render;
    - that the bow's ends hang down;
  - **the skirt:**
    - its parts: the body, the bare legs, three clips, two charms with chains and stitching, the lacing, eight eyelets, the bow and its ends;
    - its height, from 1.225 to 0.88;
    - that the charms and lacing sit on her right front;
    - that the built-in layered skirt is never worn over it;
    - that no part of her body or legs pokes through it.
- The shared tests also run on both:
  - every waist-covering top over every bottom, the skirt included;
  - tucked tops into every bottom;
  - every jacket over every top and bottom;
  - every bottom with every shoe;
  - sleeves and hands;
  - the styling facts and the garment-file layout.
- Rendered in headless Chromium:
  - the top and skirt together, from the front, a turn, the side and the back, with close-ups;
  - the skirt with the Mickey tee and the pink Superstars;
  - the top with the white Mango Sienna jeans.

## Known differences

- The prints come from photos of the dress worn, so they are softer than the real fabric and keep a little of their shading.
- The top's upper back repeats front print where her hair hides it.
- The sleeve print is larger than the body's.
- The charms are simplified shapes, without their drawings. The clips are slim loops.
- The cuts are where the user said they will cut; the exact lines are guesses.
- A cut jersey edge has no waistband to hold the skirt up; the doll's skirt simply stays where it is put.
