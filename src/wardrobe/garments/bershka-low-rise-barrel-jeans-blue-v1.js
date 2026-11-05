// Wardrobe item: Bershka low-rise barrel jeans, mid blue ("azzurro"). Record: docs/garments/bershka-low-rise-barrel-jeans.md (both colours).
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its denim swatch. Built by makeJeans() in src/doll/model.js (the jeans template), on the Topshop barrel jeans' cut.
export default {
  slot: 'bottom',
  id: 'bershka-low-rise-barrel-jeans-blue-v1', name: 'Bershka low-rise barrel jeans, vintage blue', family: 'barrel-leg-jeans', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'Bershka (the shop page: “Jeans barrel fit a vita bassa”, colour “azzurro”; BERSHKA on the patch)',
  source: { note: 'user gave the Bershka product link and sent six of its photos in this colour: back and front flat lays, back and front waist close-ups on a model, and the front on a model (full length and closer)' },
  referenceViews: ['back flat lay', 'front flat lay', 'back pocket close-up', 'front waist close-up', 'full length on model', 'front on model'],
  details: ['low rise', 'wide barrel legs curving out from the hip and in again toward the hem, full length, pooling on the shoes', 'a seam twisting forward down each leg, from the hip round to the inside of the hem, met by a short seam across the outside of the knee', 'mid-blue vintage wash: faded pale on the thighs and knees, darker and bluer toward the hem, with whiskers and a fine twill', 'five-pocket front: scoop pockets, a coin pocket and small silver rivets', 'silver shank button, belt loops and zip fly', 'back yoke and patch pockets under pointed flaps, each with a silver button', 'tan leather patch embossed BERSHKA on the back waistband, on her right', 'copper topstitching'],
  material: { construction: 'rigid cotton denim (read from the photos)', composition: 'not visible in the supplied photos', finish: 'vintage mid-blue wash' },
  fit: { silhouette: 'barrel', rise: 'low', length: 'full, pooling on the shoes', adjustment: 'fixed authored fit for review' },
  uncertainties: ['folds are procedural', 'the patch carries no lettering', 'the fading is drawn as the template\'s fade (paler on the thighs and knees, darker toward the hem); the photo\'s shift to a bluer hem is not modelled', 'pocket and seam placement adapted to the doll'],
  styling: { silhouette: 'low-rise wide barrel legs with twisted seams, full length', palette: ['mid blue', 'faded blue-grey', 'copper stitching'], pattern: 'vintage wash: faded on the thighs and knees, whiskered', coverage: { waist: 'low rise, on the hips', legs: 'full length to the shoes' }, material: 'rigid denim', warmth: 2, warmthBasis: 'inferred: full-length rigid denim, roomy', weather: 'mild to cool days', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Full length: the hem rests on every pair of shoes and drapes round the boots.', unknown: ['composition and stretch'] },
  authoring: { texture: 'bershka-barrel-blue-denim.js: a seamless swatch of the twill from the front waist close-up (brightness variation only, at half contrast, coloured to the measured blue)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
  // The denim swatch the 3D view loads for it.
  atlas: ['../wardrobe/bershka-barrel-blue-denim.js', 'BERSHKA_BARREL_BLUE_DENIM'],
  build: {
    template: 'jeans', legName: 'barrel-leg', fallback: [54, 72, 88],
    // One repeat of the swatch covers about 8 cm of the close-up, so about seven go round her leg.
    crotch: { top: 1.2, y: .95 }, uvScale: [6.5, 4.7],
    tiles: { small: [4.9, 2.2], legs: [1, 1], hips: [1, 1] },
    // The Topshop barrel jeans' low rise and wide barrel legs, resting on the shoes, with the seams twisting forward and a
    // short seam across each knee.
    hips: [[1.22, .255, .172], [1.13, .276, .193], [1.04, .292, .198], [.97, .3, .186], [.935, .25, .11]],
    legs: [[1.03, .145, .185, .13], [.95, .158, .185, .158], [.75, .168, .188, .172], [.55, .172, .188, .176], [.35, .17, .186, .174], [.18, .167, .184, .17], [.06, .166, .183, .168]],
    hem: 'rests-on-shoe', folds: { base: .005, low: .011, stack: .011 }, twist: Math.PI / 4, kneeSeams: .64,
    // Faded pale on the thighs and knees, much darker toward the hem, with whiskers at the top of the thighs.
    gradient: [.5, .72], whiskers: .2, thighFade: .3,
    waistband: { y: 1.195, rx: .258, rz: .175, h: .05 },
    loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
    button: { colour: '#c9ccd0' }, thread: '#b8803f', rivetColour: '#aeb2b8',
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
    labelPatch: { name: 'leather-patch', size: [.085, .048, .005], colour: '#9a6a40', position: [-.07, 1.2, -(.177 + .004)], rotationY: Math.PI + .27 },
  },
  // The study preset: added to the outfit ideas with the other bottom studies; the jeans fill their own slot.
  study: { name: 'Blue barrel jeans study', note: 'Reference study: Bershka low-rise barrel jeans in a faded vintage blue, with twisted seams, knee seams, copper stitching, flap back pockets and a tan patch, pooling on the shoes, under the Desigual painterly patchwork tee with the grey Campus 00s. The denim is a swatch from the shop photos.', recipe: { topId: 'desigual-painterly-patchwork-vneck-tee-v1', shoesId: 'adidas-campus-00s-grey-v1' } },
};
