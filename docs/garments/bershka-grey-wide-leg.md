# Wardrobe item: Bershka grey wide-leg jeans

Authored 8 October 2026. Status: first interpretation; the user sent the next pair without commenting on it; approved: the user merged it, and merging means approved (their rule). A piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The user sent five phone screenshots of the product gallery, with no text: a close front view on a model, the full front on a model, the back on a model, a waist close-up and a front flat lay. Photos are not stored in the repository.

Features read from the photos:

- Wide straight legs, full length, resting on the shoes; a mid rise sitting just below the waist.
- Mid grey wash, a neutral grey with a fine crinkled texture.
- A strong wash pattern: pale bleached panels down the middle of each thigh and knee, darker toward the side seams and the hem, and bold pale whiskers across the hips and the top of the thighs, at the front and also under the seat at the back.
- Five-pocket front with scoop pockets, a coin pocket, a silver button and rivets; tonal grey stitching.
- Back: yoke, centre-back seam, plain patch pockets and a small woven label on the waistband.

The tops and red trainers in the photos are styling.

## Implementation

Catalog ID `bershka-grey-wide-leg-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. Waistband 1.21 to 1.26; legs widen gently from 0.18 at the thigh to 0.196 at the hem and reach the floor, rising over the loafers.

- New jeans template options, off by default (the other six pairs were checked identical vertex by vertex):
  - `whiskerLines`: where the whiskers fall, how many there are, how wide they are and whether they also cross the back. The default is the earlier faint set.
  - `centreFade`: a bleached panel down the middle of each leg, front and back, fading toward the side seams and away from its peak height.
- The whiskers and fade are shaded on the geometry, so the swatch itself stays an even grey and does not repeat the fade around the leg.
- Denim: a swatch from the flat lay (the lower left leg, inside its seams), flat-lit by dividing by a blur of itself, made seamless and stored as WebP in `src/wardrobe/bershka-grey-denim.js`.

## Colour calibration

Plain denim in the flat lay measures RGB 106, 104, 100: a neutral grey. Renders were measured on the same areas of the legs:

| Swatch texel mean | Front render | Back render | Reading |
| --- | --- | --- | --- |
| 76, 76, 77 | 145, 131, 123 | | warm and light (that run's measure areas also caught background) |
| 62, 65, 72 | 113, 102, 103 | | blue slate |
| 70, 70, 71 | 127, 112, 105 | 120, 114, 109 | brownish |
| 58, 65, 68 | 109, 104, 100 | 100, 106, 103 | matches by number but looks teal beside the cream background |
| 61, 64, 65 | 114, 102, 96 | 105, 104, 99 | neutral grey |

The studio light warms and brightens the denim, so the swatch is set cooler and darker than the photo. With the final fade and whisker strength the front measures 120, 109, 103, and the brightest tenth of the legs reaches 140 against the photo's 151: the panels are lighter than the plain denim, as in the photos.

## Checks

- `npm test`: 28 passing after merging the tops chat's pointelle jumper. A new test checks the pockets, rivets, yoke and label, full length over the shoes, that the legs stay apart, and that the middle of each thigh is paler than its sides. It fails without the centre fade. The layering test covers this pair under every waist-covering top automatically.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front and back without a top; compared side by side with the flat lay and back photos. The user has not yet seen it.

## Known differences

- The whiskers are evenly spaced curves; real whiskers are irregular.
- The fade is symmetrical on both legs.
- The woven label carries no lettering.
- Folds are procedural, and her short legs make the wide cut read fuller than on the model.
