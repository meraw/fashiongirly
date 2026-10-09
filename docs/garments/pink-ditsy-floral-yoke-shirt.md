# Wardrobe item: Pink ditsy floral yoke shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The fourth relaxed shirt on the shirt template, and the first with a yoke.

## Source and reference reading

The user sent four product photos without a description: full length on a model with grey skinny jeans and black trainers, a closer front, the back, and a close-up of the collar, yoke and sleeve. The photos are not stored in the repository, and no brand shows.

Features read from the photos:

- A boxy, long-sleeved shirt in a soft, fluid fabric with a slight sheen.
- **The print:** small florals scattered densely on soft pink:
  - cream five-petal daisies with rust centres;
  - smaller rust flowers with cream centres;
  - rust leaves on fine stems;
  - tiny cream sprigs.
- A big 1970s point collar with long points.
- A yoke across the front and the back. The body is gathered below it, in fine folds that fade toward the hem.
- Cream buttons down the front, worn with the top one open.
- Full sleeves, gathered at a dropped shoulder and into buttoned cuffs.
- A straight hem at the hip; worn untucked.

Colours, measured in the close-up:

- **Ground:** pink about (219, 184, 174).
- **Flowers:** cream about (220, 210, 193); solid rust about (160, 87, 55).
- **Shares:** roughly 60% pink, 20% cream and 20% rust.
- **Whole-shirt average:** front photo (207, 173, 158).

## Implementation

Catalog ID `pink-ditsy-floral-yoke-shirt-v1`, built by `makeButtonShirt()` in `src/doll/shirts.js`.

**New shirt template options.** All are optional and the other shirts don't use them; a fingerprint of every vertex and texture of every top is identical before and after the change.

- `yoke`: a seam across the front (at 1.72) and the back (1.70), drawn just proud of the body (`yoke-seam`). Below it the body is gathered in fine folds all round (44 of them): deepest under the seam, fading to nothing at the hem, and kept off the placket.
- `collar`: a bigger collar. Its points spread wider (`spread`), hang lower (`drop`) and lie deeper on her shoulders (`deeper`). Without it the collar is as before.
- `sleeveFolds`: fine folds round a full sleeve, growing toward the cuff, as the sleeve gathers into it.

It also uses the Mango shirt's `rows`, `tucked` and `depth`, and the mountain shirt's buttoned `cuff`.

**This shirt:**

- **Body:** boxy, as relaxed as the Mango shirt through the body. It ends straight at the hip (1.10), like the lilac top, and clears every pair of trousers. Over the skirt it is tucked in and the skirt's bow shows (`layering.tucksIntoSkirt`).
- **Print:** `ditsyFloralData()` draws a seamless tile.
  - It scatters 66 cream daisies and 80 rust flowers together, largest first, each kept a little clear of the others, so neither kind clumps.
  - Each rust flower has two leaves on fine stems. About 160 tiny cream sprigs fill the gaps.
  - Two tiles go round her. The flowers are a little larger than on the shirt, so they stay visible on a phone.
  - Shares in the texture: about 57% pink, 24% cream and 19% rust.
- **Fabric:** a light crepe bump with a soft warm sheen.
- **Front:** a V to the second button (1.8), with seven cream buttons below it and tonal stitching.
- **Sleeves:** full (about a third wider than the fitted ones), with folds into the buttoned cuffs.
- **Colours:** calibrated in studio renders, which lift these colours strongly, so the texture is much deeper than the photos.
  - Rendered: pink (219, 184, 173), cream (223, 211, 197), solid rust (162, 88, 59).
  - Average: (210, 174, 159) against the front photo's (207, 173, 158).
- **Preset:** “Pink yoke shirt study”, untucked over the Bershka grey jeans with the Campus trainers. The photos pair it with grey skinny jeans and black trainers.

## Layering

- **Over trousers:** it hangs over every waistband (the shared waistband test).
- **Over the skirt:** tucked in, ending inside its waistband, with the bow showing.
- **Under outerwear:** the shirt stays inside every jacket from the jacket's hem up. A zipped jacket hides the sleeves and the collar, as for the other shirts.
- **Not offered:** under the cardigan, or with the striped shirt and knit layers.

## Styling facts

Boxy, gathered below a yoke and hip length, in soft pink scattered with small cream and rust flowers. A big point collar worn open, long full cuffed sleeves. Warmth 1 of 4, inferred: a light, fluid shirt fabric, though long-sleeved. Mild to warm days, or as a light layer.

## Checks

- `npm test` passes; see the pull request for the count.
  - The new test checks:
    - the parts: the yoke seam, seven cream buttons, buttoned cuffs and full sleeves;
    - the gathers below the yoke, against the smooth yoke above;
    - collar points lower than the other shirts';
    - the print's shares;
    - over the skirt, the tucked hem and the visible bow.
  - The shared sleeve, hand, waistband, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, over the grey jeans and tucked into the skirt. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- The print is redrawn in code; the real flowers are smaller and more varied in shape.
- The dropped shoulder seam and the gathers at the sleeve head are not modelled.
- Her large head hides most of the big collar from the front.
- Tucked into the skirt rather than worn loose over it.
