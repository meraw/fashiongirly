// Wardrobe item: Bershka low-rise barrel jeans, black ("nero"). Record: docs/garments/bershka-low-rise-barrel-jeans.md (both colours).
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its denim swatch. Built by makeJeans() in src/doll/model.js (the jeans template), on the Topshop barrel jeans' cut.
export default {
  slot: 'bottom',
  id: 'bershka-low-rise-barrel-jeans-black-v1', name: 'Bershka low-rise barrel jeans, washed black', family: 'barrel-leg-jeans', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'Bershka (the shop page: “Jeans barrel fit a vita bassa”, colour “nero”; BERSHKA on the patch)',
  source: { note: 'user gave the Bershka product link and sent six of its photos in this colour: the front and back on a model (full length and closer), a front waist close-up, and front and back flat lays' },
  referenceViews: ['front on model', 'back flat lay', 'front flat lay', 'front waist close-up', 'back on model', 'full length on model'],
  details: ['low rise', 'wide barrel legs curving out from the hip and in again toward the hem, full length, pooling on the shoes', 'a seam twisting forward down each leg, from the hip round to the inside of the hem, met by a short seam across the outside of the knee', 'washed black denim fading to charcoal on the thighs and knees', 'five-pocket front: scoop pockets, a coin pocket and small silver rivets', 'silver shank button, belt loops and zip fly', 'back yoke and patch pockets under pointed flaps, each with a silver button', 'black leather patch on the back waistband, on her right', 'grey tonal topstitching'],
  material: { construction: 'rigid cotton denim (read from the photos)', composition: 'not visible in the supplied photos', finish: 'washed black' },
  fit: { silhouette: 'barrel', rise: 'low', length: 'full, pooling on the shoes', adjustment: 'fixed authored fit for review' },
  uncertainties: ['folds are procedural', 'the patch carries no lettering', 'pocket and seam placement adapted to the doll'],
  styling: { silhouette: 'low-rise wide barrel legs with twisted seams, full length', palette: ['washed black', 'charcoal', 'grey stitching'], pattern: 'plain denim, faded to charcoal on the thighs and knees', coverage: { waist: 'low rise, on the hips', legs: 'full length to the shoes' }, material: 'rigid denim', warmth: 2, warmthBasis: 'inferred: full-length rigid denim, roomy', weather: 'mild to cool days', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Full length: the hem rests on every pair of shoes and drapes round the boots.', unknown: ['composition and stretch'] },
  authoring: { texture: 'bershka-barrel-black-denim.js: a seamless swatch from the plain lower leg of the front flat lay (brightness variation only, coloured to the measured black)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
  // The denim swatch the 3D view loads for it.
  atlas: ['../wardrobe/bershka-barrel-black-denim.js', 'BERSHKA_BARREL_BLACK_DENIM'],
  build: {
    template: 'jeans', legName: 'barrel-leg', fallback: [31, 32, 36],
    // One repeat of the swatch covers about 12 cm of the flat lay, so about five go round her leg.
    crotch: { top: 1.2, y: .95 }, uvScale: [4.6, 3.3],
    tiles: { small: [3.5, 1.5], legs: [1, 1], hips: [1, 1] },
    // The Topshop barrel jeans' low rise and wide barrel legs, resting on the shoes, with the seams twisting forward and a
    // short seam across each knee.
    hips: [[1.22, .255, .172], [1.13, .276, .193], [1.04, .292, .198], [.97, .3, .186], [.935, .25, .11]],
    legs: [[1.03, .145, .185, .13], [.95, .158, .185, .158], [.75, .168, .188, .172], [.55, .172, .188, .176], [.35, .17, .186, .174], [.18, .167, .184, .17], [.06, .166, .183, .168]],
    hem: 'rests-on-shoe', folds: { base: .005, low: .011, stack: .011 }, twist: Math.PI / 4, kneeSeams: .64,
    // Charcoal on the thighs and knees, darkest toward the hem.
    gradient: [.82, .26], whiskers: .1, thighFade: .14,
    waistband: { y: 1.195, rx: .258, rz: .175, h: .05 },
    loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
    button: { colour: '#c9ccd0' }, thread: '#4e4e54', rivetColour: '#aeb2b8',
    fly: [[.034, 1.168], [.036, 1.08], [.02, 1.045], [0, 1.035]],
    frontPocket: { type: 'scoop', line: [[.15, 1.168], [.165, 1.125], [.2, 1.095], [.262, 1.08]] },
    coinPocket: { outline: [[-.236, 1.165], [-.19, 1.165], [-.194, 1.115], [-.233, 1.115], [-.236, 1.165]] },
    // Rivets at the pocket corners (the template mirrors them to both sides, so the coin pocket's are left out).
    rivets: [[.152, 1.165], [.262, 1.083]],
    sideSeamTop: [[.278, 1.12], [.29, 1.04]], seamEnd: .1,
    backYoke: [[.272, 1.165], [.14, 1.148], [.004, 1.13]],
    backPocket: { x: .122, outline: [[-.076, 1.11], [.076, 1.11], [.073, .99], [0, .958], [-.073, .99]], stitchBelow: 1.05,
      flap: [[-.082, 1.128], [.082, 1.128], [.08, 1.084], [0, 1.062], [-.08, 1.084]],
      flapStitch: [[-.074, 1.12], [.074, 1.12], [.072, 1.088], [0, 1.07], [-.072, 1.088], [-.074, 1.12]], button: 1.076 },
    centreBack: [[.004, 1.13], [.004, 1.05], [0, .99]],
    labelPatch: { name: 'leather-patch', size: [.085, .048, .005], colour: '#1a191b', position: [-.07, 1.2, -(.177 + .004)], rotationY: Math.PI + .27 },
  },
  // The study preset: added to the outfit ideas with the other bottom studies; the jeans fill their own slot.
  study: { name: 'Black barrel jeans study', note: 'Reference study: Bershka low-rise barrel jeans in washed black, with twisted seams, knee seams, flap back pockets and a black patch, pooling on the shoes, under the cropped red Tommy Jeans varsity jumper with the cream 550s. The denim is a swatch from the shop photos.', recipe: { topId: 'tommy-jeans-red-varsity-crest-jumper-v1', shoesId: 'new-balance-550-cream-v1' } },
};
