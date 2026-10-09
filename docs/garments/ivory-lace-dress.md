# Wardrobe item: ivory lace shift dress

Authored 9 October 2026. Status: first version, awaiting visual review. The second dress. It adds the `lace-shift-dress` template (`src/doll/lace-dress.js`).

## Source and reference reading

The user sent six product photos with no text:

- full length on a model, front and back
- the dress laid flat
- close-ups of the sleeve, the neckline and the back keyhole

No link was fetched, and the photos are not stored in the repository. The brand is not stated; the trainers in the photos suggest Desigual.

Features read from the photos:

- Ivory floral lace (roses and leaves on a fine net), opaque over a lining on the body.
- Horizontal bands of frilled lace trim across the body, closer together lower down.
- A high lace collar with a ruffled top edge.
- Long, slightly full sheer lace sleeves, crossed by lace insertion bands, gathered into frilled cuffs at the wrist.
- A keyhole at the back of the neck, closed by two small gold buttons.
- A straight shift ending at mid-thigh.

## How the user wears it

Not stated. It is built as in the photos, with bare legs.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:**
  - Palette: ivory, tonal.
  - Shape: a straight shift mini, mid-thigh.
  - Coverage: a high collar and long sheer sleeves; her legs are bare from mid-thigh.
  - Material: lace, sheer on the sleeves.
- **Inferred:** a light dress for mild, dry days, or under a coat when it is cooler.
- **Unknown:** the brand, the fibre composition, and how the user wears it.

## Implementation

Catalog ID `desigual-ivory-lace-shift-dress-v1` (slot `dress`), built by `makeLaceDress()` in `src/doll/lace-dress.js` from its `build` spec. `makeOutfit()` picks the builder by template; the half-zip dress is built as before.

- **Lace.** Drawn procedurally: scattered roses and leaves on a hexagonal net, kept as a shade map and an alpha map. The body uses it opaque. The sleeves and the collar use it sheer, over her skin.
- **Body.** A straight shift from the neck to mid-thigh (hem 0.845, outfit units), with a slight wave toward the hem.
- **Frills.** Ten bands of frilled trim, closer together lower down, and a trim along the hem. Each frill's stitched top lies close, and its lower edge flares in soft gathers.
- **Collar.** A high sheer lace collar over skin, its top edge a ruffle. Her large head hides most of it from the front.
- **Back.** A keyhole at the back of the neck and two small gold buttons. Her hair hides them in the back view.
- **Sleeves.** Sheer lace over her skin, a little full, crossed by four lace insertion bands. Each ends in a gathered cuff and a frill that flares over her hand without cutting through her thumb.
- **Colour, by measurement.** The front's plain areas render at about RGB 233, 230, 224.
- **Preset.** “Lace dress study”: the dress with bare legs, white socks and the UGG cream sneakers. The pink Superstars took that outfit over the scene's triangle budget.

### Shared changes (additive)

- **One dispatch line in `makeOutfit()`** for the `lace-shift-dress` template. The half-zip dress is unchanged: its fingerprint, alone and under a jacket, matches `main`'s, as does the default outfit.

## Checks

- `npm test`: 98 passing after merging `main`, including the new `tests/lace-dress.test.js`. It checks:
  - the parts, and the parts it leaves out
  - the opaque body and the sheer sleeves over skin
  - the mid-thigh hem, and frills closer together toward it
  - the keyhole and buttons at the back, and the high collar
  - the study
- The shared tests check her hands stay inside the cuffs, the dress stays inside every jacket, and the study's triangle budget.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back.

## Known differences

- The lace pattern is a generic rose-and-leaf lace, not copied.
- The frill bands are placed by eye from the photos.
- The collar and the back keyhole are mostly hidden by her head and hair.
