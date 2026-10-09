# Wardrobe item: adidas Campus 00s grey suede trainers

Authored 9 October 2026. Status: first interpretation awaiting the user's visual review. A pair of shoes from the user's wardrobe list, built on the shared laced-shoe template (`makeLugBoot()`, template `sneaker`).

## Source and reference reading

The user sent four product images on a transparent background: the front three-quarter pair, the back pair, the outer side and the top pair. The user said their pair **has black laces rather than the white ones shown**; this is recorded as `wear.userNote` and built that way. Photos are not stored in the repository.

Features read from the photos:

- A chunky low skate-style trainer in pale grey suede.
- Three black leather stripes with serrated edges on each side, leaning forward toward the lacing, from the sole up to the eyestay.
- A black leather heel tab with a white trefoil.
- A thick padded suede tongue with a round white trefoil badge in a black ring.
- Very wide, puffy flat laces, laced to the top, with no bow visible.
- A padded collar with a white terry lining.
- A cream cupsole with a gum rubber strip round the bottom.
- Gold “CAMPUS” lettering on the outer side.

## Implementation

Catalog ID `adidas-campus-00s-grey-v1` (slot `shoes`). The upper shares the UGG sneakers' proportions, which match this side photo (length about 2.3 times the heel height). The sole is plain (no lugs), with a cream sidewall. She is not raised, and she wears the template's own white ankle socks, as with the UGG pair.

New laced-shoe template options, all off by default:

- `stripes`: leather stripes across both sides of each shoe, each a straight path from the sole to the lacing along the shoe. They were first interpolated by angle round the foot and bent into arcs; they are now laid out along the shoe's length.
- `tongueBadge`: a round badge on the tongue, a disc in a ring.
- `sole.gum`: a gum rubber strip round the bottom of the sole, rising slightly with the toe spring.
- `puffyLace.bow: false`: laced to the top with the ends tucked in, so there is no knot, bow or tails.
- `puffyLace.lift`: how far the lace crossings stand off the tongue. A lower lift makes flat laces instead of the UGG pair's puffy arches; with the high default, these thin black laces stacked into lumps.

A fingerprint of every vertex of the Buffalo boots, the UGG sneakers and the loafers is identical before and after these changes.

The black heel tab is a template `panels` entry in black.

## Colour

Measured from the side photo:

| Part | Photo (RGB) |
| --- | --- |
| Suede, heel | 187, 180, 174 |
| Suede, toe | 209, 203, 197 |
| Stripes and heel tab | about 23, 24, 26 |
| Cream sole | about 226, 220, 202 |
| Gum strip | 175, 113, 73 |

The suede was calibrated in the studio render, because her body's shadow darkens her feet there. Close-up renders without shadows had matched the photo with a much darker colour, but in the studio that colour came out 153, 145, 142. The suede now measures 198, 191, 187 in the studio front and side views, against the photo's 198, 191, 185.

## Styling facts

Recorded in the catalog entry:

- **Silhouette:** low, chunky, rounded.
- **Palette:** pale grey, black, cream and gum brown.
- **Pattern:** three side stripes and a heel tab.
- **Coverage:** closed, low cut.
- **Warmth:** 2, inferred from a closed suede upper.
- **Weather:** dry days; suede does not suit rain.

## Checks

- `npm test`: 70 passing after merging the other chats' chain sandals, black wide crop jeans and zip boots. A new shoe test checks:
  - the sole, gum strip, upper, collar, tongue and badge, heel tab and laces
  - three stripes a side on both shoes
  - black laces with no bow
  - the gum strip's height
  - that she is not raised and wears her own ankle socks

  The shared shoe test drapes or rests every pair of trousers on these trainers too.
- `npm run build` succeeds.
- Rendered close up from the outer side, a three-quarter view, the back and the front, using a temporary close-up page with the studio's lights. Also rendered in the studio with the Davinia, Mango and Nike trousers, and compared side by side with the product photos. The user has not yet seen it.

## Known differences

- The stripes' serrated edges are drawn straight.
- The trefoil on the heel tab and the “CAMPUS” lettering are not reproduced. The tongue badge is a plain disc in a ring.
- The toe and quarter seams and the perforations between the stripes are not modelled.
