// Wardrobe item: laced flame print mock-neck top, cut from a dress. Record: docs/garments/laced-flame-print-top-and-skirt.md.
// One garment per file (see src/wardrobe/garments/index.js); the entry is the same as a catalog.js entry, plus its study
// and its print atlas.
export default {
    slot: 'top',
    id: 'laced-flame-print-mockneck-top-v1', name: 'Laced flame print mock-neck top', family: 'fitted-mock-neck-long-sleeve-top', version: 1,
    // Approved when the user merges its pull request (merging means approved: the user's rule).
    status: 'user-approved', brandAsProvided: 'not stated',
    source: { note: 'user supplied four product photos of a printed lace-up mini dress (front full length, front close, shoulder close-up, back full length) and said they will cut it into a top and a skirt a little above the printed belt; this is the top' },
    referenceViews: ['front full length on model', 'front close on model', 'shoulder close-up', 'back full length on model'],
    details: ['fitted long-sleeved top in a smooth stretch jersey with a high mock neck', 'all-over print on washed black with a printed denim twill and bleached clouds: pink flame outlines and white line drawings of cute devils, horned lambs, cats, bunnies, cherubs and moon-faced girls', 'a printed lace-up stripe down the outside of each sleeve: pink laces crossing between grey eyelets on a pale band', 'real pink cords laced up the outside of each cuff, tied in a bow with long ends', 'raw cut hem at the high hip, where the user cuts the dress just above its printed belt'],
    material: { construction: 'smooth stretch jersey', composition: 'not stated', finish: 'matte, with a printed denim look' },
    fit: { silhouette: 'fitted, close to the body', sleeve: 'long and fitted to the wrist', hem: 'high hip, a raw cut edge', neckline: 'mock neck', adjustment: 'fixed authored fit for review; the hem is where the user plans to cut' },
    exclusions: ['striped-shirt','knit-sweater'],
    // Its hem covers the waistbands; worn loose, it can be tucked in like the other fitted tops.
    layering: { coversWaistband: true },
    uncertainties: ['the print is taken from the product photos, so it is softer than the real fabric and keeps a little of their shading', 'her hair hides the upper back in the back photo: there the back repeats the front\'s print from the opposite side', 'her sleeves are much plumper for their length than the model\'s, so the sleeve print is larger than the body\'s', 'the hem is where the user said they will cut; the exact line is a guess'],
    styling: { silhouette: 'fitted, high-hip length, mock neck', palette: ['washed black', 'charcoal', 'pale pink', 'white'], pattern: 'all-over print: pink flame outlines and white cartoon line drawings (devils, lambs, bunnies, cherubs) on washed black with a printed denim look', coverage: { neck: 'mock neck', sleeves: 'long', midriff: 'covered' }, material: 'stretch jersey', warmth: 2, warmthBasis: 'inferred: a fitted long-sleeved jersey with a high neck', weather: 'mild or cool days, or under a jacket', layering: 'In the app it goes under every jacket and coat, and with every bottom and the skirt; its hem hangs over every waistband and hides the skirt\'s bow, and it can be tucked in. A jacket hides its sleeves and laced cuffs. With the laced flame skirt it laps over the skirt\'s cut edge, as the dress was.', unknown: ['the fibre content', 'how the cut hem will be finished, if at all'] },
    authoring: { template: 'makeLacedPrintTop() in src/doll/laced-print-top.js', texture: 'laced-flame-top-atlas.js: the body unwrapped and the sleeves, projected from the user\'s front close and back photos with studio shading partly divided out; the sleeves\' lacing stripe is drawn', runtimeGeneration: false, sourcePhotosBundled: false },
    atlas: ['../wardrobe/laced-flame-top-atlas.js', 'LACED_FLAME_TOP_ATLAS'],
    study: { name: 'Laced flame top study', note: 'Reference study: a fitted mock-neck top cut from a printed lace-up mini dress, with pink flame outlines and cartoon line drawings on washed black, printed lacing down the sleeves and real pink cords tied at the cuffs, worn with the skirt cut from the same dress. The print is taken from the product photos.', recipe: { bottomId: 'laced-flame-print-mini-skirt-v1' } },
    // Construction for makeLacedPrintTop(), in outfit units: the Mickey tee's fitted body and sleeve rows, with the lilac
    // top's mock neck, cut at 1.19.
    build: {
      template: 'laced-print-top',
      // The share of the atlas's height that holds the body (its top 1024 rows of 1536).
      atlas: { body: 1024 / 1536 },
      colours: { printTone: '#bccad4', fallback: '#2e2c33', sheen: '#55535e', cord: '#eaa9c0' },
      body: { neckTop: 1.972, hem: 1.19,
        rows: [[1.972, .105, .1], [1.942, .107, .101], [1.905, .112, .104], [1.875, .17, .122], [1.83, .228, .152], [1.775, .265, .175], [1.65, .279, .183], [1.49, .277, .187], [1.34, .284, .196], [1.25, .29, .206], [1.19, .292, .212]] },
      sleeve: { rows: [[.025, .098, .1], [-.04, .112, .108], [-.16, .107, .101], [-.28, .104, .099], [-.4, .096, .091], [-.49, .078, .08], [-.525, .077, .079]],
        // The real lacing on the outside of the cuff: eyelet columns either side of the outside line (`half`, an angle),
        // crossing `crosses` times from `top` to `bottom`, a bow (`loop`) and its two ends (`tails`) easing `clear` away
        // from her hand.
        lacing: { top: -.415, bottom: -.505, crosses: 4, half: .19, radius: .0026, loop: .026, tails: [.15, .12], clear: .03 } },
    },
};
