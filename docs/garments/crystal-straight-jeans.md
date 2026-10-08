# Wardrobe item: crystal-embellished straight jeans

Authored 8 October 2026. Status: crystals made larger and clearer after the user's first review; the user said the revision “looks great”. A piece from the user's wardrobe list, built on the shared jeans template. The user asked to “notice the embellishments”.

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
- Each crystal is a small faceted stud, turned at random and tilted to the surface, sitting in a dark setting (see the revision below). The crystals and the settings are each one instanced mesh (about 7,600 of each).
- The crystals are larger and about 2.5 times wider-spaced than the real ones, so they stay visible at the app's size. The real spacing would need over 40,000 crystals.

The shared layering test now also checks instanced pieces at every copy, so the crystals are checked under every waist-covering top like the rest of the jeans. Lifting the crystals off the surface makes it fail.

## Revision after user feedback

The user found the jeans a very good, realistic representation, but could not see the crystals clearly on a computer screen, let alone in the app on a phone. The first version had about 15,000 small grey metallic studs, 0.0085 apart; at normal viewing size they blurred into the denim. Now:

- About 7,600 crystals, 0.012 apart, nearly twice the size.
- The crystals are near-white and glossy with a slight glow, so they stay bright on the side away from the light. Each catches a different amount of light, so the grid sparkles.
- Each sits in a dark blue-grey setting, as in the close-up. The contrast between crystal and setting is what keeps the grid readable at a distance.
- A first, larger, neutral grey setting turned the front grey; the setting is now smaller and bluer, so the jeans stay light blue.

The grid was checked at phone size (390 × 844 viewport, as on a phone screen), where it reads clearly.

## Denim and colour

The swatch comes from the plain back of the lower legs in the back photo. Two earlier crops caught the leg's creases, which repeated as diagonal streaks. The swatch keeps only fine grain (a narrow blur divided out) and is stored as WebP in `src/wardrobe/crystal-jeans-denim.js`.

Plain denim in the back photo measures RGB 162, 175, 183 where lit and 131, 145, 154 in shade. The front of the flat lay, crystals included, measures about 142, 159, 166. The first render, from a swatch of 128, 140, 150, was 183, 187, 189 (too pale and grey). With a swatch of 104, 121, 137, the back measures 155, 169, 179; the front, with the larger crystals and settings, measures 165, 176, 188 on average.

## Checks

- `npm test`: 58 passing after rebasing onto the other chats' latest garments. A new test checks:
  - the crystal count, each with its own setting
  - that every crystal is on the front and below the waistband
  - that both legs are covered evenly down toward the hem
  - the coin pocket, abrasion, patch and back pockets
  - full length over the shoes

  The shared layering test now covers the crystals under every waist-covering top.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, without a top, under the crochet top and with the green cable sweater and cow print slides; compared side by side with the flat lay, the back photo and the waist close-up. The user has not yet seen it.

## Known differences

- The crystals are larger and wider-spaced than the real ones.
- The darker indigo round the fly and the pocket corners is not reproduced.
- The leather patch carries no lettering.
- A faint line remains where the hips meet the legs.
