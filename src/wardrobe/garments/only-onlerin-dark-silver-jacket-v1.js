// Wardrobe item: ONLY “Onlerin” dark silver jacket. Record: docs/garments/only-onlerin-dark-silver-jacket.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
  slot: 'outerwear',
  id: 'only-onlerin-dark-silver-jacket-v1', name: 'ONLY Onlerin dark silver jacket', family: 'zip-hooded-windbreaker', version: 1,
  status: 'user-approved', brandAsProvided: 'ONLY (the listing: “ONLY ONLERIN JACKET DARK SILVER”)',
  source: { note: 'user supplied three images: a shop flat lay of the front, a second-hand photo on a hanger, and a phone screenshot of a resale listing (the back on a floor, two small fronts)' },
  referenceViews: ['front flat lay (shop)', 'front on a hanger', 'back flat lay', 'front flat lays (small)'],
  details: ['crinkled metallic nylon in dark silver, crumpled all over, catching the light in bright creases', 'hood lined in black, with black drawcords at the neck', 'centre-front zip with a dark tape, from the hem to the top of the stand collar', 'raglan sleeves: seams run from the neckline down to each underarm', 'a seam across each front at about the waist, the pockets hidden in it, and side panels curving down to the hem', 'gathered elastic hem band and elastic cuffs in the shell', 'boxy, hip length'],
  material: { construction: 'coated, crinkled metallic nylon shell, black lining', composition: 'not stated', finish: 'metallic, crumpled, shiny' },
  fit: { silhouette: 'boxy and relaxed', length: 'hip, on a gathered elastic band', sleeve: 'long and relaxed, gathered at the wrist', wear: 'zipped closed (the user wears outerwear closed unless it is designed to be worn open); can be shown open' },
  // A closed jacket covers the top's sleeves and the skirt's bow.
  layering: { closed: true, coversTopSleeves: true, coversWaistband: true, canOpen: true },
  // For choosing outfits later. Observed: seen in the photos; inferred: read from the construction, not stated anywhere.
  styling: {
    observed: { palette: ['dark silver', 'black'], pattern: 'plain metallic', silhouette: 'boxy hip-length blouson on an elastic hem', coverage: 'torso and arms to the wrist; neck when zipped; hood (modelled down)', material: 'crinkled metallic nylon, black lining' },
    inferred: { warmth: 'light layer: an unpadded shell and a thin lining', weather: 'mild, breezy or cool days; the coated shell and hood suit light showers', mood: 'bold, futuristic, sporty', unknown: ['waterproofing', 'fibre composition'] },
  },
  uncertainties: ['the photos disagree on the colour (bright silver in the shop photo, darker and cooler in the second-hand ones); the name says dark silver; a darker, greenish khaki silver, matched to the photo on a hanger, is used', 'the crumples are a texture over a smooth shell, so the outline stays smooth', 'the pockets are hidden in the front seam and are not modelled', 'the hood lies down on her back; her head hides its top'],
  authoring: { template: 'makeZipWindbreaker() in src/doll/outerwear.js, with its optional metallic finish', texture: 'procedural: the seams drawn into the shell; the crinkles drawn as long soft folds, small rounded crumples and fine wrinkles; colours matched to the photo on a hanger', runtimeGeneration: false, sourcePhotosBundled: false },
  // Construction for makeZipWindbreaker() in src/doll/outerwear.js, in outfit units: the Marikoo windbreaker's boxy
  // hip-length body, sleeves, hood and gathered hem and cuffs, which cover every top and bottom.
  build: {
    template: 'zip-windbreaker', roughness: .4,
    // The metallic finish: how metal and how rough it is; the crinkle tile (crinkleData in outerwear.js: long soft folds,
    // small tilted planes with rounded edges, and many fine wrinkles) and its repeats round and down.
    metallic: { metalness: .66, roughness: .3, crinkle: { folds: 5, fold: 160, facets: 420, tilt: .4, soften: 3, wrinkles: 160, length: 80, width: 2.5, wrinkle: 6 }, repeat: [3, 1.2] },
    colours: { shell: '#868a82', yoke: '#1c1c20', stitch: '#6d6f76', snap: '#c9cbd0', cord: '#1a1a1d', zip: '#2a2a2f', opening: '#141416', lining: '#1c1c20' },
    open: { shift: .09 }, liningFinish: 'nylon',
    body: {
      rows: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .362, .28], [1.22, .362, .282], [1.16, .356, .277], [1.135, .346, .266], [1.118, .338, .258]],
      overSkirt: [[1.975, .13, .124], [1.935, .131, .125], [1.9, .14, .13], [1.875, .2, .16], [1.84, .268, .205], [1.8, .318, .24], [1.75, .345, .258], [1.65, .357, .27], [1.5, .36, .276], [1.35, .365, .282], [1.22, .374, .288], [1.16, .376, .288], [1.135, .374, .282], [1.118, .37, .276]],
      hem: 1.06, band: .06, bandRadius: [.336, .255], bandOverSkirt: [.372, .274], bandPuckers: 72,
      gathers: 34, gatherDepth: .012, gatherHeight: .09,
      collarBase: 1.89, collarTop: 1.975, collarRadius: [.13, .124],
    },
    // Seams, as seen straight on from the front or the back: the raglan seams, the seam across each front (its lower
    // edge shadowed, as a flap over the hidden pocket), and the side panels curving down from it to the hem band.
    lines: [
      { points: [[.125, 1.885], [.2, 1.77], [.335, 1.62]], mirror: true, width: .0024, shade: .78 },
      { points: [[.125, 1.885], [.2, 1.77], [.335, 1.62]], mirror: true, back: true, width: .0024, shade: .78 },
      { points: [[.03, 1.4], [.2, 1.405], [.33, 1.41]], mirror: true, width: .0026, shade: .7, shadow: .025 },
      { points: [[.3, 1.4], [.27, 1.3], [.265, 1.2], [.28, 1.13]], mirror: true, width: .0022, shade: .8 },
    ],
    sleeve: {
      rows: [[.05, .135, .126], [0, .152, .143], [-.1, .158, .15], [-.25, .156, .148], [-.38, .152, .145], [-.47, .146, .14], [-.51, .132, .127], [-.53, .121, .116]],
      cuff: [-.522, -.575], cuffRadius: [.12, .118], cuffPuckers: 36, gathers: 14, gatherDepth: .02, gatherHeight: .08,
    },
    zip: { width: .016, stitch: .02 },
    cords: { x: .05, top: 1.87, end: 1.72, drift: .01, radius: .0055 },
    hood: { top: 1.88, bottom: 1.58, round: .07, halfWidth: .21, lift: .09, edge: .011, label: false, opening: { from: .25, rise: .05, out: .03, radius: .016 } },
  },
  // The study preset: added to the outfit ideas with the other outerwear studies; the jacket fills its own slot.
  study: { name: 'Silver windbreaker study', note: 'Reference study: an ONLY windbreaker in crumpled dark silver metallic nylon, zipped closed, with a black-lined hood down, black cords, raglan seams and gathered elastic hem and cuffs, over the black Mickey tee and washed black jeans with the cream 550s. The finish is drawn procedurally.', recipe: { topId: 'black-mickey-print-long-tee-v1', bottomId: 'mango-washed-black-v1', shoesId: 'new-balance-550-cream-v1' } },
};
