// Wardrobe item: Desigual painted floral fine-knit jumper. Record: docs/garments/desigual-painted-floral-knit-jumper.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'desigual-painted-floral-knit-jumper-v1', name: 'Desigual painted floral fine-knit jumper', family: 'fine-knit-jumper', version: 1,
    // Approved by merging (the user's rule: a merged pull request means approved), so its own pull request marks it approved.
    status: 'user-approved', brandAsProvided: 'not stated; likely Desigual (the product photos match its shop)',
    source: { note: 'user supplied three product photos without a description: the front on a model with light blue wide jeans, the back on a model, and a close-up of the neck, shoulder and print' },
    referenceViews: ['front on model', 'back on model', 'neck and shoulder close-up'],
    details: ['fitted fine-knit crew-neck jumper on a black ground', 'an all-over print of big flowers in pastel pink, cream, lilac white, mint, light blue and royal blue, with flecks of ochre, knitted in as a jacquard: layered petals parted by dark creases, round dark stamen centres', 'a cream flower crossed by a dark stippled fringe, under a pink flower on the chest', 'the print runs over the back and both sleeves', 'fine rib crew neckband, the print running on into it', 'long fitted sleeves into long fine rib cuffs at the wrist', 'cropped at the waist on a fine rib hem band'],
    material: { construction: 'fine-gauge knit, jacquard print', composition: 'not stated', finish: 'smooth, matte' },
    fit: { silhouette: 'fitted, cropped at the waist', sleeve: 'long and fitted, into long rib cuffs', hem: 'at the waist, on a fine rib band', neckline: 'crew, fine rib', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the flowers are redrawn in code as stylised petal flowers at the photos\' places and colours, not copied; the real print is a photographic flower image knitted in, softer and more varied', 'cropped at her waist, ending above the jeans\' waistband as on the model; with the skirt, it ends above the skirt\'s waistband and the bow shows'],
    styling: { silhouette: 'fitted, cropped at the waist', palette: ['black', 'pastel pink', 'cream', 'lilac white', 'mint', 'light blue', 'royal blue'], pattern: 'big pastel flowers, knitted in, on black', coverage: { neck: 'crew', sleeves: 'long', midriff: 'cropped at the waist' }, material: 'fine-gauge knit, composition not stated', warmth: 2, warmthBasis: 'inferred: a fine, thin knit with long sleeves', weather: 'mild or cool days, or under a jacket' },
    authoring: { template: 'makePrintedLongTee() in src/doll/printed-long-tee.js (the printed-long-tee template)', texture: 'procedural, in src/doll/painted-floral-print.js: petal flowers placed as on the photos and knitted stitch by stitch; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makePrintedLongTee() in src/doll/printed-long-tee.js, in outfit units: the Mickey tee's fitted body
    // and sleeves, cropped at her waist on a rib band, with long rib cuffs and a rib neckband carrying the print.
    build: {
      template: 'printed-long-tee',
      colours: { band: '#080b14', sheen: '#3a3e4a' },
      body: { neck: 1.91, hem: 1.31, ribNeck: 40,
        rows: [[1.91, .109, .099], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.31, .287, .2]],
        neckband: [[1.924, .109, .1], [1.9, .114, .105]],
        band: { ribs: 64, rows: [[1.316, .289, .202], [1.28, .29, .205], [1.235, .29, .206]] } },
      sleeve: { rows: [[.025, .098, .1], [-.04, .112, .108], [-.16, .107, .101], [-.28, .104, .099], [-.4, .096, .091], [-.448, .094, .089]],
        cuff: { ribs: 24, rows: [[-.443, .091, .087], [-.49, .086, .084], [-.535, .082, .081]] } },
      // The print (painted-floral-print.js): stitch size in world units, the black ground, the inks, and the flowers on each
      // piece, painted in order (see that file for their fields).
      print: { draw: 'painted-floral', seed: 71, stitch: .0035, ground: '#080b14',
        inks: { pink: '#c49cbc', pinkLight: '#c8b4c6', pinkDeep: '#a8739b', cream: '#a49e8c', white: '#b0b6c6', lilac: '#a6aac2', mint: '#74aebb', lightBlue: '#6680a8', blue: '#2c4a8c', royal: '#081a3c', ochre: '#70623a' },
        front: [
          { at: [.08, .35], r: .108, petals: 5, ink: 'royal', tip: 'lightBlue' },
          { at: [.42, .08], r: .144, petals: 7, ink: 'white', deep: 'lilac', centre: 'lightBlue', squash: .75 },
          { at: [.22, .15], r: .072, petals: 5, ink: 'blue', deep: 'royal', tip: 'lightBlue' },
          { at: [.31, .66], r: .144, petals: 6, ink: 'mint', deep: 'lightBlue', tip: 'white', centre: 'dark' },
          { at: [.56, .36], r: .168, petals: 7, rings: 3, ruffle: .06, ink: 'pink', deep: 'pinkDeep', tip: 'pinkLight', centre: 'pinkDeep', centreSize: .08 },
          { at: [.55, .68], r: .132, petals: 6, ink: 'cream', tip: 'white', centre: 'dark', centreSize: .32 },
          { at: [.72, .84], r: .054, petals: 5, ink: 'pinkDeep', tip: 'pink' },
          { at: [.78, .2], r: .05, ink: 'ochre', speckle: .45 },
          { at: [.92, .42], r: .072, petals: 5, ink: 'cream', centre: 'dark' },
          { at: [.96, .62], r: .072, petals: 5, ink: 'blue', deep: 'royal', tip: 'lightBlue' },
        ],
        back: [
          { at: [.78, .45], r: .108, petals: 5, ink: 'royal', tip: 'lightBlue' },
          { at: [.62, .12], r: .108, petals: 6, ink: 'white', deep: 'mint', centre: 'lightBlue' },
          { at: [.2, .5], r: .06, petals: 5, ink: 'blue', deep: 'royal', tip: 'lightBlue' },
          { at: [.45, .3], r: .156, petals: 7, rings: 3, ruffle: .06, ink: 'pink', deep: 'pinkDeep', tip: 'pinkLight', centre: 'pinkDeep', centreSize: .08 },
          { at: [.58, .62], r: .12, petals: 6, ink: 'mint', deep: 'lightBlue', tip: 'white', centre: 'dark' },
          { at: [.4, .6], r: .102, petals: 6, ink: 'cream', tip: 'white', centre: 'dark', centreSize: .32 },
          { at: [.55, .88], r: .05, ink: 'ochre', speckle: .45 },
        ],
        sleeves: {
          right: [
            { at: [0, .3], r: .09, petals: 5, ink: 'royal', tip: 'lightBlue' },
            { at: [.15, .25], r: .08, petals: 6, ink: 'white', deep: 'lilac', centre: 'lightBlue' },
            { at: [.3, .6], r: .065, petals: 5, ink: 'blue', deep: 'royal', tip: 'lightBlue' },
            { at: [.1, .55], r: .09, petals: 6, ink: 'mint', deep: 'lightBlue', tip: 'white', centre: 'dark' },
            { at: [.2, .44], r: .04, petals: 5, ink: 'pink', deep: 'pinkDeep' },
            { at: [-.05, .78], r: .08, petals: 6, ink: 'cream', tip: 'white', centre: 'dark', centreSize: .3 },
          ],
          left: [
            { at: [.05, .45], r: .08, petals: 5, ink: 'royal', tip: 'lightBlue' },
            { at: [-.15, .6], r: .065, petals: 6, ink: 'white', deep: 'lilac', centre: 'lightBlue' },
            { at: [.15, .75], r: .08, petals: 6, ink: 'cream', tip: 'white', centre: 'dark', centreSize: .3 },
            { at: [0, .92], r: .065, petals: 6, ink: 'mint', deep: 'lightBlue', tip: 'white' },
            { at: [.2, .96], r: .04, ink: 'ochre', speckle: .45 },
          ],
        } },
    },
    // The study preset: added to the outfit ideas with the other top studies; the jumper fills its own slot.
    study: { name: 'Painted floral jumper study', note: 'Reference study: a fitted Desigual fine-knit jumper cropped at the waist, knitted all over with big soft pastel flowers in pink, cream, lilac white, mint and blues on black, with rib neck, cuffs and hem, over light relaxed jeans. The print is drawn from the photos, not copied.', recipe: { bottomId: 'stradivarius-relaxed-v1', shoesId: 'new-balance-550-cream-v1' } },
};
