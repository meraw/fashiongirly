# Wardrobe item: Urban Classics pleated linen-blend wide trousers

Authored 9 October 2026. Status: first version, awaiting the user's visual review. Built on the shared jeans template, extended for it.

## Source and reference reading

The user sent seven phone screenshots of a product gallery (images 2, 4, 7 and 11 to 14 of 16), with no text: front, three-quarter and back on a model, front and back flat lays, and close-ups of a front pocket and a back pocket. Neither the brand nor the fabric composition is visible; after seeing the first version, the user said they are Urban Classics. Photos are not stored in the repository.

Features read from the photos:

- High rise: the waistband sits at the model's natural waist.
- One deep pleat on each front hip, folded toward the fly, pressed flat at the waistband and releasing at the hip.
- Wide legs falling straight from the hip and widening slightly to the hem; full length, the hems resting on the model's platform sandals.
- A pale stone (sand) plain weave with visible linen slubs, matte.
- Slanted front pockets from the waistband to the side seam, topstitched.
- A zip fly with a curved stitched edge, and one tonal four-hole button.
- Six belt loops: front, sides and back, none at the centre back.
- Back: a jetted (welt) pocket on each side with a stitched outline, a short dart above each, and a centre-back seam.
- Tonal stitching and a plain hem.

## Implementation

Catalog ID `pleated-linen-wide-trousers-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. The waistband sits at her waist (1.26 to 1.32). The legs are wide from the hip, meeting it at the crotch without a ledge, and widen slightly to rest on the shoes (`hem: 'rests-on-shoe'`).

New template options, all off by default. The other pairs are unchanged: their outfits were built on main and on this branch and compared, with no difference in geometry, materials or textures.

- `pleats`: a pressed fold on each front hip, built into the hips' own surface. Its folded edge (`x`, drifting toward the fly by `slant`) stands proud by `depth` and steps down onto the fabric beside it, toward the fly. The fold fades out where the pleat releases (`bottom`). A soft shadow line (`shadow`) runs along the step for part of its length (`line`).
- `backWelt`: jetted back pockets, with two narrow lips round a dark opening and a stitched outline on each side.
- `button.matte` and `button.holes`: a tonal plastic button with four holes, in place of the metal shank button.

`dartsStitched` (already in the template) draws the back darts in the thread colour, since the template's dark fold colour was far too harsh on pale linen.

For later outfit selection, the catalog entry has a `styling` record:

- **Silhouette:** high-waisted pleated wide leg.
- **Palette:** pale stone and sand.
- **Material:** plain, with a subtle slub.
- **Coverage:** full length.
- **Warmth:** 1, inferred from the light linen-look weave.
- **Weather:** suits warm, dry days. Wind and rain performance are unknown, and the pale colour will show rain spots and dirt at the hem.

## Fabric and colour

The swatch comes from the plain fabric below the back pocket in the close-up. It was processed in three steps:

1. Its lighting was divided out with a wide blur, which keeps the weave and slubs.
2. It was made seamless by cross-fading with a copy shifted by half a tile.
3. It was reduced to 256 px at 75 % contrast.

It is stored as WebP in `src/wardrobe/pleated-linen-fabric.js`.

Plain fabric measures about RGB 206, 199, 182 across the photos: 209, 203, 186 in the front flat lay, 204, 196, 177 on the model, and 209, 202, 185 and 205, 198, 180 in the close-ups. A swatch at the photos' colour rendered far too pale (230, 226, 216). Three adjustments brought the swatch to 160, 154, 134, which renders at 211, 203, 184 on the legs from the front and the back.

## Checks

- `npm test` passes, including a new test in `tests/bottoms.test.js`:
  - none of the denim hardware (rivets, patch pockets, coin pocket, yoke) is present
  - six belt loops, the slant pockets, the fly and the back darts
  - the four-hole plastic button
  - jetted pockets on both sides of the back
  - each pleat's edge stands proud of the fabric beside it (it fails with the pleat depth set to zero)
  - the hems come down over the shoes, the legs widen toward the hem without crossing, and her legs and socks are covered above the shoes
  - no other pair gains pleats, jetted pockets or a plastic button

  The shared tests also cover this pair: the layering test under every waist-covering top, the outerwear coverage tests, and the shoe tests with every pair of shoes.
- `npm run build` succeeds. The outfit builds in about 0.18 s, like the other wide pairs.
- Rendered in headless Chromium from the front, a slight turn and the back, with the stripe polo and without a top, over the cow print slides. Compared side by side with the photos. Not yet seen by the user.

## The line where the hips meet the legs

On these pale trousers the user saw a horizontal band across both thighs where the hips meet the legs, and asked for it to be fixed for every pair. It came from the shared jeans template and showed on every pair (most on pale fabric). There were two causes:

- **Shading.** Just above the crotch the hips' surface turns to meet the legs' outline, so it faced a little down at the front and back of the thighs and a little up at the sides, while the legs hang straight. Only the hips' bottom row took the legs' direction, so the light changed in one step. Now the hips' normals blend into the legs' over 0.06 above the crotch. The shapes are unchanged.
- **A hairline crack.** The hips stopped exactly at the crotch, just inside the legs' top edge, and from her slightly-above eye line the gap showed what was behind as a fine broken line (on the Levi's '94, specks of her cream body). The hips now carry on 0.015 below the crotch, hidden inside the legs.

Measured on renders, the sharpest brightness step down these trousers' thighs at the join fell from 5 to 9 levels to under 2, and the crack is gone on every pair. Built side by side with main, every outfit is identical apart from the trousers' hips: no stitching, pocket, top, shoe, jacket or dress moved.

## Known differences

- The composition and how the user wears them (rise, length) are not known.
- The pleats are a soft ridge with a shadow line: the hips' surface is too coarse for a crisp fold, and the photos' pleat volume over the thighs is not modelled.
- Drape and wrinkles are procedural; linen's characteristic creasing is not modelled.
