# Wardrobe item: Mango brushed windowpane jumper

Authored 8 October 2026. Status: first interpretation awaiting user visual feedback. This is the first piece from the user's own wardrobe list.

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

Catalog ID `mango-plaid-jumper-v1`. No image asset is bundled. `plaidData()` in `src/doll/model.js` draws one repeat of the check on a 6 × 5 px stitch grid, so the hatching steps like jacquard stitches. Inside the bands, the stitches between the hatching carry a light tint of the band colour, so the bands stay legible when the texture is viewed from a distance.

- Body: oversized shell, widest around the chest, drawn in by a separate ribbed hem band at the hip (1.14 to 1.215). The rib band sits outside the trousers at every jean width and outside the pleated skirt.
- Neck: a separate ribbed crew neck, mostly hidden under the doll's chin, as with the earlier tops.
- Sleeves: full sleeves with the rounded shoulder cap (`roundSleeveCap()`), gathered into ribbed cuffs at the wrist.
- Materials: matte wool with a knit bump map and low sheen. Colours are set darker than the photographed wool because the studio exposure and sheen lighten them; full sheen washed the check out.
- Layering: the catalog's new `layering.coversWaistband` rule hides the skirt's ribbon bow under this jumper. The bronze and lilac tops also set it; the cropped crochet top does not.

## Checks

- `npm test`: 18 passing. A new test checks the parts, that the bow is hidden, and that no trouser or skirt vertex between the hem and the waist shows through, for three jean widths with and without the skirt. It fails when the hem band is narrowed.
- The arm clearance and rounded-shoulder test covers this jumper's sleeves.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, side, back and a slight turn, with indigo jeans and over the moss skirt. These renders were checked by the authoring chat, not the user.

## Known differences

- The check is a regular procedural repeat. Band order, scale and the exact stitch pattern are an interpretation.
- The brushed halo is suggested by colour noise, bump and sheen; there are no fibres standing off the surface.
- On the compact doll the jumper reads less dramatically oversized than on the model, because her arms are short and the body is wide.
- The ribbed crew neck is mostly hidden by her large head.
