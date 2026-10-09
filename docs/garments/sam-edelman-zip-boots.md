# Wardrobe item: black front-zip lug-sole ankle boots

Authored 9 October 2026. Status: first version, awaiting the user's visual review. Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent three product photos without a description: the pair from the front three-quarter, a close-up of the zip and the back, and the outer side. The brand is not stated. The double-E logo on the zip pull and on the back hardware suggests Sam Edelman. The photos are not stored in the repository.

Features read from the photos:

- Smooth, softly glossy black leather ankle boot with a round toe. The shaft is straight and comes a little above the ankle bone.
- A centre-front zip in a raised leather placket, double-stitched either side, running from the toe cap up to the collar. The pull is a leather tab with a small metal double-E logo.
- A toe cap seam across the toe, a diagonal panel seam across each side, and a curved heel counter seam.
- A leather pull tab at the back of the collar, with a small metal logo bar beside it.
- A thin stitched leather welt on a chunky black rubber lug sole, with deep wedge lugs and a slightly raised heel.

Measured colours (outer side photo): leather about RGB 40, 36, 34; rubber sidewall about 52, 51, 49.

## Implementation

Catalog ID `sam-edelman-front-zip-lug-boot-v1` (slot `shoes`). It is built by the existing lug-boot template (`makeLugBoot()` in `src/doll/model.js`) from the `build` spec in its catalog entry.

**Template changes (additive).** New spec options, each off unless a spec sets it:

- `finish: 'leather'`: smooth glossy leather (a clearcoat and a faint grain) instead of nubuck.
- `zip`: a raised leather placket from `from` up to the collar, with metal teeth, double stitching either side, a slider, and a leather pull with a small metal logo. A boot with a zip has no tongue, eyelets or laces.
- `toeCap`: a seam across the toe, meeting over the top at height `y`, with double stitching.
- `seams`: panel seams on both sides, as [z, y] paths, each a slight ridge with a row of stitching.
- `backHardware`: a small metal bar beside the pull tab.

It reuses the template's existing plain lug sole and `pullLoop`. The Buffalo boots and the UGG sneakers render pixel-identical to `main` before and after the change: front and side views, with cropped and with long jeans.

**Shape.**
- **Proportions:** measured on the side photo: a long, low toe whose top rises in a smooth curve to a straight shaft. The boot is about three quarters as tall as it is long.
- **Sole:** lower than the Buffalo platform. The first version's sole took a quarter of the boot's height, against an eighth in the photo, and read as squat; it was lowered and the shaft raised.
- **Shaft:** roomier than the photo's, so it clears her thick doll socks and the classic jeans, which tuck in.
- **Height:** she is not raised: the sole fits inside her normal foot height.

**Preset.** “Zip boots study”: the boots with the cropped Davinia jeans, so the whole boot shows, and the off-shoulder stripe jumper.

## Styling facts

- Chunky, rounded ankle boot; black with gunmetal hardware.
- Plain, with tonal seams and a front zip.
- Smooth leather on a rubber lug sole.
- Warmth 3 of 4, inferred from a closed leather ankle boot (lining unknown): cool or wet days. The lug sole grips; waterproofing is unknown.

## Checks

- New `tests/zip-boots.test.js` checks:
  - its parts: zip placket, teeth, stitching, slider, pull and logo; toe cap; panel seams; pull tab; back hardware
  - that it has no tongue, eyelets or laces
  - the glossy leather
  - that she is not raised
  - that her socks stay inside the shaft. Narrowing the shaft makes this check fail.
- The shared shoe test (every bottom with every shoe) runs on it. It caught the classic jeans' side seam touching the shaft near the top, so the shaft was eased there.
- `npm test`: 68 passing after merging `main` (which added the Blaire sandals); `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the cropped Davinia jeans and the long Levi's. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- On her thick doll legs, the shaft is wider than the real boot's, so it reads chunkier from the front.
- The logo hardware carries no lettering.
- The inner side isn't shown in the photos, so it is built like the outer side.
