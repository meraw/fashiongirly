# Wardrobe items: Bomboogie teddy jackets with a detachable hood, green and black

Authored 9 October 2026. Status: approved: the user merged it, and merging means approved (their rule). The first outerwear with a detachable part, and the option in the app to take it out.

## Source and reference reading

The user sent four product photos of the green one from Zalando, and said:

- they have two identical jackets, one green and one black (they first wrote blue, then corrected it to black);
- the hood and the front zip part, in a different material, come off the coat;
- they want that to be an option in the app.

The four photos:

- the front, closed, with the hood down;
- the back;
- a side three-quarter with the hood up;
- the front open, showing the zipped bib.

There is no photo of the black one. The photos are not stored in the repository.

Features read from the photos:

- A boxy, cropped jacket in curly teddy (bouclé faux shearling), with a wide flat teddy collar.
- A silver two-way metal zip up the centre front.
- Dropped shoulders and wide straight sleeves.
- Rolled teddy edges.
- **The detachable part** is in quilted, glossy, padded nylon:
  - a hood, joined to a bib that has its own tonal zip and is quilted in horizontal channels;
  - the bib zips into the jacket along its front edges;
  - with the jacket closed, the bib's neck shows above the teddy zip, and the hood stands round the back of the neck;
  - the hood is quilted in horizontal channels, with drawcord toggles at its sides;
  - a black Bomboogie label hangs inside the neck.

Measured on the photos of the green one:

| Part | Colour |
| --- | --- |
| Teddy, median | (58, 66, 44), a military green |
| Lit quilted nylon on the bib | about (119, 127, 105) |

## Implementation

Two garments, slot `outerwear`, each in its own file in `src/wardrobe/garments/`:

- `bomboogie-green-teddy-hood-jacket-v1.js`
- `bomboogie-black-teddy-hood-jacket-v1.js`

They are built by `makeTeddyJacket()` in the new `src/doll/teddy-jacket.js`, template `teddy-hood-jacket`. `makeOuterwear()` gains one dispatch line for it, and an `insert` option.

**The jacket:**

- **Fit:** the pink Bomboogie fur jacket's boxy cropped body and dropped-shoulder sleeves, slightly roomier. It is built at its own size and eased out only where the layers under it need room (`jacketBody()`, `easeOver()`).
- **The teddy:** curly spiral loops drawn in code (`curlData()`), as a bump map and a strong colour variation, dark in the gaps between curls. The surface is lumpy rather than smooth.
- **Edges:** rolled teddy edges at the hem and down both fronts, and a wide flat teddy collar.
- **The zip:**
  - Closed: the silver two-way zip runs up the centre, with a slider and long pull at the top and another at the hem.
  - Open: the fronts hang apart, as for the leather jacket, with a zip half on each.
- **Neck:** an olive nylon lining inside the neck.

**The detachable insert** (group `detachable-insert`), in glossy quilted nylon:

- **The hood, worn down:**
  - a pouch on her back below her hair, quilted in three horizontal channels, with a centre seam and rolled edges;
  - its puffy rim comes round the sides of her neck, rising behind the collar.
- **The bib:**
  - Closed, its quilted neck rises above the teddy collar at the front, with its tonal zip.
  - Open, it closes the front between the teddy fronts, puffed in channels with stitching between them and its zip up the middle.
  - Because the bib closes the front, the jacket eases out over everything under it, as if closed.

**The option in the app:**

- The garment declares `layering.detachable: { label: 'Wear the quilted hood and bib' }`.
- The recipe gains `outerwearInsert`, true by default. `cleanRecipe()` keeps it false only for outerwear that has a detachable part.
- Under "Wear it open" there is a new checkbox:
  - it takes its label from the garment;
  - it is disabled for other outerwear;
  - it is reset to on whenever outerwear is chosen.
- `makeOutfit()` passes it to `makeOuterwear()`.
- These are small, additive changes to `recipe.js`, `app.js`, `index.html`, `model.js` (one argument) and `outerwear.js` (one import, one option, one dispatch line). Every other garment builds as before.

**Colour:**

| Part | Render | Photo |
| --- | --- | --- |
| Green teddy, front | (58, 65, 44) | (58, 66, 44) |
| Open bib | (120, 128, 107) | (119, 127, 105) |

The black one is the same jacket in a soft black, like the cropped hoodie's black fleece (teddy `#161618`, nylon `#1f2023`). No photo of it was supplied.

**Presets:**

- "Green teddy jacket study": over the white linen shirt and the Tommy mom jeans.
- "Black teddy jacket study": over the lapis linen shirt and the Mango black jeans.

## Layering

- **Closed** (the default, as the user wears outerwear): it hides the top's sleeves and collar points, and covers the waistband and the skirt's bow.
- **Open, with the insert:** the quilted bib shows between the fronts.
- **Open, without it:** the top shows between the fronts.
- **Without the insert:** the hood, the rim and the bib are all gone; the teddy collar and the nylon neck lining remain.

## Styling facts

- Boxy, cropped, with a wide collar; military green, or black; plain, with a curly pile and quilting.
- Hood worn down.
- Teddy faux shearling, with quilted nylon.
- Warm with the padded hood and bib zipped in, for cold days, and a little lighter without them.
- Cold, dry days; faux shearling does not suit heavy rain.

## Checks

- `npm test`: all passing. The new `tests/teddy-jacket.test.js` checks:
  - both jackets and their studies;
  - with the insert, closed: the hood down on her back, its rim, the bib's neck and zip, a two-way zip, curly matte teddy and glossy nylon;
  - one jacket green and the other black;
  - without the insert, open or closed: no hood, rim or bib;
  - open with the insert: the zip in halves, the bib quilted in channels and lying in front of every point of the top between the fronts;
  - without the insert, it covers the top and the skirt from hem to collar;
  - the option: its default, `cleanRecipe()` keeping it only for outerwear with a detachable part, and the checkbox (disabled for other outerwear, labelled from the garment, and changing the recipe).

  The shared outerwear tests also run on both jackets, closed and open, over every top, bottom and the skirt.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back:
  - the green one closed and open, with and without the insert, and open over the skirt without it;
  - the black one closed and open.

  The user saw them and merged it. No device check.

## Known differences

- **The hood** is only worn down. On the doll her large head covers her neck, so from the front its rim is hidden, and it shows on her back and at her shoulders from a turn. Its cord toggles, which would sit under her chin, are left off.
- **The label** is not modelled.
- **The teddy** is drawn in code, not copied. Its curls are flatter than the real pile.
- **The black one** is the green one recoloured; no photo of it was supplied.
