# Reference test: Desigual blue crochet flower sweater

Authored 8 October 2026. Status: first interpretation; approved: the user merged it, and merging means approved (their rule).

## Source and reference reading

The user supplied a product page link: <https://www.desigual.com/it_IT/26SWJFXG.html> (“maglione all’uncinetto con fiori”, SKU 26SWJFXG5050). The page and its photos were fetched during authoring; an earlier ASOS link for the same garment could not be fetched (see the handoff). Photos are not bundled in the repository or the app.

The page provides four distinct views: front on a model, a back three-quarter view, a front flat lay and a street action shot. Its text says regular fit, crew neck, long sleeves and “100% cotone”, while its composition section says 60% cotton, 40% acrylic. The composition section is treated as more reliable. The model's skirt, bouquet and hair are not part of the garment.

Features read from the photos:

- Joined hexagonal crochet flower motifs in four kinds: navy petals around a spoked turquoise centre, pale-blue petals with a navy centre, cream petals with a navy centre, and small solid navy wheels.
- Open cream lace between motifs.
- A broad scoop neck finished with a wide filet-crochet band of open squares (the page calls it a crew neck; the photos show a wider neckline).
- Cropped, boxy body ending at the waist with a scalloped edge.
- Long, slightly flared sleeves reaching the knuckles, also with scalloped edges.
- Dropped shoulders with a ladder-stitch join at the shoulder and down the sleeve.

## Implementation

Catalog ID `desigual-crochet-flowers-v1`. Unlike the two printed tops, this garment has no bundled image atlas. `crochetData()` in `src/doll/model.js` draws the motif repeat locally the first time it is worn: a seamless hexagonal lattice of nine motifs by four offset rows, with the transparent openwork in the texture's alpha channel (`alphaTest`). `filetData()` draws the neckband ladder rows. No AI or network request is involved at runtime.

- Body: boxy shell cropped at 1.285 with 12 scallops on the hem and a cream edge trim. It ends just above the skirt waistband, so the pleated skirt layers underneath without clipping.
- Neckband: separate shell sitting lower and wider than the earlier tops' collars, so it shows below the doll's large head.
- Sleeves: flared tubes that extend past the body hem and cover the top of the mitten, with 7 scallops and trim per cuff. Five motifs fit around each sleeve. The repeat's seam is turned to the inner back of the arm.
- Yarn colours are set darker than the photographed yarn because the studio's exposure and tone mapping brighten them. Sheen is low for a matte cotton look.

## Checks

- `npm test`: 16 passing. The elbow-clearance test now runs for every catalog garment. A new test checks the openwork fraction, scalloped hem, both cuff trims and that the hem stays outside the skirt waistband.
- `npm run build` succeeds.
- Rendered in headless Chromium (software WebGL) from the front, side, back and a slight turn, alone with ecru jeans and over the lilac skirt with indigo jeans. These renders were reviewed by the authoring chat, not the user. They do not replace phone/device review.

## Known differences

- The motif layout is a regular procedural repeat. It is not a stitch-for-stitch copy and does not reproduce the exact arrangement in the photos.
- Scallops follow an even spacing, not individual motif edges.
- Dropped shoulders and the ladder seams at the shoulder and down the sleeve are not modelled.
- The upper back and back neckline are hidden by hair in the back photo; the back uses the same motif repeat and neckband as the front.
- On this compact doll the short arms make the top read wider and more cape-like than on the photographed model.
