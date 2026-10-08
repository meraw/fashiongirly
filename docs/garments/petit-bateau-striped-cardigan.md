# Wardrobe item: Petit Bateau striped fisherman rib cardigan

Authored 8 October 2026. Status: first version, awaiting the user's visual review.

## Sorting: a top, not outerwear

The user wears cardigans on their own, buttoned over bare skin, or over a blue sleeveless top (8 October 2026). So this cardigan is a top, and it is built buttoned, with skin showing in the V. Outerwear, as the app has it, always goes closed over another top.

Wearing it over the blue sleeveless top is not built yet. It needs a rule for two tops at once: an under-layer top (such as the sleeveless top) worn under a top that is open at the front (such as this cardigan). That rule touches shared foundations, so it is to be agreed with the user when the sleeveless top is added.

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
- Shape: boxy from dropped shoulders to a ribbed hem band at the hip. It hugs the jeans or sits out over the skirt. Long, straight sleeves blouse over long ribbed cuffs, which ease over her hands.
- Layering: `coversWaistband`; the styling record says the V leaves her chest open.
- Preset: “Striped cardigan study”, with the classic jeans in washed blue, as in the photos.

## Checks

- `npm test`: 49 passing. The new test checks:
  - that it is a top, and the user's note on how they wear it
  - the parts, five buttons and two cuffs
  - a V at least 0.2 deeper at the front than the back neck
  - three navy stripes on the body
  - the badge on her left upper sleeve, inside the sleeve's group

  The shared tests for sleeves, hands, the waist and outerwear also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn, the side and the back. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The rib is drawn as texture and bump, not separate ridges in the silhouette.
- The badge is a plain navy oval, without the boat logo.
- It is always shown buttoned; open wear is not modelled.
