# Wardrobe item: Converse Chuck Taylor Modern Lift high-tops (cream)

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The first high-top sneaker.

## Source and reference reading

The user sent five phone screenshots of a decathlon.it product gallery: the outer side, the inner side, a pair from the front and a top view (twice). The screenshots are not stored in the repository.

Features read from the screenshots:

- A monochrome cream (egret) canvas high-top on a stacked platform about a quarter of the shoe's height. The platform has three layers with shallow grooves between them and fine tonal stitch lines round it, and the toe bumper rises a little higher.
- Seven silver eyelets a side up the lacing, with cream flat laces.
- A round tonal ankle patch with an embossed star on the inner side, and two small vent eyelets low on the inner side.
- A rubber toe cap in the sole's cream, wrapping the front of the toe from the sole up to about half the toe box's height.
- A rounded toe and a padded collar.

Measured on the outer side: canvas about (230, 227, 217) and the sole a slightly yellower (226, 223, 207); the inner quarter (224, 223, 211) and the patch (227, 225, 217). From the side photo, the collar is about two thirds of the shoe's length high.

## Implementation

Catalog ID `converse-modern-lift-hi-egret-v1` (slot `shoes`), template `sneaker`, built by the laced-shoe builder (`makeLugBoot()` in `src/doll/model.js`) from its catalog `build` spec.

**New template options.** All are optional, and the shoes that don't set them are unchanged: the Buffalo boots, UGG sneakers, loafers and slides fingerprint identical (same vertex hash and part count) before and after the change.

- `sole.ribs`: heights where a stacked platform shows a shallow groove between its layers (plain soles only).
- `sole.stitches`: heights of stitch lines round the sole, following its toe lift.
- `anklePatch`: `{ at: [z, y], r }`, a round patch on the inner side with an embossed ring and star. It is corrected for the outfit's vertical scale, so it stays round.
- `vents`: `[[z, y], ...]`, small metal vent eyelets with dark holes on the inner side.
- `coversSocks`: a shoe that covers her socks completely hides them, as the UGG pair's own ankle socks do.
- `rubber` on a panel: made of the sole's rubber, with a rolled edge instead of stitching (for a toe cap), and turned to face out of the shoe. Panels without it are unchanged.

**Shape:**

- The platform's top is at 0.105, flat, inside her foot height, so she is not raised. The rand rises to 0.118 at the toe.
- The canvas upper has a long rounded toe box, the lacing climbs from 0.175 to 0.325, and a straight shaft rises to the collar (front 0.38, sides 0.395, back 0.41).
- The rubber toe cap (a `rubber` panel) wraps the front of the toe from the sole, starting about a third of the way back along the foot and rising to about half the toe box's height at the tip, with a rolled edge. Setting panels also gives it the template's tonal eyestay strips beside the lacing.
- The shaft narrows to hug her leg, about 0.17 front to back near the collar, so her leg does not come out of a loose opening. The UGG sneakers' first version had that problem.

**Layering with bottoms.** These are shoe-side settings; no trouser code changed.

- From 0.265 up, the shaft stays inside the classic jeans' cuff, so their cuff falls over the high-top as jeans bunch over real ones. The lacing climbs steeply enough for this, and the shaft front sits far enough back that the laces stay inside the cuff too.
- Long hems rest on the vamp no higher than 0.18, below the lacing (`restCap`). Above that they drape round the shoe with 0.05 of clearance for the laces and bow (`drapeClear`).
- Slim cropped hems (the Davinia jeans) sit on the collar.

**Preset:** "Converse high-tops study", with the stripe polo and the black wide crop jeans.

## Styling facts

A chunky high-top on a stacked platform, all cream, plain and tonal; closed, over the ankle. Warmth 2 of 4, inferred from the closed canvas high-top. Dry mild days; canvas is not waterproof.

## Revision after the user's first look

The user pointed out the missing rubber toe cap, "that strip of material in front of the shoe that is the same color as the sole, typical of Converse shoes". It was added as a rubber panel; a first, lower cap hardly showed from the side, so it was made taller and longer.

The user then saw that it "only takes up half of the shoe instead of being a whole rubber toe cap". On one side of each foot the panel's grid came out wound inside-out, so that half was lit like the inside of the shoe and read as canvas. Rubber panels are now turned to face outward, and the test checks every half. The cap is now one continuous rubber cap across the whole toe.

## Checks

- `npm test`: 76 passing after merging `main`. The new test checks:
  - the parts, including the toe cap, seven eyelets a side, two vent eyelets and an ankle patch per shoe, and two stitch lines per sole;
  - the grooves between the platform layers;
  - the patch and vents on the inner side of each foot;
  - that she is not raised;
  - that her socks are hidden;
  - that her leg stays inside the shaft up to the collar;
  - that the shaft hugs her leg;
  - that the Buffalo boots and UGG sneakers don't carry the new parts.

  The shared shoes test checks every bottom over these shoes: no part of the shoe pokes through any pair.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, with the half-zip dress (bare legs), the classic jeans and the black wide crop jeans. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- On her short legs the shaft reads as a little low; it ends just above her ankle.
- The laces are the template's round laces, thicker than the real flat laces.
- The patch carries no lettering; the heel label and insole logo are not modelled.
- The real platform may be a little taller than her foot height allows without raising her.
