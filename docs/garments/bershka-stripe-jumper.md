# Wardrobe item: Bershka asymmetric rustic stripe jumper

Authored 8 October 2026. Status: revised after the user's first review (the bare shoulder); approved: the user merged it, and merging means approved (their rule). Added by the tops chat (see “Parallel chats” in `AGENTS.md`).

## Source and reference reading

The user sent two phone screenshots of a Myntra listing, “Bershka Asymmetric Rustic Stripe Jumper”: the front worn on a model and a flat lay. The user said few pictures were available. The screenshots are not stored in the repository.

Features read from the screenshots:

- A wide asymmetric neckline worn off one shoulder. On the model it sits at the base of the neck on her right and slopes across the chest, below the left shoulder and onto the upper arm.
- Ecru slub (“rustic”) knit with even, dark green horizontal stripes. Each green stripe fills about a third of its repeat. There are about eight stripes between the neckline and the hem band.
- Near the neckline the stripes follow its slant; lower down they are level.
- A deep plain ecru ribbed hem band, about a quarter of the body's length, and deep plain ribbed cuffs.
- A boxy body with dropped shoulders, ending at the high hip; long straight sleeves.
- A narrow plain edge around the neckline.

Measured from the photos: the stripe green is (46, 52, 41) in the worn photo and a more olive (71, 66, 37) in the flat lay; the ground is (220, 217, 202) and (233, 226, 211).

## Implementation

Catalog ID `bershka-asymmetric-stripe-jumper-v1`. No image asset is bundled. `stripeKnitData()` in `src/doll/model.js` draws the stripe repeat with slubs (short, slightly lighter or darker lengths of yarn) and fine grain.

- Neckline: `stripeNeckline(x, z)` gives the edge height around the body, and `trimToEdge()` cuts the body along it, spreading each column's rows evenly below the cut so the edge is clean. The body alone carries the neckline, finished with one narrow ecru edge all the way round.
- Bare shoulder: near the neckline the body settles onto her shoulders. On her left the body wraps over the top of her arm, like a dropped shoulder slipping down (`leftArmExit()` gives the arm's surface from `makeDoll`). So the edge simply runs lower on that side. The left sleeve starts below it, gathered onto the arm and widening to the same straight sleeve as on her right. Where it meets the body, the stripes form a V, as at the photo's shoulder seam. Her body under clothes is cream felt, so the jumper carries a skin-coloured piece (`bare-shoulder-skin`) that shows above the neckline.
- Catalog flag: `layering.bareShoulder` records which arm the sleeve alone does not cover, and from what height. The shared sleeve test skips that part of that arm. This jumper's own test checks that the body and sleeve together cover all of it except the bare top.
- Stripes: about seven repeats from the neckline to the band down the centre front. That is a few fewer than the photo, so they stay bold on her short torso. They follow the neckline's slant at the top and are level by the waist. Sleeve stripes run around the arm at the same spacing.
- Body and band: boxy, from the dropped shoulders to a ribbed band at the high hip (1.16 to 1.28). The body blouses slightly over the band. The band hugs the jeans, or sits out over the skirt when one is worn.
- Sleeves: long and straight, with the rounded shoulder cap on her right, into deep ribbed cuffs.
- Colours: calibrated by measurement. A plain area of a front render gives stripe (64, 64, 42) and ground (227, 223, 211), between the two photos' values.
- Layering: `coversWaistband` hides the skirt's bow, and the shared waist test covers every bottom.
- Preset: “Off-shoulder stripe study”, with the light Davinia jeans as the closest thing to the pale shorts in the photo.

## Checks

- `npm test`: 23 passing. A new test checks the parts, the stripe count and level stripes at the hem, the neckline's slant, that her left upper arm is bare and her right arm covered, and that the band sits out over the skirt. The shared tests for sleeve clearance and covering the waist also run on this jumper.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, both three-quarter turns, the side, the back and the back three-quarter, with the Davinia jeans, the Levi's '94 and the skirt. These renders were checked by the authoring chat; the user has not seen them yet.

## Revision after user feedback

The user found the exposed shoulder odd: it fragmented instead of simply going lower. In the first version, the body's edge stopped at the shoulder and the left sleeve had its own oval edge over the arm, with a skin bump between them. The revision cuts one neckline from the body, which wraps over the arm, and starts the sleeve below it (see Implementation).

## Known differences

- The back was not shown. Its neckline (a little higher than the front and also lower on her left) and its stripes are inferred.
- The flat lay seems to sit lower on the other side than the worn photo; the worn photo is followed.
- The stripe count is adapted to her short torso, and the stripes are a regular repeat.
- From the side, the back of the neckline stands a little away from her shoulder behind the left arm.
- The slub is suggested by texture, bump and sheen; there is no raised yarn.
