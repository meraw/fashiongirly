// Wardrobe item: Mango “Claudia” slim crop jeans. Record: docs/garments/mango-claudia-slim-crop-jeans.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its denim swatch. Built by makeJeans() in src/doll/model.js (the jeans template).
export default {
  slot: 'bottom',
  id: 'mango-claudia-slim-crop-jeans-v1', name: 'Mango Claudia slim crop jeans', family: 'slim-cropped-jeans', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'Mango (the shop listing: “Jeans Claudia slim crop”, Mango Outlet Italia)',
  source: { note: 'user supplied one phone screenshot of the shop listing: a front flat lay, with two small thumbnails (a front waist close-up and the back)' },
  referenceViews: ['front flat lay (shop)', 'front waist (thumbnail)', 'back (thumbnail)'],
  details: ['high rise', 'slim legs tapering to a cropped hem at the ankle', 'washed black denim fading to charcoal on the thighs, darkest at the hem', 'five-pocket front: scoop pockets and a coin pocket, no visible rivets', 'silver shank button and belt loops', 'tonal grey topstitching', 'back yoke and patch pockets (from the small back thumbnail)', 'clean stitched hem'],
  material: { construction: 'stretch denim (read from the slim fit; not stated)', composition: 'not visible in the supplied screenshot', finish: 'washed black' },
  fit: { silhouette: 'slim, tapered', rise: 'high', length: 'cropped at the ankle', adjustment: 'fixed authored fit for review' },
  uncertainties: ['only one front photo; the back is read from a small thumbnail', 'no leather patch is visible in the thumbnail, so none is modelled', 'folds are procedural', 'the denim swatch comes from a small shop photo, so its grain is coarse'],
  styling: { silhouette: 'slim tapered legs, cropped at the ankle, high rise', palette: ['washed black', 'charcoal'], pattern: 'plain denim, faded slightly at the thighs', coverage: { legs: 'to the ankle' }, material: 'denim', warmth: 2, warmthBasis: 'inferred: denim, cropped at the ankle', weather: 'mild to cool days', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Ankle length: the hem sits on the collar of both boots and the low sneakers, falls over the Converse high-tops\' shaft, and ends above the open sandals\' straps.', unknown: ['fibre composition', 'stretch (read from the slim fit, not stated)'] },
  authoring: { texture: 'mango-claudia-denim.js: a seamless swatch from the plain lower leg of the shop photo (brightness variation only, coloured to the measured washed black)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
  // The denim swatch the 3D view loads for it.
  atlas: ['../wardrobe/mango-claudia-denim.js', 'MANGO_CLAUDIA_DENIM'],
  build: {
    template: 'jeans', legName: 'jeans-leg', fallback: [30, 29, 34],
    // One repeat of the swatch covers about 10 cm of the photo, so about five go round her leg.
    crotch: { top: 1.12, y: .95 }, uvScale: [5, 3.8],
    tiles: { small: [3.75, 1.75], legs: [1, 1], hips: [1, 1] },
    // High rise, as the Mango washed black jeans.
    hips: [[1.31, .264, .168], [1.2, .274, .186], [1.1, .288, .196], [1.02, .296, .198], [.97, .298, .19], [.935, .24, .1]],
    // Slim legs tapering from the thigh to a cropped hem at her ankle, above the shoes.
    legs: [[1.03, .15, .18, .135], [.95, .15, .174, .15], [.8, .14, .162, .155], [.6, .126, .146, .157], [.42, .115, .135, .158], [.27, .108, .128, .158]],
    hem: 'ankle', folds: { base: .004, low: .007 }, gradient: [.74, .3], whiskers: .12, thighFade: .14,
    waistband: { y: 1.285, rx: .266, rz: .17, h: .05 },
    loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
    // Tonal grey topstitching, a little paler than the denim; no rivets show on the front.
    button: { colour: '#c9ccd0' }, thread: '#3d3d43', doubleSeams: true, hemStitch: .014,
    fly: [[.036, 1.26], [.038, 1.13], [.022, 1.085], [0, 1.075]],
    frontPocket: { type: 'scoop', line: [[.15, 1.26], [.165, 1.21], [.2, 1.18], [.262, 1.165]] },
    coinPocket: { outline: [[-.236, 1.255], [-.19, 1.255], [-.194, 1.2], [-.233, 1.2], [-.236, 1.255]] },
    seamEnd: .275,
    // A back yoke over square patch pockets, as in the back thumbnail.
    backYoke: [[.272, 1.255], [.14, 1.235], [.004, 1.215]],
    backPocket: { x: .12, outline: [[-.068, 1.2], [.068, 1.2], [.065, 1.085], [0, 1.065], [-.065, 1.085]], stitchBelow: 1.18 },
    centreBack: [[.004, 1.215], [.004, 1.1], [0, 1.0]],
  },
  // The study preset: added to the outfit ideas with the other bottom studies; the jeans fill their own slot.
  study: { name: 'Claudia jeans study', note: 'Reference study: Mango Claudia jeans in washed black, high-rise and slim, cropped at the ankle, with tonal stitching and a silver button, under the cropped red Tommy Jeans varsity jumper with the cream 550s. The denim is a swatch from the shop photo.', recipe: { topId: 'tommy-jeans-red-varsity-crest-jumper-v1', shoesId: 'new-balance-550-cream-v1' } },
};
