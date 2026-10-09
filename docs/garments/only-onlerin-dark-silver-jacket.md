# Wardrobe item: ONLY “Onlerin” dark silver jacket

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. Added by the chat that has been doing shoes, outerwear and tops. It is the first garment added in the one-file-per-garment layout.

## Source and reference reading

The user sent three images:
- a shop flat lay of the front;
- a second-hand photo on a hanger;
- a phone screenshot of a resale listing (“ONLY ONLERIN JACKET DARK SILVER”), showing the back on a floor and two small fronts.

The photos are not stored in the repository.

Features read from the photos:

- Crinkled metallic nylon in dark silver, crumpled all over, so it catches the light in bright creases and dark folds.
- A hood lined in black, with black drawcords at the neck.
- A centre-front zip on a dark tape, from the hem to the top of the stand collar.
- Raglan sleeves, with seams from the neckline down to each underarm.
- A seam across each front at about the waist with the pockets hidden in it, and side panels curving down to the hem.
- A gathered elastic hem band and elastic cuffs in the shell.
- Boxy, hip length.

The colour differs between the photos: bright silver in the shop photo (about RGB 189, 188, 183 at the median, from 110 to 243), darker and cooler in the second-hand ones. The listing calls it dark silver.

## Implementation

Its catalog entry and study preset are in their own file, `src/wardrobe/garments/only-onlerin-dark-silver-jacket-v1.js`, with one line in `src/wardrobe/garments/index.js`. It is on the zip-windbreaker template (`makeZipWindbreaker()` in `src/doll/outerwear.js`), with the Marikoo windbreaker's body, sleeves, hood, cords and gathered hem and cuffs.

**Metallic finish (new, optional `metallic` setting).**
- The shell is partly metal (0.6) and fairly shiny (roughness 0.3). The scene has no environment for a full metal to reflect, so a full metal would read black. The silver foil jumper uses the same balance.
- The crumples are a new normal map, `crumpleData()`: small flat facets, each tilted its own way, with soft creases between them, so neighbouring facets catch the light differently, as crumpled foil does.
- The facets are a little elongated across the body and repeat seamlessly.
- The black lining (`colours.yoke`) stays plain cloth.
- Every other windbreaker renders pixel-identical to `main`, closed and open over the skirt: the Marikoo, Red Bull, emerald parka, Woolrich bomber and adidas cropped windbreaker.

**Details.**
- Seams are drawn into the shell: the raglan seams front and back, the seam across each front with a soft shadow under it, and the side panels.
- No pocket welts, badge or labels.
- A dark coil zip and black cords.
- Open, it shows a black nylon lining.

**Colour.** A mid, slightly cool silver (`#80838b`) under the metallic finish, between the bright shop photo and the darker second-hand ones.

**Study preset.** “Silver windbreaker study”, over the black Mickey tee and the washed black jeans, with the cream 550s.

**Styling notes** (`styling`):
- dark silver and black, plain metallic;
- a light layer: an unpadded shell and a thin lining;
- for mild, breezy or cool days, and the coated shell and hood suit light showers (inferred);
- bold, futuristic and sporty.

## Checks

- A new `tests/only-onlerin-jacket.test.js` checks:
  - its parts and that it has no pockets, badge or labels;
  - the metallic crumpled shell and the plain black lining;
  - its study;
  - that it opens.
- The shared tests also run on it: it covers every top and every bottom and the skirt from its hem to its collar, closed and open, and her arms and hands stay inside its sleeves. `tests/garment-files.test.js` checks its file and index line.
- `npm test`: 109 passing after merging `main` (which added the Replay rose sweatshirt in its own file). `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL):
  - front, three-quarter, side and back;
  - open;
  - a chest close-up;
  - in the real app with its study preset.

  The user has not yet seen it, and nothing has been checked on a device.

## Known differences

- The crumples are a texture on a smooth shell, so the outline stays smooth. The facets are more regular than real crumpled nylon.
- The hidden pockets are not modelled.
- The hood lies down on her back; her head hides its top.
