# Wardrobe item: black Mickey Mouse print long-sleeve tee

Authored 9 October 2026. Status: second version, awaiting visual review. The user found the first print too neat and too large (“Messier, smaller”); it was redrawn. Added by the chat that has been doing outerwear (any chat can add any category).

## Source and reference reading

The user sent four shop screenshots without a description: the front on a model, a closer front on a second model, a close-up of the front and shoulder, and the back. The brand is not stated; the print is a licensed Disney Mickey Mouse design. The photos are not stored in the repository.

Features read from the photos:

- A fitted long-sleeved crew-neck tee in black jersey with a faint slub, soft and drapey.
- An all-over scattered print of distressed Mickey Mouse stamps:
  - cream heads and gloves
  - red shorts with cream buttons
  - ochre shoes
  - here and there a whole figure
- The stamps are inked unevenly and crossed by scratchy crackle lines. Fine paint splatter lies between them.
- A narrow black ribbed crew neckband.
- Long fitted set-in sleeves to the wrist, printed all over.
- A plain turned hem at the waistband of high-rise jeans.

Measured colours (front close-up): ground about RGB 29, 26, 25; the inks are about cream 214, 207, 194, red 168, 35, 46 and ochre 196, 127, 53 at full strength. One of the four photos shows the ochre as a mustard yellow; the other three agree on ochre.

## Implementation

Catalog ID `black-mickey-print-long-tee-v1` (slot `top`). It is built by `makePrintedLongTee()` in the new file `src/doll/printed-long-tee.js`, from the `build` spec in its catalog entry (template `printed-long-tee`). `makeOutfit()` gained one dispatch line for the template.

**Shape.** The bronze top's fitted body and sleeve rows, copied into the spec: a crew neck at 1.91, a hem at 1.18 that covers every waistband, and long fitted sleeves that end at her wrist and ease over her hand (the shared `roundSleeveCap()` and `easeOverHand()`). It adds a narrow ribbed neckband, a turned hem and turned cuffs in near-black. The shared top code is not changed.

**Print.** Drawn in code, not copied from the photos. Each stamp is a union of ellipses:

- a head: a round face, two round ears, two oval eyes
- shorts with two buttons
- a four-fingered glove with a cuff
- a rounded shoe

Each stamp is inked in one of the measured colours, at a random angle, and given:

- a very ragged edge
- patchy gaps where the ink did not take
- three sets of wavy scratch lines through it
- ink that thins out toward one side, as if pressed unevenly, with some stamps printed faint
- a spray of fine dots in its own ink around it

**Revision (“Messier, smaller”).** The first version's stamps were larger (50 pixels, against 36 now), cleaner and evenly inked. A trial that was much denser and rougher lost the shapes and the black ground, so the settings sit between the two. The new spec options (`scratches`, `scratchWidth`, `ragged`, `fade`, `faint`, `spray`) are all in the catalog entry's `print` block.

Stamps are spread evenly: each is the best of a few random spots, the farthest from those already placed. Fine paint splatter is scattered between them. The black ground carries a faint slub and grain.

The body's print holds a front panel and a back panel side by side, each projected flat from the front or back, so the print stays upright and the side seams fall at the panel edges. Each sleeve has its own print, which repeats seamlessly round the arm. All three keep the same scale, 1300 texture pixels to a world unit. The prints are drawn once and shared.

The whole figures and the faces' finer features are not drawn.

**Preset.** “Mickey tee study”: the tee with the Tommy mom jeans, as in the first photos.

## Layering

It covers the waistband, like the other tops at this length. A jacket hides its sleeves, as for every top.

## Styling facts

- Fitted, high-hip length; black with red, ochre and cream.
- A scattered distressed cartoon print (Mickey Mouse) with paint splatter.
- Crew neck, long sleeves, midriff covered.
- Fine stretch jersey.
- Warmth 2 of 4, inferred from the thin fitted jersey with long sleeves: mild or cool days, or a base layer under a jacket.

## Checks

- New `tests/printed-long-tee.test.js` checks:
  - its parts: body, neckband, turned hem, two sleeves and their cuffs
  - that the body prints a front and a back panel side by side, each upright
  - that each sleeve's print repeats round the arm
  - that the sleeves reach her wrist
  - that the print holds all four inks on the black ground, mostly ground
- The shared tests also run on it: sleeves and hands, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm test`: 83 passing after merging `main` (which added the Desigual fresco V-neck tee); `npm run build` succeeds.
- The print takes about a second to draw the first time it is worn, then is shared.
- Rendered in headless Chromium from the front, a turn, the side and the back. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The print is a simplified redrawing: the stamps' shapes are more regular than the real distressed artwork, and the layout is random rather than the real repeat.
- Her torso is wider and shorter than the models', so fewer stamps fit across her.
