# Wardrobe item: Levi's lilac gingham shirt

Authored 9 October 2026. Status: first version, awaiting the user's visual review. The first gingham, and the first shirt on the `check-shirt` template.

## Source and reference reading

The user sent four product photos with no written description:

- the back on a model;
- the front on a model;
- the front, full length, over grey skinny jeans;
- a close-up of the collar and chest.

No label shows. The brand is read from the tonal batwing embroidered on the chest. The photos are not stored in the repository.

Features read from the photos:

- A soft twill, perhaps viscose, with a slight sheen, woven in a small gingham:
  - white squares crossed by purple bars running both ways;
  - each bar edged with a fine pink line;
  - darker purple where the bars cross;
  - the twill shows as fine diagonal hatching where a bar crosses white.
- A point collar, and white buttons on a plain placket. On the model the top button is open.
- A small tonal batwing embroidered on the left chest.
- A back yoke with a centre box pleat below it.
- Long sleeves with buttoned cuffs.
- Hip length, with a curved shirt tail.

Measured in the close-up:

| | Colour |
| --- | --- |
| White squares | (235, 232, 233) |
| Bar crossings | (166, 142, 172) |
| Single bars over white | about (219, 211, 219) |

The shirt averages (201, 190, 200) on the front and (210, 199, 209) on the back. One repeat is about four parts white to one part bar.

## Implementation

Catalog ID `levis-lilac-gingham-shirt-v1` (slot `top`), in its own file in `src/wardrobe/garments/`.

**New top template `check-shirt`,** registered in `src/doll/top-templates.js`:

- `makeCheckShirt()` in `src/doll/shirts.js` turns the garment's `build` into a shirt style.
- That style builds on the button-down shirt template, with the relaxed hip-length rows, shirt tail and tucked rows by default.
- Any woven check can use it: its `build.check` gives the thread colours and one repeat of the warp and weft sett.
- `wovenCheckData()` weaves the check in a 2/2 twill, as the plaid flannel is woven, so the bars hatch where they cross white.

**The gingham:**

- Sett per repeat: white 14, pink 2, purple 7, pink 2, the same both ways.
- Four repeats to a tile, 13 tiles round her body, 6 round each sleeve and the collar; one repeat is about 0.03 outfit units.
- The check is a little larger than on the shirt, to suit her proportions.

**New template option `logo`:** `{ at, size, colour }`.

- A small embroidered logo on the front, in satin stitch, tone on tone.
- Here it is a batwing (`batwingData()`): a straight top, with its lower edge sweeping up in two arcs to a point at the middle. It is drawn in code at her scale as a suggestion of the mark.
- It is laid facing out from her.

**Other settings:**

- Buttoned to the top, as the user wears her shirts: eight white buttons.
- A topstitched collar and tonal stitching.
- The back yoke, with the `backPleat` box pleat another chat added to the template.
- Buttoned cuffs.

The ten existing shirt styles and the linen shirts are unchanged: their geometry and texture coordinates fingerprint identical before and after.

**Colour:**

| | Render | Photo |
| --- | --- | --- |
| Front average | (224, 208, 221) | (201, 190, 200) |

The render is a little lighter than the photo, which carries more shade in its folds. The white squares and purple bars match the close-up.

**Preset:** "Lilac gingham shirt study", over the Mango washed black jeans (the photos pair it with grey skinny jeans).

## Layering

- **Over trousers:** it hangs over every waistband (`coversWaistband`).
- **Over the skirt:** it is tucked in (`tucksIntoSkirt`), so the bow shows, with no buttons below its tucked hem.
- **Closed jacket:** it hides the sleeves and collar.
- **Open leather jacket:** the gingham and buttons show between the fronts.

## Styling facts

- Regular fit, hip length with a curved hem; white, lilac and purple; a small gingham.
- Point collar buttoned to the top, long cuffed sleeves, midriff covered.
- Soft twill.
- Warmth 1 of 4, inferred from a light, long-sleeved woven shirt. Mild days, or as a layer.

## Checks

- `npm test`: all passing. The new `tests/gingham-shirt.test.js` checks:
  - the parts, with no pocket;
  - the batwing on her left chest, facing out;
  - the pleat at the centre back below the yoke;
  - the woven gingham's white squares, purple bars and pink edges;
  - that over the skirt it tucks in, with no button below its tucked hem.

  The shared tests also run on it: sleeves and cuffs, every waist-covering top over every bottom, the styling facts, and every jacket over every top.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn and the back:
  - over the Mango black jeans;
  - tucked into the skirt under the open leather jacket.

  Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- **The check** is woven in code from measurements, not copied, and is a little larger than on the shirt.
- **The batwing** is simplified.
- **The top button** is closed here, as the user wears her shirts; on the model it is open.
- **Her hair** hides most of the back yoke and pleat from behind.
