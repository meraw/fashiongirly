# Wardrobe item: Zara elastic-waist cargo trousers

Authored 8 October 2026. Status: the user said they “look fine”; approved: the user merged it, and merging means approved (their rule). A piece from the user's wardrobe list and the first bottom that is not jeans; built on the shared jeans template, extended for it.

## Source and reference reading

The user sent three phone screenshots of a resale listing on zara.com (“Pantaloni cargo con vita elasticizzata”, black, size M, new with tags), with no text: a front flat lay, a back flat lay and a front close-up. The listing says the waist is elastic and adjustable with a drawstring, and the trousers are light and cool. Photos are not stored in the repository.

Features read from the photos:

- A deep gathered elastic waistband with a black drawstring ending in metal tips.
- Black, light woven fabric with a fine crinkle and a soft sheen.
- Relaxed legs tapering to gathered elastic cuffs at the ankle, the fabric blousing over them.
- Slanted side pockets at the front.
- Cargo patch pockets with plain flaps on both outer thighs, over the side seams.
- A plain back with a centre seam and no back pockets.
- Tonal stitching; no belt loops, button, fly, rivets or label.

## Implementation

Catalog ID `zara-cargo-joggers-v1` (slot `bottom`), built by `makeJeans()` with the sewn crotch construction. The waistband sits high, at her waist (1.25 to 1.32). The legs taper to elastic cuffs at her ankle (0.24 to 0.285), above the loafers; over the Buffalo boots the cuffs sit on the padded collar.

The jeans template's hardware is now optional, so trousers can leave it out: belt loops, the button, the fly, front pockets, back pockets, the centre-back seam and the label patch are each drawn only when the spec has them. New options, all off by default (the other pairs' geometry is unchanged, and their material is the same denim):

- `surface`: fabric finish. Denim by default; here a smoother woven with a soft sheen and no twill bump.
- `waistband.gathers`: an elastic waistband gathered into vertical ripples, fullest mid-band.
- `drawstring`: cords from two eyelets at the front, lying against the trousers, with metal tips.
- `cuff`: an elastic cuff gathered into ripples round the ankle. The leg rows make the fabric blouse over it, light stacked folds gather above it, and `hemStitch` marks the cuff's top seam.
- `sidePocket.flap`: a flap over each cargo pocket, a little wider than it and standing off it, with a stitched edge and a shadow line below.
- `centreFront`: a plain centre-front seam in place of a fly.

## Fabric and colour

The swatch comes from a plain area of the close-up, clear of the pocket edge and drawstring. Larger wrinkles from the photo repeated as a diagonal pattern, so only the fine crinkle is kept (a narrow blur divided out), at 80 % contrast and with its colour from the measured average. Stored as WebP in `src/wardrobe/zara-cargo-fabric.js`.

Plain fabric in the flat lay measures about RGB 49, 52, 57, and 56, 58, 61 in the close-up's shade. The first render, from a swatch of 32, 34, 40 with a stronger sheen, was 61, 59, 62 and read as grey satin. With a swatch of 26, 29, 37 and less sheen, front and back measure 48, 48, 53: blue-black, as in the photos.

## Checks

- `npm test`: 50 passing after merging the other chats' windbreaker, green cable sweater and cow print slides. A new test checks:
  - none of the jeans hardware is present
  - the cargo flaps and pockets
  - the drawstring is at the front, with its tips
  - the waistband is gathered
  - ankle length above the shoes, with her legs and socks covered down to the hem

  The existing tests also cover this pair:
  - the layering test under every waist-covering top (the drawstring clears them all)
  - the shoe tests, with every pair of shoes
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, without a top, under the crochet top and with the Lacroix sweater and Buffalo boots. Compared side by side with the flat lays. The user saw these renders and said the trousers look fine.

## Known differences

- How the user wears the waist and cuffs is not yet known; the length follows the photos' cuffed ankle.
- The cargo pockets' size and placement are read from flat lays, which flatten them.
- The crinkle is a fine texture and the drape is procedural; there are no real wrinkles.
- The drawstring hangs straight, without the knot or loose loops of the photo.
- Fixed 9 October 2026 for every pair: the line where the hips met the legs is gone (see [the pleated linen trousers](pleated-linen-wide-trousers.md#the-line-where-the-hips-meet-the-legs)).
