// Wardrobe item: Levi's Ribcage straight ankle jeans. Record: docs/garments/levis-ribcage-straight-ankle-jeans.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its denim swatch (`atlas`).
export default {
    slot: 'bottom',
    id: 'levis-ribcage-straight-ankle-jeans-v1', name: "Levi's Ribcage straight ankle jeans", family: 'straight-jeans', version: 1,
    // Merging this garment's pull request is the user's approval (their rule, 9 October 2026).
    status: 'user-approved', brandAsProvided: "Levi's (the back patch, the red tab and the arcuate stitching)",
    source: { note: 'user supplied five phone screenshots of an Amazon listing: a back close-up on a model, the front flat lay, and the front, back and side on a model' },
    referenceViews: ['back close-up on model', 'front flat lay', 'front on model', 'back on model', 'side on model'],
    details: ['ultra high rise, up to her natural waist', 'straight, fairly full legs cropped at the ankle', 'dark indigo stonewash, a little paler on the thighs and seat', 'button fly with a silver top button', 'gold topstitching, double seams, copper rivets, scoop front pockets and a coin pocket', 'back yoke and patch pockets with gold arcuate stitching', 'a red tab on the wearer\'s right back pocket', 'a tan leather patch on the back waistband'],
    material: { construction: 'rigid denim', composition: 'not visible in the supplied screenshots', finish: 'dark stonewash' },
    fit: { silhouette: 'straight', rise: 'ultra high', length: 'ankle, cropped', adjustment: 'fixed authored fit for review' },
    styling: { silhouette: 'ultra high rise, straight leg cropped at the ankle', palette: ['dark indigo'], pattern: 'plain denim', coverage: { legs: 'full, ending at the ankle' }, material: 'rigid denim', warmth: 2, warmthBasis: 'inferred: full-length rigid denim, cropped at the ankle', weather: 'most days; not for heavy rain', mood: 'classic, casual', layering: 'In the app it is worn with every top (tops that cover the waistband hang over it; the rugby shirt tucks in) and under every jacket and coat; a dress replaces it. Ankle length: the hem sits on the collar of both boots and the low sneakers, falls over the Converse high-tops\' shaft, and ends above the open sandals\' straps.', unknown: ['fibre composition'] },
    uncertainties: ['folds are procedural', 'the patch and the tab carry no lettering', 'the button fly shows as a stitched fly with one top button, as the buttons sit under the placket'],
    authoring: { texture: 'levis-ribcage-denim.js: flat-lit seamless swatch processed from the product flat lay', runtimeGeneration: false, sourcePhotosBundled: 'fabric swatch only' },
    // The denim swatch, loaded by the view (path from src/doll/view.js, export name).
    atlas: ['../wardrobe/levis-ribcage-denim.js', 'LEVIS_RIBCAGE_DENIM'],
    // Construction for makeJeans() in src/doll/model.js, in outfit units: the Tommy mom jeans' ultra high rise and seat,
    // with straight legs instead of tapered ones, and Levi's details.
    build: {
      template: 'jeans', legName: 'jeans-leg', fallback: [22, 34, 56], frayColour: '#3a4a66',
      crotch: { top: 1.12, y: .95 }, uvScale: [3.1, 2.9], tiles: { small: [2.1, 1.9], legs: [1, 1], hips: [1, 1] },
      hips: [[1.36, .268, .168], [1.27, .274, .18], [1.15, .288, .196], [1.05, .296, .2], [.97, .292, .19], [.935, .24, .1]],
      legs: [[1.03, .152, .18, .14], [.95, .156, .18, .152], [.8, .158, .178, .16], [.6, .155, .172, .164], [.42, .151, .166, .165], [.24, .147, .161, .165]],
      hem: 'ankle', folds: { base: .004, low: .008 }, gradient: [.9, .14], whiskers: .1, thighFade: .08,
      waistband: { y: 1.335, rx: .267, rz: .169, h: .05 },
      loops: [-2.6, -1.5, -.62, .62, 1.5, 2.6, Math.PI],
      button: { colour: '#c4c3bf' }, thread: '#c7883e', seamThread: '#b57b3a', doubleSeams: true, rivetColour: '#a5603a',
      fly: [[.036, 1.31], [.038, 1.16], [.022, 1.1], [0, 1.09]],
      frontPocket: { type: 'scoop', line: [[.15, 1.31], [.165, 1.255], [.2, 1.225], [.262, 1.21]] },
      coinPocket: { outline: [[-.236, 1.305], [-.19, 1.305], [-.194, 1.25], [-.233, 1.25], [-.236, 1.305]] },
      rivets: [[.152, 1.305], [.262, 1.215]],
      seamEnd: .245,
      backYoke: [[.27, 1.27], [.14, 1.235], [.004, 1.205]],
      backPocket: { x: .122, outline: [[-.08, 1.2], [.08, 1.2], [.076, 1.055], [0, 1.025], [-.076, 1.055]], stitchBelow: 1.132,
        arcuate: [.061, 1.149, .035], arcuateColour: '#c7883e', tab: { side: -1, inset: .076, y: 1.155, colour: '#c3262f' } },
      centreBack: [[.004, 1.205], [.004, 1.1], [0, 1]],
      labelPatch: { name: 'leather-patch', size: [.085, .052, .005], colour: '#a8743f', printColour: '#5e3a22', position: [-.08, 1.338, -.173], rotationY: Math.PI + .3 },
    },
    // The study preset: added to the outfit ideas with the other bottom studies.
    study: { name: "Levi's Ribcage jeans study", note: "Reference study: dark indigo Levi's Ribcage jeans, ultra high rise with straight legs cropped at the ankle, gold topstitching, copper rivets, gold arcuate stitching, the red tab and a tan leather patch, worn with the cropped Tommy Jeans varsity jumper and the New Balance 550s. The denim is taken from the product flat lay.", recipe: { topId: 'tommy-jeans-red-varsity-crest-jumper-v1', shoesId: 'new-balance-550-cream-v1', knit: false, shirt: false } },
};
