# Wardrobe item: Desigual × Christian Lacroix giant flower sweater

Authored 8 October 2026. Status: revised after the user's first look (jagged sleeve ends); approved: the user merged it, and merging means approved (their rule). Added by the tops chat (see “Parallel chats” in `AGENTS.md`).

## Source and reference reading

The user sent five phone screenshots of the desigual.com (NZ) listing “Sweater designed by Mr. Christian Lacroix”: a flat lay, the front and back on a model, a neckline close-up and a front close-up. The screenshots are not stored in the repository.

Features read from the screenshots:

- Fuzzy, brushed olive-green knit with the print knitted in.
- Front:
  - One giant painterly violet flower across the chest. Its five broad petals are streaked violet over lilac and fade to white and a mint throat. Black stamens end in dots, a thick black stem sweeps in from her right shoulder, and some petal edges are inked black.
  - A second violet flower low on her right, with a diagonal black stem.
  - A white peony with mint and lilac low on her left, sketched in black.
- Back: a giant violet flower across the upper back, and part of another low on her right.
- Sleeves: olive above the elbow, with flowers on the forearms: violet on her right, the peony and violet on her left.
- Olive ribbed cuffs, a lilac ribbed crew neck, and a hem rib that carries the print.
- A regular fit to the high hip.

Measured on the flat lay: olive (108, 115, 27), violet (116, 72, 161), lilac (184, 164, 210), mint (185, 215, 159), black (23, 20, 22).

## Implementation

Catalog ID `desigual-lacroix-flower-sweater-v1`. No image asset is bundled. `lacroixData()` in `src/doll/model.js` paints the artwork procedurally: one texture all round the body, and one for each sleeve.

- Body units: front and back are each painted as seen straight on, in metres of the doll (0.318 either side of the centre, 0.56 tall). That keeps the flowers round on her short, wide torso. `LACROIX_FRONT` and `LACROIX_BACK` list each flower's centre and its petals: direction, length, half-width, and whether the edge is inked.
- Petals (`flowerColour`): each is a rounded wedge. The colour runs from a mint and white heart to lilac, then violet, through blotchy radial streaks. Black stamens end in dots near the heart, a dark violet line marks where petals overlap, and some petals have an inked edge. Black stems are smooth strokes.
- Peony: ruffled white petals with a mint heart, lilac tinges towards the edge, and black sketched ruffles.
- Sleeves: olive, with the forearm flower painted on the outer front of each arm.
- Yarn: a soft grain and a slight blur for the brushed halo; matte wool with extra sheen.
- Shape: a regular fit from the crew neck to the high hip. The hem rib (1.165 to 1.225) carries the print and hugs the jeans, or sits out over the skirt. Long, slightly loose sleeves with the rounded shoulder cap blouse over olive ribbed cuffs. The crew neck is lilac.
- Layering: `coversWaistband` hides the skirt's bow, and the shared waist test checks it over every bottom.
- Colours: calibrated by measurement. A front render gives olive (115, 118, 48), violet (129, 81, 177) and lilac (189, 163, 213), against the flat lay's values above.
- Preset: “Lacroix flower study”, with the Mango washed black jeans (the photos pair it with navy trousers).

## Checks

- `npm test`: 39 passing. The new test checks:
  - the parts
  - that front and back are each mostly violet flower over olive, with black stems
  - that the white peony is on the front only
  - that the hem rib carries the body's print
  - that the peony is on her left forearm
  - that the hem sits out over the skirt with the bow hidden

  The shared tests for sleeve clearance and covering the waist also run on this sweater.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the Mango black jeans. The authoring chat checked these renders; the user has not seen them yet.

## Revision after user feedback

The user said the sleeves looked jagged. The ends of the cuffs showed teeth. Two causes were found:

- The cuff's rib ripples had only about two points per rib. Every ribbed band on the tops now has eight (`ribbed()` notes this).
- The main cause: her thumb and mitten pushed through the snug cuffs, so the rippled surface cut in and out of them. `easeOverHand()` now pushes any cuff point that would sit inside her mitten or thumb out until it clears them, as a cuff stretches over a hand. It is applied to the cuffs of this sweater, the silver cable jumper, the stripe jumper and the Mango jumper.

A new test checks that no cuff or sleeve end cuts through her hands, for every top. It fails when the easing is switched off. With the user's agreement, the shared `makeReferenceTop()` now eases the bronze and lilac sleeves and their bound hems over her hands too. The hems clear by a little more, so they stay on top of the sleeve. The built-in classic knit's cuff still touches her thumb slightly.

## Known differences

- The flowers are painted procedurally from the photos, not copied. Their shapes, streaks and stamens are an interpretation, and the painterly texture is smoother than the real print.
- The flowers are sized to her short torso, so the giant front flower covers relatively more of her than it does of the model.
- The back is read from one model photo, partly hidden by hair.
