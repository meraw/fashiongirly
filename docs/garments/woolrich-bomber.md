# Wardrobe item: Woolrich cream hooded bomber (vintage)

Authored 9 October 2026. Status: first version, awaiting visual review. It is the fourth jacket on the zip-windbreaker template.

## Source and reference reading

The user sent eight photos from their own resale listing on Vestiaire Collective. The jacket is vintage, so there are no product photos:

- the front, laid out open
- the front on a bed, open and with the hood up
- the back, with the hood
- the sleeve pocket and label
- the inside: the quilted lining, the hood's fur and the brand label (Woolrich, John Rich & Bros, size XS)

No link was fetched, and the photos are not stored in the repository.

Features read from the photos:

- A cream cotton canvas bomber, slightly yellowed with age, with tonal topstitching. Boxy and hip length.
- A hood lined in grey-beige faux fur, with a darker, dark-tipped faux-fur ruff round its opening. The hood zips on and fastens with snaps.
- A zip under a storm flap that closes with metal snaps, with snaps on the stand collar.
- Raglan sleeves and a centre-back seam.
- Large flap pockets at the hip, each with a snap.
- A zip pocket and a white Woolrich label on the upper left sleeve.
- A rib-knit hem band and long rib-knit cuffs, in a slightly greyer cream.
- A navy quilted lining (onion quilting).
- Snap tabs at the sides of the waist.

Measured colour: the cream is about RGB 209, 198, 184 in plain areas of the photos, taken indoors in warm light.

## How the user wears it

Not stated. Their rule for outerwear applies: zipped closed in real life, or not worn. So it starts **zipped, with the hood down**. Like every jacket, it can be shown open on the doll.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:**
  - Palette: vintage cream with grey-beige fur and a navy lining; plain.
  - Shape: a boxy, hip-length hooded bomber with raglan sleeves.
  - Coverage: her torso and arms to the wrist, and her neck when zipped. It has a hood.
  - Material: a padded cotton canvas shell with a quilted lining, and a faux-fur hood lining and ruff.
- **From the user:** worn zipped in real life (their rule).
- **Inferred:** warm, for cold, dry or windy days. The cotton shell is not waterproof.
- **Unknown:** fibre composition, whether the hood is detached when worn, and how the user wears it.

## Implementation

Catalog ID `woolrich-cream-fur-hood-bomber-v1` (slot `outerwear`), built by `makeZipWindbreaker()` from its `build` spec. It has the Marikoo jacket's hip-length body, made a little fuller, and a slightly lower, deeper rib band.

- **Colour, by measurement.** The first render was about RGB 225, 218, 208, too light and too cool. After two darker, warmer steps, the front's plain areas render at about 215, 204, 187 against the photos' 209, 198, 184.
- **Front:**
  - The covered zip (`placket`), with five metal snaps down the storm flap, two on the collar, and a padded edge.
  - Flap pockets standing off the front, each with a shadow under its edge, topstitching and a metal snap.
- **Back.** Raglan seams and a centre-back seam, drawn on the body.
- **Sleeves.** Raglan, softly folded, with long rib cuffs. On her left upper arm are the white label and a zip pocket.
- **Hood, worn down.** The template's hood, without a label, with a fur-pile lining edge and the ruff.
  - On the real jacket, the ruff edges the hood's face opening. With the hood down, that opening lies round her neck, which on the doll is inside her head.
  - So the ruff runs round the edge of the lowered hood on her back (`ruff.along: 'rim'`). It is made of about 1,800 tufts that stand out at random tilts: grey-beige, with about a third dark-tipped.
- **Fabric.** A matte, softly wrinkled cotton (`padding.crinkle`), lightly puffed for the padding.
- **Shown open.** The fronts part, the storm flap stays on her left front with a zip half on each edge, and the inside shows the smooth navy lining (`liningFinish: 'nylon'`).
- **Preset.** “Woolrich bomber study”: the jacket over the Tommy green cable sweater, with the Mango washed black jeans and the black zip boots.

### New optional template settings (additive)

Each setting defaults to the old behaviour. The Marikoo, Red Bull and emerald jackets are unchanged: their fingerprints match `main`'s.

- **`colours.rib`:** a rib-knit hem band and cuffs in their own colour, in place of gathered shell fabric.
- **`placket.studs`:** metal snaps down the middle of the storm flap.
- **`pockets.style: 'flap'`:** wide flap pockets across the lower fronts, with a shadow, topstitching and a snap. Settings: `x0`, `x1`, `top`, `height`, `point` and `lift`.
- **`sleeve.zipPocket`:** a utility pocket with a zip on her left upper sleeve.
- **`hood.ruff`:** a fur ruff round the hood's opening, or round its edge on her back (`along: 'rim'`). It can be made of tufts (`tufts`).
- **`liningFinish: 'nylon'`:** a smooth lining, even when the hood is fur-lined.

## Checks

- `npm test`: 86 passing after merging `main`. The new `tests/woolrich-bomber.test.js` checks:
  - the parts, and the parts it leaves out
  - the rib knit and its colour
  - the density of the ruff, and that it lies round the hood on her back
  - that the sleeve pocket and label are on her left arm
  - the study
  - shown open: the smooth navy lining, the zip halves, and the storm flap
- The shared outerwear tests pick it up automatically, zipped and open. Their check that her hands stay inside the sleeves first failed: her thumb poked through the longer rib cuff. The cuff is now slightly wider, and the check passes.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, open, and with the high bun from behind to show the ruff.

## Known differences

- The ruff runs round the lowered hood on her back rather than round her neck, which her head covers on the doll.
- The fur lining of the hood shows only as its edge.
- The waist snap tabs and the hood's zip and snaps are not modelled.
- The labels carry no lettering.
