// Wardrobe item: Tommy Jeans red varsity crest jumper. Record: docs/garments/tommy-jeans-varsity-crest-jumper.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study.
export default {
    slot: 'top',
    id: 'tommy-jeans-red-varsity-crest-jumper-v1', name: 'Tommy Jeans red varsity crest jumper', family: 'cropped-knit-jumper', version: 1,
    status: 'user-approved', brandAsProvided: 'Tommy Jeans (the knitted-in lettering and crest)',
    source: { note: 'user supplied two product photos without a description: the front and the back on a model, over light jeans' },
    referenceViews: ['front on model', 'back on model'],
    details: ['boxy, cropped jumper in a heathered red knit flecked with lighter yarn', 'knitted in off-white across the front: TOMMY JEANS in worn varsity capitals, arched over an oval crest', 'the crest: a ring lettered TOMMY JEANS, MANHATTAN and NEW YORK round a shield with a big T and a crown, small TOMMY and JEANS banners, 1985, and a VARSITY CHAMPS ribbon across its foot', 'a ribbed mock neck', 'dropped shoulders, full sleeves gathered into long rib cuffs', 'a deep rib hem band ending at the waistband of high-rise jeans', 'plain back'],
    material: { construction: 'fine-gauge jacquard knit with rib trims', composition: 'not stated', finish: 'soft, slightly fuzzy heathered red' },
    fit: { silhouette: 'boxy and cropped', sleeve: 'long and full, dropped shoulders, long rib cuffs', hem: 'cropped at the waist, deep rib band', neckline: 'ribbed mock neck', adjustment: 'fixed authored fit for review' },
    exclusions: ['striped-shirt','knit-sweater'],
    uncertainties: ['the lettering and crest are redrawn in code in a simple stroke lettering with slab serifs, not the brand\'s typeface or artwork; the crest\'s details are simplified', 'the motif is fitted to her wider, shorter torso: it is a little squatter than on the model', 'her big head hides most of the mock neck, as with the other high necks'],
    styling: { silhouette: 'boxy, cropped at the waist', palette: ['red', 'off-white'], pattern: 'varsity lettering and crest on the front', coverage: { neck: 'mock neck', sleeves: 'long', midriff: 'cropped at the waist' }, material: 'knit, composition unknown', warmth: 3, warmthBasis: 'inferred: a knit jumper with a mock neck and long sleeves, though cropped', weather: 'cool, dry days', mood: 'sporty, collegiate, bold', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; it ends at the waist, so the waistband and the skirt\'s bow show.', unknown: ['fibre composition'] },
    authoring: { template: 'makeSweatshirt() in src/doll/sweatshirt.js (the logo-sweatshirt template)', texture: 'procedural heathered knit; the lettering and crest drawn in code in src/doll/varsity-crest.js; colours measured from the photos', runtimeGeneration: false, sourcePhotosBundled: false },
    // Construction for makeSweatshirt() in src/doll/sweatshirt.js, in outfit units: the chenille jumper's boxy cropped body
    // and sleeves, which clear every bottom; a mock neck; and the crest in place of the batwing logo.
    build: {
      template: 'logo-sweatshirt',
      colours: { fleece: '#a00610', fleck: ['#c84a50', .03], sheen: '#a8202a' },
      body: { neck: 1.905, hem: 1.27, band: .09, ribs: 64, neckRibs: 48, seed: 11, neckName: 'ribbed-mock-neck', neckRoll: true,
        rows: [[1.905, .112, .104], [1.875, .176, .128], [1.83, .242, .163], [1.775, .286, .19], [1.65, .304, .204], [1.5, .308, .21], [1.4, .31, .216]],
        blouse: [.306, .214], bandRadius: [.29, .205], bandOverSkirt: [.29, .205],
        neckband: [[1.975, .11, .104], [1.945, .112, .105], [1.915, .116, .109], [1.885, .121, .113]] },
      sleeve: { cuffRibs: 26,
        rows: [[.03, .12, .117], [-.06, .132, .127], [-.2, .13, .124], [-.33, .122, .117], [-.41, .112, .107], [-.44, .104, .1]],
        cuff: [[-.425, .097, .093], [-.49, .093, .09], [-.565, .092, .089]] },
      // The print, drawn by drawVarsityCrest() in src/doll/varsity-crest.js. Its width is in world units and its top in
      // outfit units; everything else is in print widths (x across, y down from its top). The lettering arches from a
      // straight top down to a bottom that rises `lift` toward the middle, worn by broken red streaks; the crest's ring
      // texts run clockwise between angles (degrees from the top).
      logo: { kind: 'varsity-crest', seed: 3, width: .44, top: 1.85, height: .8, margin: .04, ink: '#ddd3c7', inkFlecks: .05,
        arch: { text: 'TOMMY JEANS', left: .01, right: .99, top: 0, topArch: 0, bottom: .28, lift: .1, stroke: .015, streaks: 420, streakShare: .16, streakRuns: 6 },
        crest: { centre: [.5, .48], radii: [.2, .235], band: .055, line: .005, textSize: .032, textStroke: .0042,
          ringText: [['TOMMY JEANS', -50, 50], ['·', 56, 56], ['MANHATTAN', 62, 132], ['NEW YORK', -128, -62], ['·', -56, -56]],
          shield: { centre: [.5, .42], size: [.15, .16], t: [.75, .62, .12] }, crown: [.07, .04],
          scrolls: [['TOMMY', .39, .47], ['JEANS', .53, .61]], scrollY: .56, scrollDip: .012, smallSize: .02, year: { text: '1985', at: [.5, .605], width: .06 },
          ribbon: { y: .695, sag: .025, half: .2, height: .05, text: 'VARSITY CHAMPS', textSize: .03, tail: .05, tailDrop: .03 } } },
    },
    // The study preset: added to the outfit ideas with the other top studies; the jumper fills its own slot.
    study: { name: 'Varsity crest jumper study', note: 'Reference study: a boxy, cropped Tommy Jeans jumper in heathered red with TOMMY JEANS arched in off-white over a varsity crest, a mock neck, long rib cuffs and a deep rib hem, worn with the Tommy mom jeans and the cream Converse high-tops. The lettering and crest are drawn in code, not copied.', recipe: { bottomId: 'tommy-ultra-high-mom-v1', shoesId: 'converse-modern-lift-hi-egret-v1' } },
};
