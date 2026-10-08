# Wardrobe item: Topshop acid-wash barrel jeans

Authored 8 October 2026. Status: revised after the user's first review; awaiting their second look. Second piece from the user's wardrobe list, and the first that is not a top.

## Source and reference reading

The user sent four phone screenshots of the product gallery: front on a model, a back pocket close-up, the back at full length, and a front flat lay. No link was sent and no photos are stored in the repository.

Features read from the screenshots:

- Low rise, sitting on the hips.
- Wide, nearly straight legs despite the “barrel” name: about as wide at the thigh as at the hem, with only a gentle outward curve at the knee. Full length to the floor, resting on the shoes.
- Twisted legs: the outseam sweeps toward the back on its way down, and the inseam toward the front.
- Articulated knees: a horizontal seam across the front and the back of each knee.
- Slanted front pockets, belt loops, a silver shank button and a zip fly.
- Tan contrast topstitching throughout.
- Back: a yoke, patch pockets with pointed flaps and a button, a welt slit above the right pocket, and a brown suede patch on the waistband.
- Mid-dark teal-navy with a grey cast and a marbled, crinkled acid-wash texture, paler down the front of the thighs.

The cropped tank and sneakers in the photos are styling. Fibre composition was not visible.

## The bottom slot

This item adds the second wardrobe slot. Catalog entries now declare `slot: 'top'` or `slot: 'bottom'`, and recipes store `bottomId` next to `topId`. `cleanRecipe()` only accepts an ID from the matching slot, so a top can never be worn as trousers. The studio has a “Choose bottoms” selector; the built-in jeans' colour swatches and width slider only apply to the classic jeans and are disabled while a catalog pair is worn. Quick edits about jeans width likewise only change the classic jeans. Saved looks keep `bottomId`; older looks default to the classic jeans.

## Implementation

Catalog ID `topshop-barrel-jeans-v1`; `makeBarrelJeans()` in `src/doll/model.js`. It builds the same `trousers` group the tops already layer over, so existing hem-clearance rules apply.

- The waistband sits a little below the classic jeans' (1.17 to 1.22), leaving room for the yoke and large back pockets. The hips widen to meet the wide legs without a step.
- Legs are wide and nearly straight down to the floor (0.06). Over each loafer the hem rises to rest on the shoe's upper, so the toe shows beneath it; elsewhere it reaches the floor.
- The wash (`acidWashData()`) is tileable value noise: thin light veins over a dark teal-navy ground, with a twill line. The hips and legs use different repeats so the wash keeps one physical scale. A per-vertex fade lightens the front of the thighs and the seat and darkens toward the hem.
- Details are placed by raycasting the built jeans surface, so they sit on it. Bold tan stitching on the waistband, fly and slanted pockets; belt loops and a shank button; outseams twisting to the back and inseams to the front; knee seams front and back; back yoke and centre-back seam; large subdivided back patch pockets with stitched pointed flaps and snap buttons; the welt slit; and a large suede patch (no lettering).

## Revision after user feedback

The user found the first version did not fit like the jeans: it read as balloon-like (despite the “barrel” name the real legs are nearly straight), it was too short, and it was not differentiated enough, especially from the back. The first version bulged at the knee, tapered to a hem above the shoes, and had small, low-contrast details. The revision straightens the legs, takes them to the floor draped over the shoes, enlarges and brightens the distinguishing details, corrects the direction of the seam twist, adds the back knee seams and centre-back seam, and darkens the wash toward the photo. Renders were compared side by side with the back photo during authoring. A test now checks that the leg stays nearly straight from knee to hem and reaches the shoes; it fails on the first version.

## Colour calibration

After the revision, the user found the colour still off compared with the tops, whose image textures render accurately. The wash had been tuned by eye. It is now calibrated by measurement. Plain-denim areas of the three photos were sampled (sRGB average and brightness percentiles):

| Source | Mean RGB | Brightness p10 / p50 / p90 |
| --- | --- | --- |
| Front on model | 61, 73, 80 | 38 / 67 / 110 |
| Flat lay | 69, 77, 84 | 48 / 75 / 107 |
| Back on model | 56, 66, 72 | 39 / 54 / 77 |

The same areas of the headless-Chromium render were measured after each change. The first measurement was 71, 88, 98 (too bright, too blue, and much flatter: p10 73). The wash's dark and light colours, its contrast curve and the sheen were adjusted over five rounds. The sheen was removed (rigid denim has almost none). The noise was stretched vertically so the crinkle runs in fine streaks down the leg, as in the photos, instead of round blotches. Final render: front 63, 74, 81 (brightness 50 / 71 / 97); back 62, 73, 79. The remaining gap is mostly the deepest shadows: the photos get them from folds, which the smooth geometry lacks.

## Layering fix found by this item

A new test checks that every waist-covering top hides every bottom between its hem and the waist. It found that the built-in jeans' hips, waistband and button showed through the front of the **bronze mesh top** above its hem, a pre-existing issue; the new jeans' belt loops and suede patch also poked through. The bronze top's lower torso and hem binding now ease out over the trousers, as the lilac top's did on `main`. Its upper body, print and sleeves are unchanged.

## Checks

- `npm test`: 20 passing. New tests cover the slot rules, the jeans' parts, the selector disabling the classic controls and saving `bottomId`, and the hem-clearance check for every waist-covering top over both bottoms.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn with the crochet top, and at a slight turn under the bronze, lilac, jumper and classic layers and under the skirt. These renders were checked by the authoring chat; the user has not yet seen them.

## Known differences

- The wash is procedural; it is not copied from the photos and has no whisker lines. Its colour is calibrated to the photos (see above), but the texture repeats and the deepest shadows from folds are missing.
- Her seat is short, so the back pockets sit close to where the legs separate.
- The hem rests on the shoe as a smooth lift, without stacked folds.
- The suede patch carries no lettering.
