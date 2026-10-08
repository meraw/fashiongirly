# Wardrobe item: Mango washed black jeans

Authored 8 October 2026. Status: first interpretation awaiting the user's visual review. Seventh piece from the user's wardrobe list, built on the shared jeans template.

## Source and reference reading

The pair is old, so the user could only find eBay listing photos: a back flat lay on a wooden floor (sent twice), a front waist close-up, a front pocket close-up and a front flat lay on grey carpet. The eBay photos are flash-lit and the floor photo is warm-lit. Photos are not stored in the repository.

Features read from the photos:

- MNG Denim (Mango), size 38; high rise.
- Relaxed straight legs tapering slightly to an ankle-length hem.
- Charcoal washed black with a fine mottled stone-wash, paler on the thighs and along the seams.
- Five-pocket front with copper rivets (including the coin pocket) and a silver button.
- Distinctive light grey double topstitching on the outseams, inseams, back pockets, front pockets, fly, waistband and hem, with the seams bleached paler around it.
- Back: plain patch pockets with a short dart above each instead of a pointed yoke, and a black leather patch on the waistband.

The listing tags are not part of the jeans.

## Implementation

Catalog ID `mango-washed-black-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. Waistband 1.26 to 1.31; legs from 0.155 at the thigh to 0.137 at the hem (y 0.24), above the loafers.

- New template option: `backDarts` (short darts from the waistband toward the pockets). `backYoke` is now optional.
- Denim: a swatch from the front flat lay (the left lower leg, clear of the inseam; a first crop included its stitching). The stone-wash speckle is real fabric texture, so it is kept, at 65 % contrast because flash exaggerates it, and repeated about seven times around the leg; a first, larger scale looked coarse and blotchy.
- Colour: plain denim measures RGB 79, 79, 77 in the flash-lit flat lay and 67, 70, 68 in the floor photo; target about 70, 71, 70. The first render was 79, 75, 69 (warm under the studio light), then 61, 65, 66 (slightly teal); with a neutral, cooler swatch the front render measures 73, 73, 71.

## Light stitching (user request)

The user asked for the pair's “pretty peculiar lighter stitching” so they can recognise it. New jeans template options, all off by default (the other five pairs were checked identical vertex by vertex):

- `stitchScale`: heavier topstitching (1.3 here).
- `doubleSeams`: a second row on the outseam, inseam, fly and back pockets, plus a two-row band across each back pocket's top edge.
- `roping`: stronger pale wear along the seams and hem (2.6 here).
- `hemStitch`: a ring of stitching just above the hem.
- `dartsStitched`: back darts drawn in the thread colour.

The thread is a light grey (`#787676`; a paler grey read as white under the studio light). The back pockets were also moved up and made a little narrower to match the back photo; lower down they curled around her seat.

## Checks

- `npm test`: 26 passing after merging the tops chat's stripe jumper. A new test checks the back darts (and no yoke), rivets, patch and pockets, ankle length above the shoes, and that her legs and socks stay covered. The layering test covers this pair under every waist-covering top automatically.
- `npm run build` succeeds.
- Rendered in headless Chromium from four angles, without a top, and under every top and the skirt; compared side by side with the flat lay and back photos. The user has not yet seen it.

## Known differences

- The stone-wash repeats; the paler seams and thighs are subtler than in the photos.
- The patch carries no lettering.
- A faint line remains where the hips meet the legs.
