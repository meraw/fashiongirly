# Wardrobe item: Emerald hooded parka (over-dyed)

Authored 9 October 2026. Status: awaiting visual review. The first long coat. Built on the zip-windbreaker template, with the Red Bull windbreaker's covered zip.

## Source and reference reading

The user sent five product photos of the coat in its original navy: front (zipped, hood up), side, back, worn open, and a close-up. No link was fetched, and the photos are not stored in the repository.

The user's own coat has a history:

- It was originally a lighter blue than the photos, in a colour they could not find online.
- It was damaged with bleach, and the user dyed it emerald green with Coloreria Italiana dye.
- The colour cannot be captured on camera, so the user asked for **a slightly muted emerald green**.

Features read from the photos:

- An oversized hooded parka, knee length on the model, straight to a slight A-line, with dropped shoulders.
- A zip under a snap placket from the hem to the top of the collar.
- A hood lined in cream sherpa, with red and white drawcords coming out at the neck.
- Large slanted flap pockets at the hip, each with a snap.
- Long, full sleeves gathered into elastic cuffs.
- A drawcord hem, with red and white cord ends at the front edges.
- A cream sherpa lining in the body (the open view).
- A plain back.

## Colour

The colour is the user's description, not a measurement. It was rendered and measured against a target for a slightly muted emerald. The front's plain areas now render at about RGB 54, 120, 86. The first try rendered as a light jade, about 90, 160, 120, so the shell was darkened.

Assumed, not stated (recorded as unknowns in the catalog entry):

- The sherpa, the stitching, the zip tape and the cords did not take the dye. Coloreria Italiana dyes natural fibres, and these parts are usually polyester. So they keep their colours from the photos:
  - cream sherpa
  - red and white cords
  - grey zip
- The topstitching is tonal green; it may in fact be the coat's original thread colour.
- No bleach marks show through the dye.

## How the user wears it

Not stated for this coat. The user's rule for outerwear applies: zipped closed in real life, or not worn. So it starts **zipped, hood down**. Like every jacket, it can also be shown open on the doll.

The length is assumed at the knee. The user is short, so on them it is probably at least that long.

## For styling later

Recorded in the catalog entry's `styling` block:

- **Observed:** emerald green (dyed) with cream sherpa and red and white cords; plain. An oversized, knee-length parka with dropped shoulders. It covers her torso, hips and thighs to the knee, her arms to the wrist and her neck when zipped, and it has a hood. A woven shell with a sherpa-lined hood and body.
- **From the user:** the colour (a slightly muted emerald, after a bleach accident and a home dye); worn zipped in real life.
- **Inferred:** warm, for cold and windy days. The hood suits rain or wind. It is long enough to cover a skirt or a dress.
- **Unknown:** waterproofing, fibre composition, whether the sherpa and trims took the dye, any bleach marks, and the exact length on the user.

## Implementation

Catalog ID `emerald-dyed-sherpa-hood-parka-v1` (slot `outerwear`), built by `makeZipWindbreaker()` from its `build` spec.

- **Body.** A long body from the stand collar to the knee (hem at 0.655, in outfit units), easing out from the hips to clear every pair of trousers and the skirt. It has its own wider rows over the skirt. The template's hem band is used as a narrow drawcord channel (0.028 high), lightly gathered.
- **Front.** The covered zip (`placket`) with snaps on the collar.
  - The red hood cords use the template's drawcords, with cream tips.
  - At the hem, red cords end in cream toggles at both front edges.
  - The slanted flap pockets use the template's pockets with a steep slant and one snap each.
- **Hood, worn down.** The template's hood, puffier, without a label. Its opening has a thick sherpa edge round her neck. Her large head hides most of it from the front.
- **Sleeves.** Fuller than the windbreakers' sleeves, gathered into the elastic cuffs. There is no badge.
- **Open.** The fronts part all the way to the hem. The placket stays on her left front, with a zip half on each edge, and the inside shows the sherpa lining.

### New optional template settings (additive)

Each setting defaults to the old behaviour. Zipped, the Marikoo and Red Bull windbreakers are unchanged: their fingerprints match the versions before these settings.

- **`colours.sherpa`:** a sherpa pile material (`sherpa()`, a bump map of small tufts) for the collar lining and the hood's lining edge, and for the lining inside when the coat is shown open.
- **`colours.cordTip`:** cord tips in their own colour. Without it, they stay in the shell colour.
- **`hood.label: false`:** no hood label.
- **`hood.opening.lining`:** the radius and inset of the hood's lining edge.
- **`sleeve.badge`:** now optional; without it, there is no sleeve badge.

## Checks

- `npm test`: 76 passing. The new `tests/emerald-parka.test.js` checks:
  - the parts and those left out: no coil zip, hood label, sleeve badge or back label
  - the sherpa pile on the collar lining and hood edge, and the cream cord tips
  - knee length, below the skirt's and the dress's hems
  - the slanted pockets and the study
  - shown open: the sherpa lining, the zip halves, and nothing spanning the opening down to the hem
- The shared outerwear tests pick it up automatically, zipped and open. They check that it covers every top and every bottom from its hem to its collar, with and without the skirt, and that her arms and hands stay inside its sleeves.
- `npm run build` succeeds.
- Rendered in headless Chromium: front, turn, side and back over its study outfit; open from the front and at a turn; over the skirt; and over the half-zip dress.

## Known differences

- Her large head hides the collar and most of the hood's sherpa edge from the front.
- The pocket flaps are slanted raised flaps with a snap, not separate flaps that lift.
- The drawcord channel reuses the template's gathered hem band, so it is lightly puckered.
- The lining's inside is drawn as sherpa throughout; in the photos, only the hood and the upper body are clearly sherpa.
- Her hands rest against the coat's sides, where it is wide, as with the windbreakers.
