// Wardrobe item: Mango Sienna flare crop jeans. Record: docs/garments/mango-sienna-flare-crop-jeans.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'bottom',
    id: 'mango-sienna-flare-crop-jeans-v1', name: 'Mango Sienna white flare crop jeans', family: 'high-rise-flare-cropped-jeans', version: 1,
    // Approved when the user merges its pull request (merging means approved: the user's rule).
    status: 'user-approved', brandAsProvided: 'Mango',
    source: { note: 'user supplied two phone screenshots of Google image results for the Mango "Jeans Sienna flare crop" (Mango Italia and Mango México), without text: front and back on a model' },
    referenceViews: ['front on model', 'back on model'],
    details: ['high rise', 'slim through the hips and thighs, narrowest at the knee and flaring gently to the hem', 'cropped just above the ankle with a raw frayed hem', 'white denim, smooth and plain', 'five-pocket front with scoop pockets and a coin pocket', 'silver shank button with a dark centre and small dark rivets', 'back yoke, centre-back seam and plain back patch pockets', 'tonal white stitching'],
    material: { construction: 'cotton denim, smooth and slightly stretchy-looking', composition: 'not visible in the supplied screenshots', finish: 'clean white, unwashed look' },
    fit: { silhouette: 'slim kick flare', rise: 'high', length: 'cropped just above the ankle', adjustment: 'fixed authored fit for review' },
    uncertainties: ['the composition and the exact shade (white or off-white) are not stated; the photos\' cool cast comes from the studio, so the colour is set to a soft white', 'the screenshots are small, so the denim\'s grain is faint and partly drawn by the shared twill', 'folds are procedural', 'no label patch or embroidery is visible; the back waistband may carry a label the photos do not show'],
    styling: {
      silhouette: 'high-rise slim kick flare, cropped at the ankle', palette: ['white'], pattern: 'plain',
      coverage: { legs: 'to just above the ankle', waist: 'high' }, material: 'cotton denim',
      warmth: 2, warmthBasis: 'inferred: denim, with the ankle bare below the cropped hem',
      weather: 'mild to warm, dry days; the white shows rain spots and dirt, and the open hem lets the cold in',
      layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Cropped flare: the hem sits on the collar of both boots and the pink Superstars, and ends above or falls round the other shoes.',
      unknown: ['fibre composition', 'stretch'],
    },
    authoring: { texture: 'mango-sienna-denim.js: flat-lit seamless swatch from the plain thigh in the front photo (brightness variation only, coloured to a measured soft white)', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    atlas: ['../wardrobe/mango-sienna-denim.js', 'MANGO_SIENNA_DENIM'],
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [223, 223, 221], frayColour: '#f3f1ec',
      crotch: { top: 1.1, y: .95 }, uvScale: [7, 6.4],
      tiles: { small: [6, 2.8], legs: [1, 1], hips: [1, 1] },
      hips: [[1.31, .262, .168], [1.2, .27, .184], [1.1, .28, .19], [1.02, .276, .178], [.97, .262, .162], [.935, .2, .085]],
      // Slim through the hips and thighs, narrowest at the knee, then a gentle kick flare to a raw hem just above her ankle.
      // The hems sit a little out over her feet, so over chunky boots they rest on the collar rather than crowding each other.
      legs: [[1.12, .13, .165, .128], [1.03, .132, .162, .13], [.95, .128, .155, .137], [.8, .12, .142, .148], [.64, .111, .129, .155], [.53, .11, .127, .157], [.43, .119, .134, .162], [.31, .145, .156, .165]],
      hem: 'raw-crop', folds: { base: .003, low: .005 }, gradient: [.95, .07], whiskers: .05, thighFade: 0,
      waistband: { y: 1.285, rx: .266, rz: .17, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      // A silver shank button and small dark rivets; tonal stitching, a shade deeper than the denim so the seams read.
      button: { colour: '#7c7f86' }, thread: '#d4d0c6', doubleSeams: true, rivetColour: '#2e2f33',
      fly: [[.036, 1.26], [.038, 1.13], [.022, 1.085], [0, 1.075]],
      frontPocket: { type: 'scoop', line: [[.15, 1.26], [.165, 1.21], [.2, 1.18], [.262, 1.165]] },
      coinPocket: { outline: [[-.236, 1.255], [-.19, 1.255], [-.194, 1.2], [-.233, 1.2], [-.236, 1.255]] },
      rivets: [[.152, 1.255], [.262, 1.17]],
      seamEnd: .33,
      backYoke: [[.268, 1.225], [.14, 1.205], [.004, 1.18]],
      backPocket: { x: .12, outline: [[-.07, 1.165], [.07, 1.165], [.067, 1.04], [0, 1.015], [-.067, 1.04]], stitchBelow: 1.11 },
      centreBack: [[.004, 1.18], [.004, 1.08], [0, 1.0]],
    },
    // The study preset: added to the outfit ideas with the other bottom studies; the jeans fill their own slot.
    study: { name: 'Sienna flare crop study', note: 'Reference study: high-rise white Mango jeans, slim through the thigh and flaring gently to a raw frayed hem just above her ankle, with a silver button, dark rivets and tonal stitching, worn with a black top as in the photos. The denim is taken from the product photo.', recipe: { topId: 'adidas-originals-cropped-hoodie-black-v1' } },
};
