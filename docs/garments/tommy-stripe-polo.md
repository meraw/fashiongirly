# Wardrobe item: Tommy Hilfiger navy stripe knit polo

Authored 8 October 2026. Status: first version, awaiting the user's visual review. The first short-sleeved top.

## Source and reference reading

The user sent four phone screenshots of a product gallery: the front on a model, the back on a model, a close-up of the neckline and a flat lay. The screenshots are not stored in the repository.

Features read from the screenshots:

- Fine-gauge knit in even horizontal navy and off-white stripes, continuing across the sleeves.
- A navy knit polo collar with spread points, and a short navy placket with four off-white buttons. On the model the top button is open and the collar sits open over a narrow V; the flat lay is fully buttoned.
- A white script monogram on her left chest, level with the bottom button.
- Short set-in sleeves ending above the elbow in narrow navy rib bands, and a small metal flag tab on the outside of the left sleeve band.
- A navy ribbed hem band.
- Slim, fitted, ending at the waist over high-rise jeans.

Measured in the flat lay and the front photo: navy fills about 60% of each stripe repeat (32 px navy to 21 px white in the flat lay, 35–40 to 23–27 on the model). From the neck to the hem band there are about ten repeats on the model and thirteen in the flat lay. The plain navy averages (44, 49, 67) in the flat lay, and darker on the model (29–38, 37–43, 47–54); the collar in the close-up is (24, 36, 52). Off-white is (220, 221, 216) in the flat lay and (228, 227, 223) on the model.

## Implementation

Catalog ID `tommy-stripe-knit-polo-v1`, built by `makeKnitPolo()` in the new `src/doll/polo.js`. No image asset is bundled. `stripeData()` draws one stripe repeat: navy 60%, off-white 40%, with a faint yarn heather.

- Stripes follow height in the outfit (`mapStripes()`), so the body's and sleeves' stripes meet at the armholes. A white stripe ends at the top of the hem band, as in the flat lay. There are about eleven repeats from the hem band to the neck. The stripe texture has no mipmaps: in a render, blended mip levels narrowed the navy to half of each repeat.
- Body: slim and fitted from the neck to the waist. Below 1.5 it follows the silver cable jumper's rows, which clear every waistband. A narrow navy rib band runs from 1.26 to 1.335, tucked just inside the body's lower edge.
- Neck: the top button is open. The body is cut into a narrow V down to the second button (`trimToEdge()`), and her neck shows through it. The navy placket is a strip lying on the knit below the V, and it edges both sides of the V. Three off-white buttons show; the fourth is open under the collar.
- Collar: the fall runs from its fold round the top of a stand, down over her shoulders, and ends in a point either side of the placket. Its front edges stay close to the placket below her chin, then spread out to the points. A rolled edge gives it thickness. Her large head hides the top of the collar from the front and her hair hides it from the back.
- Sleeves: short and close to the arm, with the rounded shoulder cap, ending above the elbow in a narrow navy rib band. A tiny navy, white and red flag in a metal frame sits on the outside of the left band.
- Monogram: four white strokes suggesting a script T crossing an H, embroidered on her left chest. It is a suggestion of the script, not the brand's lettering.
- Colours were calibrated by measurement. A front render's plain navy averages (42, 47, 66) against (44, 49, 67) in the flat lay, and off-white (225, 223, 219) against (220, 221, 216). The sheen was lowered to reach that navy. At the doll's size the navy looks close to black next to the white; the photos' navy is just as dark.
- Build time: about 63 ms per outfit rebuild after the first. The placket, buttons and monogram are placed by finding points on the knit, and those points are cached because the body never changes.
- Preset: “Stripe polo study”, with the Tommy ultra high rise mom jeans (the photos pair it with mid-blue high-rise jeans).

## Layering

- Skirt: the polo ends above the skirt's waistband, so `coversWaistband` is not set and the skirt's bow stays visible.
- Bottoms: every waistband that reaches above the hem passes inside the body and band (tested for every bottom).
- Outerwear: a closed jacket hides the sleeves, as for every top. Small layering change in the shared assembler (`makeOutfit`): a closed jacket now also hides the polo's collar (`polo-collar*`), as it already hid the classic shirt's collar points. Without it, the collar points showed through the zipped windbreaker.
- Shared sleeve test: a short sleeve leaves her arm bare. The catalog's `layering.bareArmBelow` says where this sleeve's fabric ends, and the shared sleeve test checks her arm only above that point. Long sleeves are checked as before.

## Styling facts

Slim and waist length, navy and off-white Breton-style stripes with navy trims, polo collar worn open, short sleeves, covered to the waist. Warmth 1 of 4, inferred from the fine knit and short sleeves: mild to warm days, or under a jacket. The composition is not visible in the screenshots.

## Checks

- `npm test`: 53 passing after merging `main`. The new test checks:
  - the parts, with three buttons, two short sleeves, two rib bands and a three-colour flag
  - the monogram on her left chest and the flag on her left sleeve
  - navy at 60% of each stripe repeat
  - the V ending at the second button
  - the sleeves ending above her elbow
  - the hem above the skirt, with the skirt's bow visible
  - that no trouser or skirt vertex between the hem and 1.4 pokes through the body or band, for every bottom

  The shared sleeve, hand, outerwear and styling tests also run on it.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, a turn, the side and the back, with the Tommy mom jeans, the skirt and the Marikoo windbreaker. Only the authoring chat has checked these renders; the user has not seen them yet. No device check.

## Known differences

- About eleven stripe repeats on her short torso, where the photos show ten to thirteen.
- The monogram is drawn, not the brand's lettering, and the sleeve flag is a simple three-colour tab.
- The inside of the collar and the label are not modelled.
- Worn with the top button open, as on the model. A buttoned version would need a closed neckline and the fourth button.
- Over the lower-rise Topshop barrel jeans, a strip of her cream felt midriff shows between the hem and the waistband (checked in a render), as with the silver cable jumper. Over the classic and high-rise jeans the hem meets the waistband.
