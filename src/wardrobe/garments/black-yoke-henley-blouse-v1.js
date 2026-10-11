// Wardrobe item: black yoke blouse with a buttoned placket. Record: docs/garments/black-yoke-henley-blouse.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'black-yoke-henley-blouse-v1', name: 'Black yoke blouse with buttoned placket', family: 'gathered-yoke-blouse', version: 1,
    // Marked approved in its own pull request: merging it is the user's approval (their rule).
    status: 'user-approved', brandAsProvided: 'not stated',
    source: { note: 'user supplied five product photos without a description: the back and the front on a model, a flat lay, a close-up of the front, and full length with black skinny jeans' },
    referenceViews: ['back on model', 'front on model', 'front, flat lay', 'front close-up', 'full length on model'],
    details: ['boxy, collarless blouse in a soft, fluid black fabric with a faint sheen (read as viscose crepe)', 'round neckline with a narrow bound edge', 'short buttoned placket from the neckline to below the yoke, with seven small round dark buttons', 'a yoke across the chest and the upper back, the body gathered below its seam front and back', 'puffed shoulders, the sleeve heads gathered', 'full three-quarter sleeves gathered into narrow bands below the elbow', 'hem at the high hip, worn loose over the jeans'],
    material: { construction: 'woven, fluid (read from the drape)', composition: 'not stated', finish: 'soft, with a faint sheen' },
    fit: { silhouette: 'boxy, gathered below a yoke', sleeve: 'three-quarter, full, puffed at the shoulder and gathered into a band', hem: 'high hip, straight, worn loose', neckline: 'round, collarless, with a short buttoned placket', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Hangs over every waistband; over the skirt it is tucked in, as the yoke shirt is. It can be tucked into trousers too
    // (a blouse, though not a shirt or tee by its family). Below the sleeve bands her forearm is bare.
    layering: { coversWaistband: true, tucksIntoSkirt: true, tuck: true, bareArmBelow: -.43 },
    uncertainties: ['the brand and fibre are not given; the fabric is read from the drape', 'the band\'s fastening (a small button at the back of the band in one photo) is not drawn'],
    styling: { silhouette: 'boxy, gathered below a yoke, to the high hip', palette: ['black'], pattern: 'plain', coverage: { neck: 'round, collarless', sleeves: 'three-quarter', midriff: 'covered, to the high hip' }, material: 'fluid woven fabric (read as viscose crepe)', warmth: 1, warmthBasis: 'inferred: a light, fluid blouse with three-quarter sleeves', weather: 'mild days, or under a jacket', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband, and it can be tucked into trousers; over the skirt it is tucked in. Her forearms are bare below the sleeve bands.', unknown: ['fibre composition'] },
    authoring: { template: 'makeYokeBlouse() in src/doll/yoke-blouse.js', texture: 'procedural crepe bump in src/doll/yoke-blouse.js; colour measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    study: { name: 'Black yoke blouse study', note: 'Reference study: a boxy black blouse gathered below a yoke, with a round neck, a short buttoned placket, puffed shoulders and three-quarter sleeves gathered into bands, worn loose over washed black jeans.', recipe: { bottomId: 'mango-washed-black-v1' } },
    // Construction for makeYokeBlouse(), in outfit units: the yoke shirt's boxy body to a hem at the high hip, which clears
    // every waistband, and its tucked shape over the skirt.
    build: {
      template: 'yoke-blouse',
      colours: { fabric: '#1b191d', sheen: '#6a6670', stitch: '#232126', button: '#3a383d' },
      body: {
        rows: [[1.905, .112, .104], [1.875, .172, .126], [1.83, .232, .157], [1.775, .272, .181], [1.65, .29, .193], [1.5, .294, .202], [1.4, .3, .21], [1.3, .307, .219], [1.2, .314, .229], [1.14, .32, .233]],
        tucked: [[1.905, .112, .104], [1.875, .172, .126], [1.83, .232, .157], [1.775, .272, .181], [1.65, .29, .193], [1.5, .294, .202], [1.4, .3, .21], [1.33, .292, .205], [1.26, .29, .205]] },
      // The yoke's seam at the front and back (measured from the photos down from the neck), and the gathers below it.
      yoke: { front: 1.765, back: 1.75, folds: 48, depth: .009 },
      // The placket's top and bottom, its half-width and its buttons' heights and size.
      placket: { top: 1.9, bottom: 1.59, half: .011, button: .0075, buttons: [1.875, 1.832, 1.789, 1.746, 1.703, 1.66, 1.617] },
      // Full sleeves from a puffed head to a narrow band below the elbow, the sleeve running on inside the band; the gathers
      // at the head and into the band.
      sleeve: { rows: [[.03, .115, .113], [-.03, .138, .134], [-.12, .146, .142], [-.22, .146, .142], [-.3, .14, .136], [-.35, .126, .122], [-.38, .106, .102], [-.395, .095, .093], [-.43, .094, .092]],
        band: [[-.388, .099, .097], [-.41, .098, .096], [-.432, .097, .095]],
        puff: { folds: 16, depth: .025, reach: .07 }, gather: { folds: 18, depth: .025, reach: .09 } },
    },
};
