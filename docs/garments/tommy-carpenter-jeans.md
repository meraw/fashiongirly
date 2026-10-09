# Wardrobe item: Tommy Jeans Remastered carpenter jeans

Authored 8 October 2026. Status: narrowed and shortened to the ankle after the user's first review; the user then sent the next item without commenting on the revision; approved: the user merged it, and merging means approved (their rule). A piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The user sent five phone screenshots of an ASOS listing (“Tommy Jeans Remastered carpenter jeans in black wash”, out of stock), with no text: the front on a model twice, a side close-up, a front waist close-up and the back. Photos are not stored in the repository.

Features read from the photos:

- Mid rise; relaxed wide straight legs, full length, resting on the shoes.
- Even black wash.
- White double topstitching throughout: waistband, fly, pockets, panels, outseams and hem.
- Large carpenter panels over the front hips, from the waistband down to the crotch, with the scoop pockets above them.
- Big utility patch pockets on both outer thighs, wrapping round the side seam. The wearer's left one carries a red, white and navy Tommy flag badge.
- A hammer loop on the wearer's right thigh, above its side pocket.
- Silver button and rivets.
- Back: yoke, centre-back seam, patch pockets, and a red, white and navy tape sewn diagonally across the wearer's right pocket.
- A tonal grey flag patch on the back waistband.

The Tommy boxer waistband showing above the jeans, the bra top and the chequered trainers are styling. No coin pocket was visible.

## Implementation

Catalog ID `tommy-remastered-carpenter-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. Waistband 1.21 to 1.26; relaxed straight legs, ending at her ankle (see the revision below).

New jeans template options, off by default. Other pairs are unaffected: every new step is guarded by its spec field, and rivets stay copper unless a colour is given.

- `frontPanel`: a patch over each front hip with its stitching rows, given for the wearer's left and mirrored.
- `sidePocket`: utility pockets wrapped round each outer thigh across the side seam, with a stitched outline, a two-row hemmed top, an optional flag badge on one side and an optional hammer loop (a strap bowing away from the leg) on the other.
- `backPocket.tape`: a striped tape across one back pocket, trimmed to the pocket's outline.
- `rivetColour`: silver rivets here.

The white double stitching uses the Mango pair's `doubleSeams` and `hemStitch` options at normal thickness; heavier stitching looked much bolder than in the photos. The side pockets first sat so close to the side seam that its stitching showed through them; they now stand clear of it.

## Revision after user feedback

The user found the legs a little too wide and said the jeans stop at their ankle. The first version followed the photos' wide, full-length legs (0.18 at the thigh widening to 0.19 at the floor, resting on the shoes). The legs are now relaxed and straight, slightly tapered (0.154 at the thigh to 0.145 at the hem), and end at her ankle (0.24), above the loafers. Over the Buffalo boots the hem now sits on the padded collar, as the other ankle-length pairs do. The stacked folds at the hem were removed.

## Denim and colour

The swatch comes from inside the front panel in the waist close-up, the cleanest plain area. The photos are so dark that their JPEG compression shows as coloured blotches when the contrast is raised, so the swatch keeps only the photo's brightness variation (twill and grain) and takes its colour from the measured average. It repeats often because the close-up is zoomed in. Stored as WebP in `src/wardrobe/tommy-carpenter-denim.js`.

Plain denim in the photos measures about RGB 16, 15, 17 (side close-up) and 14, 13, 15 (waist close-up), and 28, 25, 30 where the panel catches the light. The first render, from a swatch of 22, 21, 25, was far too light (median brightness 29, a dark grey). With a swatch of 11, 10, 14 the legs' median brightness is 20: black, as in the photos.

## Checks

- `npm test`: 41 passing after merging the tops chat's Lacroix sweater. A new test checks ankle length above the shoes, that her legs and socks stay covered down to the hem, the panels, pockets and stripes, that the badge is on the left thigh, the hammer loop on the right and the tape on the right back pocket inside its outline, and that each side pocket covers the side seam's stitching. The layering test covers this pair under every waist-covering top, and the shoe tests cover it with every pair of shoes.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, without a top, under the crochet top and with the silver cable jumper and Buffalo boots; compared side by side with the front and back photos. The user has not yet seen it.

## Known differences

- The badges and patches are colour blocks without lettering.
- The fly's bar tacks are not modelled.
- The back pockets have rounded bottoms rather than the photo's slight point.
- Fixed 9 October 2026 for every pair: the line where the hips met the legs is gone (see [the pleated linen trousers](pleated-linen-wide-trousers.md#the-line-where-the-hips-meet-the-legs)).
