# Wardrobe item: Petit Bateau striped fisherman rib cardigan

Authored 8 October 2026. Status: refitted after the user's first review (oversized on them); approved: the user merged it, and merging means approved (their rule).

## Sorting: a top that can also go over another top

The user wears cardigans on their own, buttoned over bare skin, or over a blue sleeveless top (8 October 2026). The user asked for the best solution to that ambiguity, so the cardigan is a top marked `layering.overTop`. It is worn alone, with skin showing in the V. It can also take a slim top under it (`underTopId`, from the tops marked `layering.underTop`), which then shows in the V. Outerwear stays for pieces only ever worn over a top. See the handoff's sorting paragraph for the rule.

## Source and reference reading

The user sent four phone screenshots of a petit-bateau.it listing: the front flat lay buttoned, the front worn on a model, a flat lay with the front opened, and the back. The screenshots are not stored in the repository.

Features read from the screenshots:

- Cream fisherman rib knit: chunky vertical ribs.
- Three wide navy stripes round the lower body, front and back, above a cream ribbed hem band.
- Three navy stripes on each forearm, above long cream ribbed cuffs.
- A deep V-neck reaching about a third of the way down, edged by ribbed bands that continue down the front as the button band.
- Five cream buttons.
- A small navy badge on her left upper sleeve.
- Oversized and boxy with dropped shoulders, to the hip.

Measured on the flat lay: cream (242, 228, 209), navy (28, 26, 33). The body's three navy stripes sit at about 12–19%, 26–33% and 41–48% of the knitted length from the hem band up.

## Implementation

Catalog ID `petit-bateau-striped-cardigan-v1`. No image asset is bundled.

- Knit (`fishermanRibData()`): one rib across (a raised ridge and a narrow groove), the piece's whole length down, with the navy stripes at the measured heights. It drives the colour and the bump. There are 150 ribs round the body and 54 round each sleeve.
- V-neck: `trimToEdge()` cuts the body along a V that falls from the shoulders to the first button and stays at the neck round the back. `edgeBand()` lifts the first rows of the cut edge into a ribbed band all round the neckline.
- Front: a button band from the bottom of the V to the hem, laid on the body with `surfaceProbe()`, and five glossy cream buttons on it.
- Skin: the bare-shoulder skin piece from the stripe jumper fills the V, since her body under clothes is cream felt.
- Badge: a small navy oval on the outside of her left upper sleeve. It sits in the sleeve's group, so it hides with the sleeve under a closed jacket (the outerwear test caught it floating over the windbreaker at first).
- Shape: oversized and boxy from dropped shoulders to a ribbed hem band at mid-thigh, with long sleeves over most of the hands (see “Fit, as the user wears it”).
- Layering: `coversWaistband`; the styling record says the V leaves her chest open.
- Preset: “Striped cardigan study”, with the classic jeans in washed blue, as in the photos.

## Checks

- `npm test`: 52 passing. The new test checks:
  - that it is a top, and the user's note on how they wear it
  - the parts, five buttons and two cuffs
  - a V at least 0.2 deeper at the front than the back neck
  - three navy stripes on the body
  - the badge on her left upper sleeve, inside the sleeve's group
  - that it hangs outside the skirt's pleats, with the bow hidden
  - the layering rule: which tops may go under it, under tops inside it except in the V, and the “Under it” selector

  The shared tests for sleeves, hands, the waist and outerwear also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back, alone, over the lilac and bronze tops, over the skirt and under the windbreaker. The authoring chat checked these renders; the user has not seen the refit yet.

## Fit, as the user wears it

The user said the cardigan is oversized on them: long sleeves, and it hits well below the crotch. The first version was hip length with sleeves to the wrist. It now:
- hangs to mid-thigh (hem band 0.8 to 0.875), straight past her hands and widening only below the hips, enough to hang round both legs. Over the skirt it follows the skirt's flare from the waistband down, clearing the pleats.
- has longer, roomier sleeves; the ribbed cuffs fall over most of her mittens, leaving the tips showing.

The stripes keep their measured proportions of the knitted length, so they sit lower on her than before. Under the hip-length windbreaker the cardigan hangs out below it.

## Worn over a slim top

With a top under it, the under top shows in the V and above the back of the neck instead of her skin. Its sleeves stay inside the cardigan's. The new layering test checks the bronze and lilac tops under the cardigan; every point of their bodies below the collar is inside the cardigan or seen through the V.

## Known differences

- The rib is drawn as texture and bump, not separate ridges in the silhouette.
- The badge is a plain navy oval, without the boat logo.
- It is always shown buttoned; open wear is not modelled.
- The user's blue sleeveless top is not imported yet; once it is, it should be marked `layering.underTop`.
