# Wardrobe item: Desigual Hawaii patch striped tee

Authored 9 October 2026. Status: first version; approved: the user approves a garment by merging it (their rule), so its own pull request marks it approved, without a separate pull request afterwards. The second tee on the `printed-long-tee` template.

## Source and reference reading

The user sent three product photos without a description:

- the front on a model, with light blue ripped jeans;
- the back on a model;
- the front laid flat.

The photos are not stored in the repository. The neck label and the “DSG” on the patch say Desigual.

Features read from the photos:

- A boxy long-sleeved tee in soft cream slub jersey with fine black horizontal stripes, a little uneven.
- Dropped shoulders. Above the shoulder seam the body's stripes fall down the arm; below it they run round the sleeve.
- A narrow self-striped crew neckband.
- Long relaxed sleeves to the wrist, plainly hemmed.
- A straight hem at the hip, worn untucked.
- **Lettering:** lines of “desigualite” in white blackletter run down the front, cracked and worn through to the stripes. Each line starts at the side seam, and the patch covers the right-hand part of the middle lines.
- **The patch**, sewn on her left front: a photo print of woody wagons in a row under palm trees, with a surfboard on a roof and a maroon “DSG HAWAII” sign. It is framed by sequinned bands:
  - on the left and the top, orange, cream and red fish scales on navy;
  - on the right and the bottom, black bands of red embroidered flowers between boxes of red and gold diagonal stripes;
  - a pink sequin edging all round.
- An embroidered pink rose with red buds and green leaves over the patch's top corner.
- The back is plain stripes.

Colours, measured on the back photo:

- cream about (218, 212, 201);
- black about (49, 40, 37), about a third of the surface;
- whole-area average (164, 157, 149).

The stripes are fine: about 42 from the neck to the hem.

## Implementation

Catalog ID `desigual-hawaii-patch-stripe-tee-v1`, in its own file, `src/wardrobe/garments/desigual-hawaii-patch-stripe-tee-v1.js` (the one-garment-per-file layout; its study preset is in the same file). It is built by `makePrintedLongTee()` in `src/doll/printed-long-tee.js` from the entry's `build` spec.

**New template options.** All are optional and the Mickey tee uses none of them. A fingerprint of every vertex and texture of every other top, with and without the skirt, is identical before and after the change.

- `print.draw: 'stripe-patch'` draws the print in the new `src/doll/stripe-patch-print.js` instead of the scattered stamps.
- `body.tucked`: rows for wearing it tucked into the skirt. Tucked in, it draws no turned hem, which would show above the waistband.
- `sleeve.drop`: how far down the outside of the sleeve the dropped shoulder seam falls. Above it, the stripes run down the arm. The seam curves up to nothing on the inside of the arm.
- `colours.neckband` and `colours.sheen` let the neckband and the sheen differ from the hem band.
- `makeOutfit()` now passes the skirt to the template (its dispatch line only).

**This tee:**

- **Shape:** boxy on the jumpers' dropped-shoulder rows, as relaxed below them as the relaxed shirts. Crew neck at 1.885, hem at the hip (1.11), clearing every waistband. The sleeves are relaxed (about a fifth wider than the Mickey tee's) and end at her wrist, easing over her hand.
- **Stripes:** about 36 down the body, a little fewer than on the tee, so they stay visible on a phone. Each stripe varies a little in width and waves slightly across, and a soft slub shades the jersey.
- **Lettering:** blackletter (textura) lower case drawn with a broad nib held at 40°, so the strokes are heavy down and hairline across, with diamond ends, as written. Fine cracks and worn patches show the stripes through.
  - Six lines down the front, each starting at the side seam and repeating the word along it.
  - Her torso is wider and shorter than the models', so there are fewer lines (six, not eight) with larger letters.
- **Spacing by distance:** the lettering and patch are laid out on a flat canvas of the fabric's width. Each row is mapped round her body by distance across the fabric, so letters keep their width toward the sides.
- **Patch:** a picture redrawn in code:
  - three side-on woody wagons (blue, cream, red) overlapping in a row, with wooden panelling in pale frames, dark windows, wings and wheels;
  - a surfboard on the middle car;
  - two palms, a sky and sand behind;
  - the maroon sign with “DSG” over “HAWAII” in cream.

  It is framed by the bands described above, with sequin glints scattered over them. It sits from just right of her centre front (viewer's left) to well onto her left front, and is wider than tall to suit her torso.
- **Rose:** pink petals in three rings with satin stitch lines, two red buds on stems, and leaves, over the patch's top corner.
- **Colours:** calibrated in studio renders. Rendered on the back: cream (216, 208, 196), black (60, 53, 46) with fine-stripe blur, a dark share of 0.31, and an average of (166, 158, 147) against the photo's (164, 157, 149). The lettering renders near white.
- **Preset:** “Hawaii patch tee study” (the garment file's `study`), over the light blue Tommy mom jeans with the Campus trainers, as the photos pair it with light blue jeans.
- **Build time:** the print takes about 1.3 seconds the first time it is worn, then is shared.

## Layering

- **Over trousers:** it hangs over every waistband (the shared waistband test).
- **Over the skirt:** tucked in, ending inside its waistband, with the skirt's bow showing (`layering.tucksIntoSkirt`).
- **Under outerwear:** it stays inside every jacket (the shared outerwear tests), and a jacket hides its sleeves, as for every top.
- **Not offered:** with the classic striped shirt and knit layers.

## Styling facts

A boxy, hip-length long-sleeved tee in cream with fine black stripes, white blackletter lettering and a colourful sequinned picture patch with a pink rose. Crew neck, long sleeves, midriff covered. Warmth 2 of 4, inferred: a light jersey with long sleeves. Mild days, or as a layer under a jacket.

## Checks

- `npm test`: 108 passing, after merging main (which added the Desigual navy rugby shirt, the Tommy Jeans varsity crest jumper and the one-garment-per-file layout).
- The new `tests/hawaii-patch-tee.test.js` checks:
  - the parts: body, neckband, turned hem, two sleeves and their cuffs;
  - the back: plain stripes, about a third black, with no lettering or colour, and about one stripe per period down it;
  - the front: white lettering, and the patch's sky, sign and red car on her left, her right front carrying only lettering;
  - the sleeves: they reach her wrist and repeat seamlessly round the arm, with stripes running down the arm above the seam and round it below;
  - over the skirt, the tucked hem without a turned hem and the visible bow; the Mickey tee keeps its turned hem.
- The shared sleeve, hand, waistband, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, over the mom jeans and tucked into the skirt. No device check.

## Known differences

- The lettering, picture, bands and rose are simplified redrawings, not the real artwork. The picture is a flat drawing rather than a photo, and the sequins don't sparkle beyond the glints drawn in.
- The word is read as “desigualite”; an accent on its last letter is not drawn.
- The lettering is larger and the patch wider than on the tee, to suit her wider, shorter torso and stay legible on a phone.
- There are fewer stripes than on the tee (about 36 against 42).
- Tucked into the skirt rather than worn loose over it.
