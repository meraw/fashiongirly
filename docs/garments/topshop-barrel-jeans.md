# Wardrobe item: Topshop acid-wash barrel jeans

Authored 8 October 2026. Status: approved by the user (“Ok, that works”) after several revisions, with denim taken from the product photo. Second piece from the user's wardrobe list, and the first that is not a top.

## Source and reference reading

The user sent four phone screenshots of the product gallery: front on a model, a back pocket close-up, the back at full length, and a front flat lay. No link was sent. Only a processed fabric swatch from the flat lay is stored (see below).

Features read from the screenshots:

- Low rise, sitting on the hips.
- Wide, nearly straight legs despite the “barrel” name: about as wide at the thigh as at the hem, with only a gentle outward curve at the knee. Full length to the floor, resting on the shoes.
- Twisted legs: the outseam sweeps toward the back on its way down, and the inseam toward the front.
- Articulated knees: a horizontal seam across the front and the back of each knee.
- Slanted front pockets, belt loops, a silver shank button and a zip fly.
- Tan contrast topstitching throughout.
- Back: a yoke, patch pockets with pointed flaps and a button, a welt slit above the right pocket, and a brown suede patch on the waistband.
- Mid-dark slate grey-blue: a nearly even colour with a very fine texture, and a faint gradient darker toward the hem.

The cropped tank and sneakers in the photos are styling. Fibre composition was not visible.

## The bottom slot

This item adds the second wardrobe slot. Catalog entries now declare `slot: 'top'` or `slot: 'bottom'`, and recipes store `bottomId` next to `topId`. `cleanRecipe()` only accepts an ID from the matching slot, so a top can never be worn as trousers. The studio has a “Choose bottoms” selector; the built-in jeans' colour swatches and width slider only apply to the classic jeans and are disabled while a catalog pair is worn. Quick edits about jeans width likewise only change the classic jeans. Saved looks keep `bottomId`; older looks default to the classic jeans.

## Implementation

Catalog ID `topshop-barrel-jeans-v1`; `makeBarrelJeans()` in `src/doll/model.js`. It builds the same `trousers` group the tops already layer over, so existing hem-clearance rules apply.

- The waistband sits a little below the classic jeans' (1.17 to 1.22), leaving room for the yoke and large back pockets. The hips widen to meet the wide legs without a step.
- Legs are wide and nearly straight down to the floor (0.06). Over each loafer the hem rises to rest on the shoe's upper, so the toe shows beneath it; elsewhere it reaches the floor.
- The wash (`acidWashData()`) is a flat calibrated colour with a faint grain and twill line; a per-vertex gradient darkens it toward the hem (see the calibration below).
- Details are placed by raycasting the built jeans surface, so they sit on it. Bold tan stitching on the waistband, fly and slanted pockets; belt loops and a shank button; outseams twisting to the back and inseams to the front; knee seams front and back; back yoke and centre-back seam; large subdivided back patch pockets with stitched pointed flaps and snap buttons; the welt slit; and a large suede patch (no lettering).

## Revision after user feedback

The user found the first version did not fit like the jeans: it read as balloon-like (despite the “barrel” name the real legs are nearly straight), it was too short, and it was not differentiated enough, especially from the back. The first version bulged at the knee, tapered to a hem above the shoes, and had small, low-contrast details. The revision straightens the legs, takes them to the floor draped over the shoes, enlarges and brightens the distinguishing details, corrects the direction of the seam twist, adds the back knee seams and centre-back seam, and darkens the wash toward the photo. Renders were compared side by side with the back photo during authoring. A test now checks that the leg stays nearly straight from knee to hem and reaches the shoes; it fails on the first version.

## Colour calibration

After the revision, the user found the colour still off compared with the tops, whose image textures render accurately. The wash had been tuned by eye. Plain-denim areas of the three photos were sampled (sRGB average and brightness percentiles):

| Source | Mean RGB | Brightness p10 / p50 / p90 |
| --- | --- | --- |
| Front on model | 61, 73, 80 | 38 / 67 / 110 |
| Flat lay | 69, 77, 84 | 48 / 75 / 107 |
| Back on model | 56, 66, 72 | 39 / 54 / 77 |

A first calibration matched the averages but also tried to match the photos' brightness spread by drawing streaky crinkle into the texture. The user found that worse: the real jeans read as a nearly even colour on a faint gradient, darker toward the hem, and the drawn streaks looked like ruffles. The photos' spread comes from lighting and folds, not from the fabric.

The wash is now a flat calibrated base (texel RGB 48, 61, 70) with a very faint fine grain and a twill line. A per-vertex gradient runs from slightly lighter at the hips (1.08) to darker at the hem (0.86). Rendered plain-denim areas measure 61, 75, 82 at the front and 63, 76, 83 at the back, against the photo's 61, 73, 80.

## Rebuild: realism from shape, not paint

The user found the flat version still not convincing (“if we can't do jeans the app doesn't work”). The underlying problem: the legs were perfect smooth tubes, so the denim read as plastic whatever its colour. In the photos, what reads as denim comes from shape. The fabric drapes in soft vertical folds and stacks where it rests on the shoe; wear is paler on raised areas and darker in hollows; seams and hem edges are paler (“roping”); whiskers fan out at the top of the thighs. Painting that variation into the texture had looked like ruffles; leaving it out looked like plastic. It now comes from geometry lit by the scene:

- Drape: radial displacement of each leg, two soft angular waves drifting around the leg with height (following the twist), shallow at the hip and deeper toward the hem.
- Stacking: rippled folds in the lowest part of the leg where the hem rests on the shoe.
- Wear shading: per-vertex colour follows the same displacement (crests paler, hollows darker), plus paler roping along the twisting outseam and inseam and at the hem edge, faint whiskers at the front of the thighs, and the gentle hip-to-hem gradient.
- Seams and knee darts are placed by casting onto the folded surface of their own leg, so they follow the folds.
- Stitching is tonal (muted tan, thinner), as in the photos, instead of bright piping.
- The texture is a flat calibrated colour with a fine speckle and twill line only.
- The crotch curves back between the legs instead of ending in a ledge.

Rendered plain denim measures 61, 74, 81 at the front, against the photo's 61, 73, 80.

## Denim texture taken from the jeans

The user found the rebuild acceptable in shape but still below the tops, and the texture “random instead of taken from the jeans”. The tops render well because their fabric comes from images of the garment; the jeans' denim had been invented. The denim is now a swatch from the product flat lay:

- Crop: the middle of the lower left leg, clear of the outseam, inseam and knee dart (221 × 543 px of the 1280-px-wide screenshot). An earlier crop caught the inseam's stitching, which repeated as a bright line when tiled.
- Flat lighting: the crop is divided by a heavy blur of itself, which keeps the fabric's own crinkle and grain but removes the photo's shading.
- Calibration: multiplied to texel mean RGB 46, 58, 66, which renders as the photos' denim (front render 60, 72, 78 against the photo's 61, 73, 80).
- Seamless: blended with a half-offset copy of itself, contrast restored where the copies average; resized to 256 × 640 and stored as WebP in `src/wardrobe/topshop-denim.js` (about 31 KB as a data URI).
- Scale: four repeats around each leg and one down its length, matching the swatch's size relative to the leg in the photo. The hips, pockets and small pieces use matching scales.
- The view loads it with the tops' atlases. Without it (tests, or a failed load) a flat calibrated colour stands in.

The drape geometry and shape-derived shading are kept, with the wear shading reduced because the swatch now carries the fabric's variation.

This is the first piece of a retailer's product photo bundled in the repository: a small processed fabric swatch, at the user's request. The other garments' textures are generated or drawn. If the repository is public, the user may want to consider this; the brief notes they may make it private later.

## Crotch rebuilt with the Davinia fix

When the user found the Davinia jeans strange at the crotch, the barrel jeans showed the same pouch, ledge and step. They were moved onto the same crotch construction (see the Davinia record): `crotch: { top: 1.2, y: .95 }` (a longer transition because these legs are fuller than the hips above them) and `uvScale: [3.7, 1.03]`, which keeps their previous denim scale. This changes only the hips and the top of the legs; the fingerprint recorded before the template refactor no longer applies.

## Layering fix found by this item

A new test checks that every waist-covering top hides every bottom between its hem and the waist. It found that the built-in jeans' hips, waistband and button showed through the front of the **bronze mesh top** above its hem, a pre-existing issue; the new jeans' belt loops and suede patch also poked through. The bronze top's lower torso and hem binding now ease out over the trousers, as the lilac top's did on `main`. Its upper body, print and sleeves are unchanged.

## Checks

- `npm test`: 20 passing. New tests cover the slot rules, the jeans' parts, the selector disabling the classic controls and saving `bottomId`, and the hem-clearance check for every waist-covering top over both bottoms.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn with the crochet top, and at a slight turn under the bronze, lilac, jumper and classic layers and under the skirt. These renders were checked by the authoring chat; the user has not yet seen them.

## Known differences

- Folds are procedural and regular compared with real drape, and the scene's soft lighting gives less contrast than the photos.
- Her seat is short, so the back pockets sit close to where the legs separate.
- The hem rests on the shoe as a smooth lift, without stacked folds.
- The suede patch carries no lettering.
