# Wardrobe item: Tommy Hilfiger green cable knit wool sweater

Authored 8 October 2026. Status: first version, awaiting the user's visual review. Added by the tops chat (see “Parallel chats” in `AGENTS.md`).

## Source and reference reading

The user sent five phone screenshots of a Rinascente listing, “Tommy Hilfiger cable knit wool sweater”: the front and full length on a model, a front close-up, the back and a flat lay. The screenshots are not stored in the repository.

Features read from the screenshots:

- Forest green wool, slightly heathered.
- Rope cables all over: about eight columns across the front and the back, separated by narrow purl troughs, and continuing down the sleeves. Each twist is a leaning oval, a little taller than its column is wide.
- Raglan sleeves, with seams running from the neck to each underarm.
- A narrow ribbed crew neck, a deep ribbed hem band (about 15% of the length) and long ribbed cuffs.
- A small embroidered flag on her left chest.
- A relaxed, straight fit to the hip. The photos style it over a white shirt, which is not part of the garment.

Measured on the flat lay: the body averages (41, 91, 60), with its darkest tenth at (23, 67, 39) and its brightest tenth at (57, 110, 78).

## Implementation

Catalog ID `tommy-green-cable-sweater-v1`. No image asset is bundled.

- Cables (`cableKnitData()`): one tile is one cable column for one twist, drawn as a height field. The twist is a leaning oval that pinches in where it tucks under the next one, with a crisp crease, between narrow purl troughs. Fine stitch columns run through it. The height drives both the bump and a baked shading (troughs darker, ridges lighter), so the cables read as relief in plain green.
- Count: sixteen columns round the body (eight across the front) and six round each sleeve. A twist repeats every 0.14, slightly squatter than in the photos so the cables suit her short torso.
- Shape: relaxed and straight from the crew neck to a deep rib band at the hip (1.14 to 1.23). The band tucks inside the body's edge and hugs the jeans, or sits out over the skirt. Long raglan sleeves with the rounded shoulder cap blouse over long ribbed cuffs, which ease over her hands (`easeOverHand()`).
- Raglan seams and flag: `surfaceProbe()` and `raglanSeams()` were extracted from the pointelle jumper and are now shared by both. The flag is three small stripes (navy, white, red) on her left chest, placed with the same probe.
- Layering: `coversWaistband` hides the skirt's bow, and the shared waist test checks it over every bottom.
- Colour: calibrated by measurement. A front render averages (49, 95, 62), against (41, 91, 60) in the flat lay.
- Preset: “Green cable study”, with the classic jeans in ecru, close to the cream jeans in the photos.

## Checks

- `npm test`: 41 passing. The new test checks:
  - the parts, the four raglan seams and the three-stripe flag on her left chest
  - the relief: a bump map with deep troughs and high ridges
  - the sixteen columns round the body
  - the hem over the skirt, with the bow hidden

  The shared tests for sleeve clearance, hands and covering the waist also run on this sweater.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, with the ecru classic jeans. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The cables are a regular procedural repeat, with twists squatter than the real ones.
- The flag is a simple three-colour tab, not the exact logo.
- The cables are shaded relief on a smooth surface; the silhouette does not ripple.
