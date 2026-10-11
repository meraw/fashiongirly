// Wardrobe item: Bershka low-rise balloon jeans. Record: docs/garments/bershka-low-rise-balloon-jeans.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its denim swatch. Built by makeJeans() in src/doll/model.js (the jeans template).
export default {
  slot: 'bottom',
  id: 'bershka-low-rise-balloon-jeans-v1', name: 'Bershka low-rise balloon jeans', family: 'balloon-leg-jeans', version: 1,
  // Merging the pull request is the user's approval (their rule), so the garment's own pull request marks it approved.
  status: 'user-approved', brandAsProvided: 'Bershka (the shop listing: “Bershka Low-rise Wide-leg Balloon Jeans”, Myntra)',
  source: { note: 'user supplied one phone screenshot of the shop listing: the front on a model, with a pale pink tee and white heeled sandals' },
  referenceViews: ['front on model (shop)'],
  details: ['low rise', 'wide balloon legs, fullest round the knee, curving in to the ankle', 'each ankle gathered on a drawcord channel and tied in a small bow on the outside, the ends hanging', 'dark rinse indigo denim with a faint vertical slub', 'cream contrast topstitching, a seam curving forward down each leg', 'five-pocket front: scoop pockets, a coin pocket and small silver rivets', 'belt loops, a silver shank button and a zip fly'],
  material: { construction: 'rigid denim (read from the photo; not stated)', composition: 'not visible in the supplied screenshot', finish: 'dark rinse' },
  fit: { silhouette: 'balloon', rise: 'low', length: 'ankle, gathered on ties', adjustment: 'fixed authored fit for review' },
  uncertainties: ['only one front photo; the back (pockets and yoke) is assumed to be a standard five-pocket back', 'folds are procedural', 'the denim swatch comes from a small shop photo, so its grain is soft', 'the ties are read as narrow self-fabric cords in the dark denim'],
  styling: { silhouette: 'low-rise balloon legs, gathered and tied at the ankle', palette: ['dark indigo', 'cream stitching'], pattern: 'plain rinse denim with contrast stitching', coverage: { waist: 'low rise, on the hips', legs: 'to the ankle' }, material: 'denim', warmth: 2, warmthBasis: 'inferred: full-length rigid denim, roomy', weather: 'mild or cool days', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Gathered at the ankle: the hem sits on the collar of both boots and the sneakers, goes over the Converse high-tops, and ends above the loafers, slides and sandals.', unknown: ['the back pockets and yoke (only the front is shown)', 'composition and stretch', 'how the user wears the ties'] },
  authoring: { texture: 'bershka-balloon-denim.js: a seamless swatch from the plain lower leg of the shop photo (brightness variation only, coloured to the measured indigo)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
  // The denim swatch the 3D view loads for it.
  atlas: ['../wardrobe/bershka-balloon-denim.js', 'BERSHKA_BALLOON_DENIM'],
  build: {
    template: 'jeans', legName: 'balloon-leg', fallback: [27, 36, 51],
    // One repeat of the swatch covers about 7 cm across and 22 cm down the photo's leg.
    crotch: { top: 1.2, y: .95 }, uvScale: [8, 2.7],
    tiles: { small: [3.75, 1.75], legs: [1, 1], hips: [1, 1] },
    // Low rise, as the Topshop barrel jeans.
    hips: [[1.22, .255, .172], [1.13, .276, .193], [1.04, .292, .198], [.97, .3, .186], [.935, .25, .11]],
    // Balloon legs: the barrel jeans' thighs (inside every long top, the striped cardigan included), fullest round the knee, curving in below the calf and gathered at her ankle.
    legs: [[1.03, .145, .185, .13], [.95, .158, .185, .158], [.75, .168, .19, .173], [.55, .18, .206, .184], [.42, .174, .2, .182], [.33, .152, .18, .176], [.27, .124, .15, .17], [.245, .115, .14, .168], [.215, .115, .14, .168]],
    hem: 'ankle', folds: { base: .006, low: .012, stack: .004 }, twist: Math.PI / 5,
    // The gathers at the drawcord channel, the self-fabric bow on the outside of each ankle, and the channel's stitching.
    cuff: { top: .26, count: 14, depth: .01 }, hemStitch: .022, ankleTies: { colour: '#2a3550', above: .026, length: .055, forward: .35 },
    // Dark rinse: even, barely faded, with only a hint of whiskers and roping.
    gradient: [.95, .08], whiskers: .04, roping: .5,
    waistband: { y: 1.195, rx: .258, rz: .175, h: .05 },
    loops: [-2.7, -1.45, -.55, .55, 1.45, 2.7, Math.PI],
    button: { colour: '#c9ccd0' }, thread: '#d6ccb4', doubleSeams: true,
    rivets: [[.155, 1.175], [.262, 1.1]], rivetColour: '#c9ccd0',
    fly: [[.034, 1.168], [.036, 1.08], [.02, 1.045], [0, 1.035]],
    frontPocket: { type: 'scoop', line: [[.15, 1.17], [.165, 1.125], [.2, 1.095], [.262, 1.08]] },
    coinPocket: { outline: [[-.236, 1.165], [-.19, 1.165], [-.194, 1.115], [-.233, 1.115], [-.236, 1.165]] },
    sideSeamTop: [[.278, 1.12], [.29, 1.04]], seamEnd: .25,
    backYoke: [[.272, 1.165], [.14, 1.148], [.004, 1.13]],
    backPocket: { x: .122, outline: [[-.07, 1.11], [.07, 1.11], [.067, .995], [0, .975], [-.067, .995]], stitchBelow: 1.09 },
    centreBack: [[.004, 1.13], [.004, 1.05], [0, .99]],
  },
  // The study preset: added to the outfit ideas with the other bottom studies; the jeans fill their own slot.
  study: { name: 'Balloon jeans study', note: 'Reference study: Bershka low-rise balloon jeans in dark rinse indigo with cream topstitching, wide legs gathered and tied at the ankle, with the cropped painted floral jumper and the Dr. Martens chain sandals. The denim is taken from the product photo.', recipe: { topId: 'desigual-painted-floral-knit-jumper-v1', shoesId: 'dr-martens-blaire-quad-chain-v1' } },
};
