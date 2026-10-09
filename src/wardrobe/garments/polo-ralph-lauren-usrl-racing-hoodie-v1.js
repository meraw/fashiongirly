// Wardrobe item: Polo Ralph Lauren USRL racing hoodie. Record: docs/garments/polo-ralph-lauren-usrl-racing-hoodie.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'polo-ralph-lauren-usrl-racing-hoodie-v1', name: 'Polo Ralph Lauren USRL racing hoodie', family: 'colour-block-hoodie', version: 1,
    status: 'user-approved', brandAsProvided: 'Polo Ralph Lauren (read from the patches and embroidery)',
    source: { note: 'user supplied two photos without a description: the front and the back of the hoodie laid flat' },
    referenceViews: ['front, flat lay', 'back, flat lay'],
    details: ['boxy, cropped white fleece hoodie with raglan sleeves', 'colour-blocked: a white yoke between red raglan panels, then a red band, a black band and a royal blue band across the chest that run on round the sleeves, and white below', 'big cream felt appliqué letters “USRL” with a wing, on the black band', 'navy embroidered “Ralph Lauren -67-” script on her right chest', 'a round navy badge ringed in yellow with a winged “1” on her left chest', 'a cream patch with a navy eagle and “Polo Ralph Lauren” below the blue band on her left, and an “RL 67” flag patch in red, white and navy on her right', 'a yellow “R.L. Speed” patch framed in red on her left sleeve', 'a white “USRL Racing Team NYC” patch framed in red on the back of the hood', 'flat white drawcords from metal eyelets', 'white ribbed hem band and long ribbed cuffs', 'the back colour-blocked the same way, without patches'],
    material: { construction: 'cotton fleece (sweatshirt jersey), rib trims, felt appliqué, embroidery and woven patches', composition: 'not visible in the supplied photos', finish: 'matte' },
    fit: { silhouette: 'boxy and cropped', sleeve: 'long raglan sleeves, gathered into long ribbed cuffs', hem: 'cropped at the waist, ribbed band', neckline: 'hood, worn down', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the letters, embroidery and patches are redrawn in code as suggestions of the marks, not copies; their small text is drawn as lines', 'the length on her is read from the flat lay\'s proportions; it is built cropped at the waist like the cropped hoodie', 'the hood is worn down, so its patch faces back, low on the folded hood'],
    styling: { silhouette: 'boxy, cropped at the waist', palette: ['white', 'red', 'black', 'royal blue', 'cream'], pattern: 'colour-block bands with racing patches and appliqué letters', coverage: { neck: 'hood, worn down', sleeves: 'long', midriff: 'covered to the waist' }, material: 'cotton fleece', warmth: 3, warmthBasis: 'inferred: a fleece hoodie with long sleeves, though cropped', weather: 'cool, dry days; fleece soaks up rain (inferred)', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; it ends at the waist, so the waistband and the skirt\'s bow show. Under a jacket its hood and cords are put away and it wears a narrow neckband inside the jacket.', unknown: ['fibre composition'] },
    authoring: { template: 'makeRacingHoodie() in src/doll/racing-hoodie.js', texture: 'procedural, in src/doll/racing-hoodie.js: the colour blocks, letters, embroidery and patches drawn in code; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    study: { name: 'Racing hoodie study', note: 'Reference study: a cropped white Polo Ralph Lauren fleece hoodie colour-blocked in red, black and royal blue, with big USRL felt letters and racing patches, the hood worn down, with the Tommy mom jeans. The letters and patches are drawn in code, not copied.', recipe: { bottomId: 'tommy-ultra-high-mom-v1' } },
    // Construction for makeRacingHoodie(), in outfit units: the cropped hoodie's boxy body, sleeves, cuffs and hood.
    build: {
      template: 'racing-hoodie',
      colours: { fleece: '#c6c5c2', sheen: '#7d7d7d', rib: '#c3c2be', red: '#70030e', black: '#0a0b0c', blue: '#0a2a73', lining: '#bdbcb8', cord: '#eeede9', metal: '#c9c7c2',
        felt: '#c9c4ac', feltEdge: '#8f8b7e', navy: '#1f2a5c', yellow: '#e8c02a', label: '#ece6d2', frame: '#8a3a2c' },
      body: { hem: 1.27, band: .085, ribs: 90, bandRadius: [.29, .205],
        rows: [[1.905, .112, .104], [1.875, .176, .128], [1.83, .242, .163], [1.775, .286, .19], [1.65, .304, .204], [1.5, .308, .21], [1.4, .31, .216], [1.372, .306, .214], [1.36, .296, .209]],
        // Where each colour block starts, going down, and the white yoke's half-width (an angle from the centre front or
        // back) at the neck and where it meets the red band.
        blocks: { red: 1.721, black: 1.661, blue: 1.574, blueEnd: 1.515, yoke: [.56, .82] } },
      sleeve: { cuffRibs: 26,
        rows: [[.03, .12, .117], [-.06, .132, .127], [-.2, .13, .124], [-.33, .122, .117], [-.41, .112, .107], [-.44, .104, .1]],
        cuff: [[-.425, .097, .093], [-.49, .093, .09], [-.565, .092, .089]],
        // Where the sleeve's red, black and blue bands end, going down; the yellow patch on her left sleeve (+1), on its
        // outer side, at its height down the sleeve, its size and how far it turns toward the front.
        bands: [-.137, -.205, -.27], patch: { side: 1, y: -.171, size: [.06, .036], turn: 0 } },
      hood: { top: 1.89, bottom: 1.6, round: .07, halfWidth: .2, lift: .08, edge: .011, opening: { from: 1.05, rise: .05, out: .03, radius: .014, band: .04, dip: 0 } },
      cords: { x: .03, drift: .006, top: 1.875, end: 1.73, radius: .0055 },
      // Where each decoration sits (x across in outfit units, toward her left; y in outfit units) and its size in world
      // units, keeping the photos' proportions; the hood's patch is seen from behind.
      patches: { letters: { at: [.016, 1.621], size: [.356, .072] }, signature: { at: [-.098, 1.753], size: [.092, .04] },
        badge: { at: [.15, 1.779], size: [.055, .055] }, eagle: { at: [.137, 1.516], size: [.111, .058] }, flag: { at: [-.146, 1.467], size: [.095, .058] },
        hood: { at: [0, 1.66], size: [.08, .039] } },
    },
};
