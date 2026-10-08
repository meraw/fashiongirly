# Wardrobe item: crystal-embellished straight jeans

Authored 8 October 2026. Status: first interpretation awaiting the user's visual review. A piece from the user's wardrobe list, built on the shared jeans template. The user asked to “notice the embellishments”.

## Source and reference reading

The user sent five phone screenshots of a product gallery (images 2, 4, 5, 6 and 7 of 7): the front on a model, the back on a model, a styled front with a denim shirt, a front flat lay and a waist close-up. No brand was visible. Photos are not stored in the repository.

Features read from the photos:

- Tiny crystals set in a regular square grid over the whole front of both legs and hips, from just below the waistband to the hem, between the side seams and inseams. In the close-up each one reads as a dark setting with a bright sparkle. The waistband, the side panels and the whole back are plain.
- A high rise; straight legs, full length, resting on the shoes.
- A light vintage blue wash, slightly paler on the thighs and darker round the fly.
- Tan topstitching, belt loops with tan bar tacks, a silver button and silver rivets.
- A coin pocket on the wearer's right, with a small worn patch near it.
- Back: yoke, plain patch pockets and a tan leather patch on the wearer's right.

The brown top, the shirt and the platform shoes are styling.

## Implementation

Catalog ID `crystal-straight-jeans-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. Waistband 1.26 to 1.31; straight legs reaching the floor and resting on whatever shoes she wears.

New jeans template option `crystals`, off by default (other pairs are unchanged):

- Crystals are placed by walking the built surface of the hips and each leg ring by ring, every `spacing` along and down the fabric. They follow the folds without any ray casting, so the jeans build as fast as the others.
- Only the front panels are covered: crystals sit within `margin` of the side seams and inseams, start below the waistband, and stop just above the hem.
- Each crystal is a small faceted four-sided stud, turned at random and tilted to the surface, so its facets catch the light differently. All of them are one instanced mesh (about 15,000 crystals, about 60,000 triangles).
- The grid is about 1.7 times wider-spaced than the real one, so it stays visible on her and stays light to draw. The real spacing would need over 40,000 crystals.

The shared layering test now also checks instanced pieces at every copy, so the crystals are checked under every waist-covering top like the rest of the jeans. Lifting the crystals off the surface makes it fail.

## Denim and colour

The swatch comes from the plain back of the lower legs in the back photo. Two earlier crops caught the leg's creases, which repeated as diagonal streaks. The swatch keeps only fine grain (a narrow blur divided out) and is stored as WebP in `src/wardrobe/crystal-jeans-denim.js`.

Plain denim in the back photo measures RGB 162, 175, 183 where lit and 131, 145, 154 in shade. The front of the flat lay, crystals included, measures about 142, 159, 166. The first render, from a swatch of 128, 140, 150, was 183, 187, 189 (too pale and grey). With a swatch of 104, 121, 137, the front measures 160, 171, 179 and the back 155, 169, 179.

## Checks

- `npm test`: 51 passing. A new test checks:
  - the crystal count
  - that every crystal is on the front and below the waistband
  - that both legs are covered evenly down toward the hem
  - the coin pocket, abrasion, patch and back pockets
  - full length over the shoes

  The shared layering test now covers the crystals under every waist-covering top.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, without a top, under the crochet top and with the green cable sweater and cow print slides; compared side by side with the flat lay, the back photo and the waist close-up. The user has not yet seen it.

## Known differences

- The crystal grid is wider-spaced than the real one.
- The darker indigo round the fly and the pocket corners is not reproduced.
- The leather patch carries no lettering.
- A faint line remains where the hips meet the legs.
