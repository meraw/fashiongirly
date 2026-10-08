# Wardrobe item: cream pointelle flower jumper

Authored 8 October 2026. Status: first version, awaiting the user's visual review. Added by the tops chat (see “Parallel chats” in `AGENTS.md`).

## Source and reference reading

This is the user's own jumper. They could not find it online, so they photographed it flat on the floor, front and back. The photos are not stored in the repository. No brand or composition is known.

Features read from the photos:

- Cream openwork (pointelle) knit: horizontal bands, each with two rows of small staggered eyelets, separated by a raised ridge.
- Eight raised embroidered flowers, scattered over the front only. Each has six raspberry petals around a darker centre, with two dark green leaves and a short stem above, so the flowers hang. The back has none; the front flowers show faintly through the knit.
- A wide boat neckline.
- Raglan seams from the neckline down to each underarm, front and back.
- A boxy body, about as long as it is wide, ending at the hip.
- Long, wide, straight sleeves.
- Narrow plain bands finished with small scallops at the neckline, the hem and the sleeve ends.

Measured from the front photo, which has a cool cast: yarn (205, 211, 218), petals (146, 79, 104), leaves (45, 81, 84). The colours were white-balanced against the yarn before matching (target ivory yarn, petals about (158, 82, 102), leaves about (49, 84, 82)).

## Implementation

Catalog ID `cream-pointelle-flower-jumper-v1`. No image asset is bundled.

- Knit: `pointelleData()` in `src/doll/model.js` draws one repeat: plain knit, an eyelet row, plain, an offset eyelet row, plain, and a ridge that is lit along its top and shadowed below. Eyelets are cut out of the material (alpha test) and are shaded around their rims. There are eight eyelets per tile and about 72 around the body. That is coarser than the real knit so they read at her size. The repeat is 0.056 high, giving about 12 bands down the body.
- Shape: a boxy body from the boat neck (1.85) to the hip, with a scalloped hem band (1.145 to 1.175) that hugs the jeans or sits out over the skirt. Long, wide, straight sleeves with the rounded shoulder cap and scalloped ends.
- Edges: plain, finely ribbed bands. `waveEdge()` raises or lowers one edge of a band in small scallops: 44 round the neck, 56 round the hem, 26 per sleeve end.
- Raglan seams: thin tonal lines from the neckline to each underarm, front and back. They are laid on whichever surface is outermost (body or sleeve), found by casting rays at the finished pieces.
- Flowers: small raised shapes: six petals, a darker centre, two leaves and a stem. They are placed by casting rays at the front of the body at the positions measured on the photo (`POINTELLE_FLOWERS`). They are sized to the photo, about 6% of the body's width, and scaled so her body's squash doesn't flatten them.
- Skin through the eyelets: her body under clothes is cream felt, so the jumper carries a skin layer (`skin-under-openwork`) in its own group: the shoulder piece from the stripe jumper, continuing down her body. It stays inside every pair of jeans (tested), so lower down the eyelets show whatever she wears underneath: jeans or the skirt.
- Layering: `coversWaistband` hides the skirt's bow, and the shared waist test checks it over every bottom.
- Preset: “Pointelle flower study”, with the washed black Levi's '94.

## Checks

- `npm test`: 26 passing. The new test covers:
  - the parts, and the four raglan seams
  - eight flowers, all on the front and spread across it
  - the open share of the knit
  - solid edge bands and a scalloped hem
  - the skin layer staying inside every pair of jeans it overlaps

  It caught the skin layer touching the Tommy ultra-high waistband, which was then tucked in. The shared tests for sleeve clearance and waist covering also run on this jumper.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the Levi's '94, the Tommy jeans and the skirt. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The eyelets are bigger and fewer than the real knit's, and the pattern is a regular repeat.
- The flowers are smooth raised shapes, not satin stitch.
- With low-rise jeans, the eyelets just above the waistband show her cream felt body rather than skin.
- Where the sleeve caps meet the body, a little of the inside can show through the eyelets.
