# Wardrobe item: Topshop washed black wide crop jeans

Authored 9 October 2026. Status: first version, awaiting the user's visual review.

## Source and reference reading

The user sent five product photos: the back and front on a model, a back-pocket close-up, a front waist close-up and the side on a model. The photos are not stored in the repository.

The user's fit: "I'm short so these fit longer on me, almost reaching my ankles." On the taller model they end at mid-calf; here they are built to end just above her ankle.

Features read from the photos:

- Mid rise, with wide legs flaring from the thigh to a broad, raw-cut hem with loose threads.
- Washed black twill fading to charcoal.
- A five-pocket front: scoop pockets, a coin pocket, copper rivets at the pocket corners and a silver shank button.
- A back yoke and pointed patch pockets.
- A black leather patch embossed TOPSHOP on the back waistband, on her right.
- Tan double topstitching on the pockets, fly, yoke and waistband. The side seams are tonal in the side photo.

Plain denim measures about (54, 55, 58) on the lit legs, (39, 41, 45) in the front close-up and (26, 26, 26) in shadow; the target is about (48, 49, 53), a cool charcoal.

## Implementation

Catalog ID `topshop-washed-black-wide-crop-v1`, built by `makeJeans()` from its catalog `build` spec.

- **Denim:** `topshop-black-crop-denim.js`, a 256 × 256 seamless swatch cut from inside the back pocket in the close-up (plain, evenly lit twill).
  - Its lighting is divided out with a narrow blur, because it is a zoomed close-up.
  - It keeps only the photo's brightness variation (twill and grain, at 80% contrast), coloured to the measured charcoal, as for very dark denim.
  - It is made seamless with a two-pass half-offset blend, across and then down. A single combined blend left faint seams.
  - One repeat covers about 5 cm of fabric, so about ten go round her leg.
- **Colour:** a front render's plain thigh measures (50, 50, 54) against the target (48, 49, 53). The first swatch rendered slightly warm (50, 49, 49), so it was cooled.
- **Shape:**
  - Mid rise (waistband at 1.24), with legs close at the hip that flare below the thigh to a broad hem at 0.3, just above her ankle.
  - The hem is centred over her foot and deep enough front to back to hold the Buffalo boot shaft. Over the boots the legs drape round the shaft without being pushed into each other (a first version, centred further out, failed the shoes test).
  - The hems just meet between her feet, as in the front photo.
- **Hem:** raw (`hem: 'raw-crop'`), with dark grey fray threads round each leg and no hem stitching.
- **Details:**
  - tan double topstitching;
  - copper rivets at the pocket corners (the template mirrors rivets to both sides, so the coin-pocket rivets are left out rather than appear on the other hip);
  - a silver button, back yoke and pointed back pockets;
  - a black leather patch on her right at the back.
- **New template option (bottoms template, additive):** `seamThread` gives the side seams and inseams their own thread colour. Here it is tonal (`#38383d`) while the topstitching stays tan. Without it, seams use `thread` as before; a test checks this on the Mango jeans.
- **Preset:** "Black wide crop study", with the navy stripe knit polo.

## Styling facts

Recorded in the catalog (bottoms do not require them yet): wide cropped legs, mid rise; washed black with tan stitching; plain twill, slightly faded at the thighs; coverage to just above the ankle. Warmth 2 of 4, inferred from the denim with wide, open, cropped legs. Mild days; the open hem lets the cold in.

## Checks

- `npm test`: 68 passing after merging `main`. The new test checks:
  - the patch, button and yoke;
  - the frayed raw hem, with no hem stitching;
  - the hem height (above the loafers, near her ankle);
  - the flare: the hem's cross-section is at least 1.35 times the thigh's;
  - tan topstitching with tonal side seams;
  - that the Mango jeans' side seams still use their topstitching thread.

  The shared shoe, layering and outerwear tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, with the stripe polo, over the loafers and over the Buffalo boots. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- A faint change of shade where the hips meet the legs, which shows on every pair from this template in these renders.
- Folds are procedural.
- The leather patch has no lettering.
- The flare is fitted to her short legs; the photos show a taller wearer.
