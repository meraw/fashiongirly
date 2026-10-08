# Wardrobe item: Topshop acid-wash barrel jeans

Authored 8 October 2026. Status: first interpretation awaiting user visual feedback. Second piece from the user's wardrobe list, and the first that is not a top.

## Source and reference reading

The user sent four phone screenshots of the product gallery: front on a model, a back pocket close-up, the back at full length, and a front flat lay. No link was sent and no photos are stored in the repository.

Features read from the screenshots:

- Low rise, sitting on the hips.
- Very wide barrel (horseshoe) legs: they curve out to their widest around the knee and taper back toward the hem, full length, resting on the shoes.
- Side seams twisting forward toward the hem.
- Horizontal darts across the front of each knee.
- Slanted front pockets, belt loops, a silver shank button and a zip fly.
- Tan contrast topstitching throughout.
- Back: a yoke, patch pockets with pointed flaps and a button, a welt slit above the right pocket, and a brown suede patch on the waistband.
- Mid-dark blue with a grey cast and a marbled, crinkled acid-wash texture.

The cropped tank and sneakers in the photos are styling. Fibre composition was not visible.

## The bottom slot

This item adds the second wardrobe slot. Catalog entries now declare `slot: 'top'` or `slot: 'bottom'`, and recipes store `bottomId` next to `topId`. `cleanRecipe()` only accepts an ID from the matching slot, so a top can never be worn as trousers. The studio has a “Choose bottoms” selector; the built-in jeans' colour swatches and width slider only apply to the classic jeans and are disabled while a catalog pair is worn. Quick edits about jeans width likewise only change the classic jeans. Saved looks keep `bottomId`; older looks default to the classic jeans.

## Implementation

Catalog ID `topshop-barrel-jeans-v1`; `makeBarrelJeans()` in `src/doll/model.js`. It builds the same `trousers` group the tops already layer over, so existing hem-clearance rules apply.

- Hips and waistband sit lower than the classic jeans (waistband 1.155 to 1.205). The barrel legs reach their widest at the knee and taper back to a hem with a forward break: slightly shorter in front and longer at the back, clear of the loafers.
- The wash (`acidWashData()`) is tileable value noise: thin light veins over a mostly dark grey-blue ground, with a twill line. The hips and legs use different repeats so the wash keeps one physical scale.
- Details are placed by raycasting the built jeans surface, so stitches and patches sit on it rather than on an approximation: slanted pocket and fly stitching, waistband stitching, belt loops, shank button, twisted side seams, knee darts, back yoke, subdivided back patch pockets with stitched pointed flaps and buttons, the welt slit and the suede patch (without brand lettering).

## Layering fix found by this item

A new test checks that every waist-covering top hides every bottom between its hem and the waist. It found that the built-in jeans' hips, waistband and button showed through the front of the **bronze mesh top** above its hem, a pre-existing issue; the new jeans' belt loops and suede patch also poked through. The bronze top's lower torso and hem binding now ease out over the trousers, as the lilac top's did on `main`. Its upper body, print and sleeves are unchanged.

## Checks

- `npm test`: 20 passing. New tests cover the slot rules, the jeans' parts, the selector disabling the classic controls and saving `bottomId`, and the hem-clearance check for every waist-covering top over both bottoms.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn with the crochet top, and at a slight turn under the bronze, lilac, jumper and classic layers and under the skirt. These renders were checked by the authoring chat; the user has not yet seen them.

## Known differences

- The wash is procedural; it is not copied from the photos and has no whiskering or fading at the thighs.
- Her seat is short, so the back pockets sit high and close to where the legs separate.
- The legs end just above the loafers rather than pooling over them, to avoid the shoes cutting through the denim.
- The suede patch carries no lettering.
