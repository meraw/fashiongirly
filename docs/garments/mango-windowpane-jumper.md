# Wardrobe item: Mango brushed windowpane jumper

Authored 8 October 2026. Status: revised after the user's first review; awaiting their second look. This is the first piece from the user's own wardrobe list.

## Source and reference reading

The user sent a Zalando link (<https://www.zalando.ie/mango-jumper-light-blue-zir03dt4f-001.html>, listed as Mango, pre-owned) and a Ceneo link. Both pages blocked automated fetching (Zalando: Akamai bot protection; Ceneo: captcha). The user then sent seven phone screenshots of the product photos: front on a model, full-length front, a knit close-up, the back, a sleeve and hem close-up, a flat lay and a crouching side view. Screenshots are not stored in the repository.

The user rarely wears it because it is oversized and too warm for the local climate. This is recorded as `wear.userNote` in the catalog for later styling or weather work.

Features read from the screenshots:

- A large windowpane check knitted in as jacquard, not printed.
- Wide bands of stepped diagonal hatching in rust-brown and grey-taupe frame cream windows.
- Thin, broken pale-blue lines run through the bands and cross each window.
- Brushed, fuzzy cream ground; a heavy knit.
- Cream ribbed crew neck, a deep ribbed hem band and ribbed cuffs.
- Oversized, boxy body with dropped shoulders; full sleeves gathered into the cuffs; hip length.

The denim shirt collar and cuffs, jeans, belt and boots in the photos are styling, not part of the jumper. Fibre composition was not visible in the screenshots.

## Implementation

Catalog ID `mango-plaid-jumper-v1`. No image asset is bundled. `plaidData()` in `src/doll/model.js` draws one repeat of the check on a 9 × 7 px stitch grid, so the hatching steps like chunky jacquard stitches. One repeat, across and down, is: hatched frame, cream square, pale-blue cross line, cream square, hatched frame, pale-blue separator. Each window is therefore four cream squares inside its own hatched frame, and neighbouring frames are separated by a pale-blue line. The hatch strokes cycle brown, grey, salmon, brown, grey on a light ground; the pale-blue lines are broken; a 3 × 3 blur softens everything like brushed wool.

- Body: boxy and straight, falling from dropped shoulders to a ribbed hip band (1.14 to 1.215). The band hugs the jeans, or sits out over the skirt when one is worn (`makePlaidJumper(id, overSkirt)`).
- Neck: a separate ribbed crew neck, mostly hidden under the doll's chin, as with the earlier tops.
- Sleeves: straight and roomy with the rounded shoulder cap (`roundSleeveCap()`), narrowing into ribbed cuffs.
- Scale: three windows across the front and about two rows down. The photo shows two across, but her torso is much wider than it is tall, so two across made the windows wide and left only one row.
- Materials: matte wool with a knit bump map and low sheen. Colours are set darker than the photographed wool because the studio exposure and sheen lighten them.
- Layering: the catalog's `layering.coversWaistband` rule hides the skirt's ribbon bow under this jumper. The bronze and lilac tops also set it; the cropped crochet top does not.

## Revision after user feedback

The user found the first version awkward: “oversized” had been read as balloon-like, and the check was similar but clearly a different pattern. The first version bulged at the chest, had puffed sleeves, and drew wide single bands of rust and taupe hatching around plain cream windows, with strong blue lines. The revision is the boxy shape and the four-pane, double-framed check described above, compared side by side with the flat lay during authoring. A trial dropped-shoulder seam line was removed because it read as an odd horizontal line.

## Checks

- `npm test`: 18 passing. A new test checks the parts, that the bow is hidden, and that no trouser or skirt vertex between the hem and the waist shows through, for three jean widths with and without the skirt. It fails when the hem band is narrowed.
- The arm clearance and rounded-shoulder test covers this jumper's sleeves.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, with indigo jeans and over the moss skirt, and compared side by side with the flat-lay screenshot. These renders were checked by the authoring chat; the user has not yet seen the revision.

## Known differences

- The check is a regular procedural repeat. Three windows across the front instead of two, and the exact stitch pattern, are interpretations.
- The brushed halo is suggested by colour noise, bump and sheen; there are no fibres standing off the surface.
- The ribbed crew neck is mostly hidden by her large head.
