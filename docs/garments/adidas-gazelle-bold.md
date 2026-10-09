# Wardrobe item: adidas Gazelle Bold cream and green platform sneakers

Authored 9 October 2026. Status: first version; approved: the user merged it, and merging means approved (their rule).

## Source and reference reading

The user sent five product photos without a description: the outer side, a front three-quarter, the top, the sole and a back three-quarter. The GAZELLE lettering and the sole's branding identify them. The photos are not stored in the repository.

Features read from the photos:

- A low sneaker with a cream (off-white) suede upper.
- Three green leather stripes on each side, slanting forward from the sole to the eyestays, with serrated gold-stitched edges.
- A green leather heel tab with a gold-stitched edge.
- A shaggy (hairy) beige suede toe cap and tongue.
- Gold foil GAZELLE lettering on the outer side, parallel to the stripes.
- Cream eyestays with punched eyelets and beige flat laces; a cream leather collar lining.
- A green insole and a yellow tongue label under the laces.
- A tall three-tier gum platform: two honey tiers over a darker brown one, each rounded, with grooves between them. It is about a sixth of the shoe's length high.

Measured on the outer side photo, the cream suede is about RGB 216, 211, 198.

## Implementation

Catalog ID `adidas-gazelle-bold-cream-green-v1` (slot `shoes`), template `sneaker`, built by the laced-shoe builder (`makeLugBoot()` in `src/doll/model.js`) from its catalog `build` spec.

**New template options.** All are optional and off by default. The other shoes are unchanged: every outfit that `main` can build was built on `main` and on this branch and compared, with no difference in geometry, materials or textures.

- `sole.tiers`: a stacked platform of separate rounded tiers, each `{ to, colour }` from the floor up, in place of the lug sole. Each tier bulges a little at its middle, so grooves show between them, and follows the sole's toe lift.
- `edgedStripes`: leather strips across both sides, each along a `[z, y]` centre line from the sole to the lacing, with serrated metallic edges. Its own name keeps it apart from the Superstar's suede `stripes` and the Campus 00s' `leatherStripes` (in its PR at the time), which are built differently; the user chose the separate name.
- `lettering`: a row of small foil marks along a `[z, y]` line on the outer side only.
- `colours.shaggyTongue`: a tongue in shaggy suede with a deeper nap, in that colour. It is separate from the New Balance 550's `colours.tongue` (a plain tongue). `colours.label` colours the tongue label.
- Panels: the New Balance 550's `leather: true` panels now also work on a suede shoe, where they are smooth leather. Panels can be shaggy suede (`fuzz`, the nap depth) and have their own thread colour (`thread`). Besides the 550's `stitch: false` (no stitching), they can be stitched along their bottom edge (`stitch: 'bottom'`). A panel that wraps over the top of the toe (`wrap`) stands off along the surface's own normal. Like the 550's leather panels, the heel tab is turned to face out of the shoe on both halves.

**Shape:**

- The platform's top is at 0.101, inside her foot height, so she is not raised. The tiers end at 0.049, 0.076 and 0.101.
- A low collar (front 0.235, sides 0.19, back 0.255) below her ankle bone, so her socks show. Like the UGG and Superstar sneakers, the shoe brings its own slim ankle socks in place of her round doll socks.
- Six eyelets a side up the lacing, from 0.15 to 0.222.
- The heel tab is a leather panel stitched along its bottom edge in gold. The toe cap is a shaggy panel over the front sixth of the shoe, following the toe's own surface without stitching.

**Preset:** "Gazelle Bold study", with the green cable sweater and the Davinia jeans.

## Colour

Colours were calibrated against renders of the outer side. The first render's upper came out greyer and darker (194, 186, 175) than the photo, so the suede was lightened. The green stripes and heel tab came out minty, so the leather was darkened to `#25503f`. In the final render the cream upper by the heel measures about 218, 208, 184 and the heel tab 72, 112, 101.

## Styling facts

A low sneaker on a tall stacked platform; cream, forest green and gold on a gum sole. Warmth 2 of 4, inferred from a closed suede sneaker. Dry days; suede and the pale upper will mark in rain or mud (inferred).

## Checks

- `npm test`: 80 passing after merging `main`. A new test in `tests/shoes.test.js` checks:
  - the parts, and that the lug sole, plain heel tab and pull loop are absent;
  - three tiers per shoe stacked from the floor to the sole's top;
  - three stripes on each side of each shoe;
  - the lettering only on the outer side (it fails when the lettering is put on both sides);
  - smooth leather stripes and heel tab, and a shaggy toe cap with a deeper nap than the eyestays;
  - that she is not raised;
  - that her doll socks are hidden, her legs stay inside the ankle socks and the ankle socks sit inside the shoe.

  The shared shoes test checks every bottom over these shoes.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from both sides, the front, a turn and the back, with the Davinia jeans. Compared with the photos. Not yet seen by the user. No device check.

## Known differences

- The GAZELLE lettering is drawn as gold foil marks without letters.
- The sole branding and tread pattern are not modelled.
- The shaggy suede is suggested by its colour and a deeper nap, without loose fibres.
- The laces are the template's round laces, thicker than the real flat laces.
