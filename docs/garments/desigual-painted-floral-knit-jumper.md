# Wardrobe item: Desigual painted floral fine-knit jumper

Authored 9 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved. A knit on the `printed-long-tee` template, which gains rib bands for it.

## Source and reference reading

The user sent three product photos without a description:

- the front on a model, with light blue wide jeans;
- the back on a model;
- a close-up of the neck, shoulder and print.

The photos are not stored in the repository. No brand shows; the product photos match Desigual's shop, like the user's other Desigual items, so it is recorded as likely Desigual.

Features read from the photos:

- A fitted, fine-gauge crew-neck jumper on a black ground.
- **The print:** big soft flowers all over, knitted in as a jacquard:
  - pastel pink, cream, lilac white, mint, light blue and royal blue, with flecks of ochre;
  - every colour sits in whole stitches, so the flowers' edges break up into scattered stitches and spray, with black stitches flecked into them;
  - on the front, a pink flower on the chest over a cream flower crossed by a dark stippled fringe, a mint flower beside them, lilac white and blue round the neck and left shoulder, and black at her left shoulder and the lower front;
  - on the back, pink over cream and mint, blue to one side;
  - on the sleeves, blue, white, mint and cream flowers; her left sleeve is black above the elbow.
- A fine rib crew neckband, the print running on into it.
- Long fitted sleeves into long fine rib cuffs at the wrist.
- Cropped at the waist on a fine rib hem band, which the print runs into in stripes. It sits on the jeans' waistband.

Colours, measured on the front photo by hue:

- black (26, 29, 37), about a third;
- pink (225, 192, 213);
- cream (210, 204, 188);
- lilac white (214, 209, 215);
- mint (163, 194, 198);
- light blue (118, 146, 196);
- royal blue (16, 42, 96);
- whole-area average (131, 131, 138).

## Implementation

Catalog ID `desigual-painted-floral-knit-jumper-v1`, in its own file, `src/wardrobe/garments/desigual-painted-floral-knit-jumper-v1.js`, with its study preset. It is built by `makePrintedLongTee()` in `src/doll/printed-long-tee.js` from the entry's `build` spec.

**New template options.** All are optional and the other tees use none of them. A fingerprint of every vertex and texture of every other top, with and without the skirt, is identical before and after the change.

- `print.draw: 'painted-floral'` knits the flowers in, in the new `src/doll/painted-floral-print.js`.
- `body.ribNeck` (a rib count) knits the neckband in the body's print, ribbed.
- `body.band` (`rows`, `ribs`) adds a rib hem band in place of the turned hem.
- `sleeve.cuff` (`rows`, `ribs`) adds rib cuffs in place of the turned cuffs.
- The print runs on into every rib band, drawn out down its ribs as a knitted print is. The rows at the print's edges are averaged over the stitches round them, so a single stitch doesn't streak down a rib.

**The print** (`painted-floral-print.js`):

- Each flower is placed as on the photos, by its centre, radius, colours and shape, listed in the garment file for the front, the back and each sleeve.
- A flower is a soft blob with lobed petals and a ragged, spiky rim, pushed about by a gentle warp.
- Its colour fades from its ink to an edge colour, with paler patches. The cream flowers have a band of black stitches across their top, the dark fringe in the photos.
- **Knitted:** the colours are worked out stitch by stitch (0.0035 world units, about 4.5 pixels), each stitch one colour, shaded a little darker at its sides. Toward a flower's rim, stitches drop out at random and others scatter beyond it as spray, and black stitches fleck in.
- The ochre is thinned to speckles.

**Shape:**

- The Mickey tee's fitted body and sleeves.
- The body ends at 1.31 on a rib hem band down to 1.235, at the top of her jeans.
- A rib crew neckband.
- The sleeves run to 0.448 down the arm (the shared sleeve test's line), with long rib cuffs to her wrist that ease over her hand.

**Colours:** calibrated in studio renders. Rendered on the front:

- black (27, 26, 31);
- pink (217, 180, 202);
- cream (211, 203, 187);
- lilac white (216, 208, 215);
- mint (183, 212, 213);
- light blue (95, 125, 188);
- royal blue (41, 67, 130);
- average (129, 129, 135) against the photo's (131, 131, 138).

**Preset:** “Painted floral jumper study”, over the light Stradivarius relaxed jeans with the cream 550s, as the photos pair it with light blue wide jeans.

## Layering

- **Cropped:** it ends at the top of her jeans. It doesn't cover the waistband, so the waistband test doesn't apply.
- **Over the skirt:** it ends at the skirt's waistband, and the bow shows.
- **Under outerwear:** the shared outerwear tests run on it; a jacket hides its sleeves, as for every top.
- **Not offered:** with the classic striped shirt and knit layers.

## Styling facts

Fitted and cropped at the waist, in big soft pastel flowers knitted in on black. Crew neck, long sleeves with rib cuffs. Warmth 2 of 4, inferred: a fine, thin knit with long sleeves. Mild or cool days, or under a jacket.

## Checks

- `npm test`: 117 passing.
- The new `tests/painted-floral-jumper.test.js` checks:
  - the parts: rib neckband, hem band and cuffs instead of the turned hem and cuffs;
  - the print: a black ground with pink, cream, mint and royal blue flowers on the front and the back;
  - knitted in: colours change only between stitches;
  - the rib bands carry the print and are ribbed;
  - the cuffs reach her wrist;
  - the hem ends at the top of her jeans, and the bow shows over the skirt;
  - the Mickey tee keeps its turned hem and cuffs.
- The shared sleeve, hand, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, over the jeans and with the skirt. No device check.

## Known differences

- The print is redrawn in code as soft blobs at the photos' places; the real print is a photographic flower image knitted in, with petals and more detail.
- The flowers' shapes are rounder and their edges more even than the real ones.
- The rendered mint is a little paler and the royal blue lighter than in the photos.
