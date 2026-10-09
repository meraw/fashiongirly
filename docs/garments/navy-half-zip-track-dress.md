# Wardrobe item: navy half-zip track mini dress

Authored 9 October 2026. Status: first version, awaiting the user's visual review. This is the first dress, and it added the dress slot (see the handoff).

## Source and reference reading

The user sent five phone screenshots of a listing (images 2, 3, 5, 7 and 9 of 9): arms crossed, the full length front, the back, a collar and zip close-up, and a hem and cuff close-up. The brand is not shown on the dress; only the sneakers in the photos carry a logo. The screenshots are not stored in the repository.

Features read from the screenshots:

- Navy textured jersey with fine vertical ribs and small twists up each rib.
- A tall stand-up funnel collar, worn zipped up. One photo shows it folded down like a polo.
- A quarter zip from the collar to mid-chest: silver teeth and slider, with a navy pull tab.
- Raglan sleeves. A wide cream textured panel runs from the neckline down the outside of each arm to the wrist, with navy on the inner side of the arm. On the shoulders and the back the cream comes up to the neckline as wedges either side of a narrow navy stripe.
- Navy fine-ribbed cuffs.
- A short A-line skirt ending about a quarter of the way from the crotch to the knee.
- Worn with bare legs, white socks and white sneakers.

Measured on the photos: navy (48, 48, 67) and cream (212–243, 206–238, 202–233).

## Implementation

Catalog ID `navy-half-zip-track-dress-v1`, in the new `dress` slot.

- Colour (`zipDressData()`): painted by angle round her and height, with the fine ribbing baked in. Above the raglan seams the cream panels come up to the neckline, split by a narrow navy stripe along the shoulder line. The seam line (`RAGLAN`) is shared with the drawn raglan seams, so colour and seams meet. On the sleeves the cream panel wraps the outside of the arm (60% of the way round), with the navy stripe down its middle. The texture is turned per sleeve so the panel faces outward on both.
- Relief (`cableRibTile()`): a tiling height field of ribs with stacked twists, used as the bump map.
- Shape: close at the chest, then a gentle A-line to the hem at 0.86, with a soft ripple in the skirt. Long raglan sleeves with the rounded shoulder cap, into navy ribbed cuffs eased over her hands.
- Collar and zip: a ribbed stand collar (mostly hidden by her large head, as with the other high necks), and silver zip teeth laid on the front from the collar to mid-chest, ending in a small stop. The slider sits at the top of the zip, under her chin.
- Bare legs: her body under clothes is cream felt, so the dress carries skin over each leg from inside the hem down into her socks (`bare-leg-skin`). With bare-foot shoes (the slides) the skin continues to her feet.
- Preset: “Half-zip dress study”, with the cream platform sneakers (close to the white sneakers in the photos).

## Checks

- `npm test`: 63 passing. New tests check:
  - the slot rules: only dresses fill it, a dress is not a top or bottoms, and the top and bottoms stay in the recipe
  - that the top, under top, classic layers, bottoms and skirt are not built under a dress, and come back when it is off
  - a hem on the upper thigh
  - her body and legs inside the dress, and skin (not cream felt) on her legs below the hem
  - her arms inside the sleeves
  - the studio selector, saving, and that choosing a top takes the dress off
  - its cuffs easing over her hands (the shared hand test)
  - both closed jackets covering the dress from their hem up, with the dress sleeves hidden

  The shared hand test now covers dresses as well as tops.
- `npm run build` succeeds.
- Rendered in headless Chromium from the front, a turn and the back, and with the windbreaker, the open leather jacket with the Buffalo boots, and the cow slides. The authoring chat checked these renders; the user has not seen them yet.

## Known differences

- The rib and its twists are drawn, not copied stitch for stitch.
- The collar is modelled standing, and her head hides most of it from the front; the folded polo look is not modelled.
- The cream panels' edges are sharp; the photos show thin piping along some of them.
- No separate seam where the skirt meets the bodice (the photos show none either).
