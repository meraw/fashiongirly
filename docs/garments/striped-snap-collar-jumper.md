# Wardrobe item: striped waffle-knit snap-collar jumper

Authored 9 October 2026. Status: second version; approved: the user merged it, and merging means approved (their rule). Added by the chat that has been doing shoes, outerwear and tops (any chat can add any category).

## Source and reference reading

The user sent two second-hand photos, the only ones they could find:
- a mirror selfie wearing it buttoned to the top;
- the front on a hanger.

They wear it with a few buttons unbuttoned. The photos are not stored in the repository. The brand is not known: the neck label is not legible.

Features read from the photos:

- A relaxed, slightly boxy jumper in a chunky waffle (thermal) knit, to the hip.
- Horizontal stripes of cream and slate grey, the grey a little narrower than the cream (about three rows in seven). There are about six or seven grey stripes from the hem band to the neck.
- Raglan sleeves, full and relaxed, gathered into long cream rib cuffs.
- A deep cream rib hem band, the body blousing a little over it.
- A big cream rib collar folded over, with snaps on its front ends.
- A cream half placket closed with four metal snaps: silver rings round dark eyelets.

Colours measured on the photos:
- cream about RGB 209, 202, 191 in the flat lay, and about 223, 211, 193 on the model;
- grey about 73, 75, 86 (in the waffle's shade).

## Implementation

Catalog ID `striped-waffle-snap-collar-jumper-v1` (slot `top`). It is built by `makeSnapCollarJumper()` in a new file, `src/doll/snap-collar-jumper.js`, from the `build` spec in its catalog entry (template `snap-collar-jumper`). `makeOutfit()` gains one dispatch line. It reuses the polo's `grid()` and the shared top helpers without changing them, so every other garment is unchanged.

**Shape.** The body and sleeves follow the green cable sweater's relaxed raglan fit, which already clears every bottom and the skirt. Over the skirt, the band sits out wider. Raglan seams run from the neckline to each underarm, front and back.

**Knit.** A waffle texture of soft raised cells. The stripes change colour at a row of cells, as knitted stripes do. The stripes follow height on her, so the body's and sleeves' stripes meet across the raglan seams.

**Worn open.** The user wears it with a few snaps open, so the top two are open here:
- the neckline opens into a V down to the first closed snap, with her skin in it;
- a cream placket strip edges each side of the V. The open snaps show their caps on her right and their studs on her left;
- below the V, the two closed snaps sit on the placket.

**Collar.** A big rib collar folded over, from its fold round the stand down over her shoulders.
- Her big head hides the top of her shoulders, and the raglan sleeve caps rise over them. So the collar is drawn as it shows on the open jumper: two broad flaps lying on her upper chest either side of the V, with rounded front corners, and two snaps on each.
- Round the back and sides it lies on the body, under her head and the sleeve caps.
- Close round her neck it lies almost flat, so it fits inside every jacket's collar.

**Colours.** Measured on the photos and checked in renders, then darkened for the scene's lighting: the grey renders at about 99, 97, 108 and the cream at about 226, 220, 208.

**Study preset.** “Striped snap-collar jumper study”, with the light Stradivarius jeans and the cream 550s, close to the selfie's light jeans.

**Styling notes** (catalog `styling`):
- warmth 3, inferred from a chunky knit with long sleeves and rib cuffs, open at the neck;
- cool days; the open neck lets some air in;
- cream and slate grey stripes; relaxed, preppy-casual.

## Revision after the user's first review

The user found the collar strange: it was folded, but the folded part didn't connect to anything. Her chin hid where the collar joins the neck, so the two flaps on her chest looked like loose pieces. On the real jumper with the top snaps open, each side of the placket folds back from the bottom of the V as a small lapel and runs into the collar. Each side now has that lapel: it fills the space from a roll line along the placket's outer edge, from the bottom of the V up to the collar's fold, out to the collar's front edge, and lies on her like the collar. Its lower edge and the roll line are rolled, so the opening reads as one folded collar from the V up. The roll line stops below her chin so it stays inside every jacket's collar.

## Checks

- A new `tests/snap-collar-jumper.test.js` checks:
  - its parts and the snap counts;
  - the stripe share in the knit, and that stripes meet between body and sleeve;
  - the V down to the first closed snap, and the round back neck;
  - the collar's flaps on her chest, closing round the back;
  - a lapel each side, from the bottom of the V up into the collar;
  - the cuffs at her wrists;
  - the band sitting out over the skirt;
  - the build time.
- The shared tests also run on it: sleeves and hands, every waist-covering top over every bottom, styling facts, and every jacket over every top and the skirt.
- `npm test`: 100 passing after merging `main` (which added the adidas Originals cropped hoodie, the ivory lace dress and the pink yoke shirt). `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter, side and back;
  - a neckline close-up;
  - over the skirt, and under the open leather jacket;
  - in the real app with its study preset.

  The user merged the pull request after seeing the revised collar. Nothing has been checked on a device.

## Known differences

- The collar is simplified to what shows on the doll: flaps on her chest. Over her shoulders it lies under the sleeve caps, and her head hides it at the back.
- How far it opens is a choice (the top two snaps); the user said “a few”.
- The back is not in the photos; it is drawn plain, striped like the front.
